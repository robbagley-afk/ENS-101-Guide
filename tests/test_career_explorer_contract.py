import unittest

from tests.app_harness import app


class Ens101CareerExplorerContractTests(unittest.TestCase):
    def test_ens101_is_a_mentor_presentation_of_the_shared_facts(self):
        data = {
            "holland_code": "IRC",
            "personality": {"Emotional Stability": "high"},
            "primary_values": ["Achievement"],
        }
        output = app.offline_career_explorer_python_engine("Prepare", "prep-guidance", [], data)
        self.assertTrue(output.startswith("## Student Summary"))
        self.assertIn("caring and empathetic", output)
        self.assertIn("problem-solving", output)
        self.assertTrue(output.endswith(app.BRIEF_SUMMARY_CLOSING))
        # Brief summary never names the scales behind it.
        for term in ("HEXACO", "Holland", "IRC", "Emotional Stability", "high"):
            self.assertNotIn(term, output)
        self.assertNotIn("Emotional Stability", output)
        guidance = app.generate_career_guidance("", "", "", data)
        self.assertEqual(guidance["holland_code"], "IRC")
        self.assertTrue(guidance["aligned_careers"])

    def test_ens101_recommendations_receive_the_supplied_holland_code(self):
        reply = app.offline_career_explorer_python_engine("Prepare", "prep-notes", [], {"holland_code": "IRC"})
        self.assertIn("Systems Analyst", reply)
        self.assertNotIn("Human Resources Coordinator", reply)

    def test_ens101_prompt_uses_the_canonical_terminology_contract(self):
        prompt = app.CAREER_EXPLORER_SYSTEM_PROMPT
        self.assertIn("PERSONALITY WORDING — MANDATORY", prompt)
        self.assertIn("Emotional Sensitivity: [score]", prompt)
        self.assertIn("Plain Language for Volunteer Coaches", prompt)
        # The only HEXACO mention allowed is the instruction never to write it.
        self.assertEqual(prompt.count("HEXACO"), 2)
        self.assertNotIn("Low Emotional Stability", app.CAREER_EXPLORER_SYSTEM_PROMPT)


if __name__ == "__main__":
    unittest.main()
