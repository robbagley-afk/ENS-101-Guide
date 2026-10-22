import os
import tempfile
import time
import unittest
from http import HTTPStatus
from pathlib import Path
from unittest.mock import patch

from tests.app_harness import LocalServer, app

PDF = b"%PDF-1.4\n" + b"0" * 1000


class StudentReportRouteTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="ens101-report-"))
        self.root = self.tmp / "ens-101-mentor-desk"
        (self.root / "downloads").mkdir(parents=True)
        patcher = patch.object(app, "ROOT_DIR", self.root)
        patcher.start()
        self.addCleanup(patcher.stop)

    def _write(self, name, body=PDF, age=0):
        path = self.root / "downloads" / name
        path.write_bytes(body)
        stamp = time.time() - age
        os.utime(path, (stamp, stamp))
        return path

    def test_returns_only_the_requested_students_pdf(self):
        self._write("alex.sample_ensign.edu_report.pdf", PDF + b"alex", age=100)
        # Newer file for another student must never be served instead.
        self._write("jordan.sample_ensign.edu_report.pdf", PDF + b"jordan")
        with LocalServer() as server:
            status, _, raw = server.request("POST", "/api/student-report", {"email": "Alex.Sample@ensign.edu"})
        self.assertEqual(status, HTTPStatus.OK)
        self.assertTrue(raw.endswith(b"alex"))

    def test_missing_report_is_404_not_another_student(self):
        self._write("jordan.sample_ensign.edu_report.pdf")
        with LocalServer() as server:
            status, body, _ = server.request("POST", "/api/student-report", {"email": "alex.sample@ensign.edu"})
        self.assertEqual(status, HTTPStatus.NOT_FOUND)
        self.assertEqual(body["status"], "not_found")

    def test_invalid_email_is_rejected(self):
        with LocalServer() as server:
            status, body, _ = server.request("POST", "/api/student-report", {"email": "alex@example.com"})
        self.assertEqual(status, HTTPStatus.BAD_REQUEST)

    def test_email_is_never_put_in_the_report_url(self):
        js = (Path(__file__).resolve().parents[1] / "static" / "app.js").read_text()
        self.assertIn("fetch('/api/student-report'", js)
        self.assertNotIn("/api/student-report?", js)


if __name__ == "__main__":
    unittest.main()
