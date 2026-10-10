"""feedback.db must stay out of cloud-synced folders."""
import unittest
from pathlib import Path

from tests import app_harness  # noqa: F401  sets ENS101_DB_PATH to a temp file
import app


class ResolveDbPathTest(unittest.TestCase):
    def test_local_checkout_keeps_db_next_to_app(self):
        root = Path("/Users/someone/CCowork-Local-Apps/ENS101")
        self.assertEqual(app.resolve_db_path(root, {}), root / "feedback.db")

    def test_cloud_synced_checkout_moves_db_to_local_disk(self):
        root = Path("/Users/someone/Library/CloudStorage/OneDrive-Personal/CCowork/ENS101")
        got = app.resolve_db_path(root, {}, home="/Users/someone")
        self.assertEqual(got, Path("/Users/someone/Local-Infra/app-data/ENS101/feedback.db"))
        self.assertNotIn("CloudStorage", got.parts)

    def test_env_override_wins(self):
        root = Path("/Users/someone/Library/CloudStorage/OneDrive-Personal/x")
        got = app.resolve_db_path(root, {"ENS101_DB_PATH": "/tmp/custom/feedback.db"})
        self.assertEqual(got, Path("/tmp/custom/feedback.db"))

    def test_blank_override_is_ignored(self):
        root = Path("/srv/app")
        self.assertEqual(app.resolve_db_path(root, {"ENS101_DB_PATH": "  "}), root / "feedback.db")


if __name__ == "__main__":
    unittest.main()
