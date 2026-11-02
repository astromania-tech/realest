import unittest

from trust_reader.fields import detect_document_type, document_fact, extract_fields, type_matches

COFO = """CERTIFICATE OF OCCUPANCY
Name of holder: Ada Lovelace
Plot 12, Block 4
Location: Lekki, Lagos
Date: 12 March 2020
This grant covers the parcel described above and is issued for residential use.
"""

LEASE = """LEASE AGREEMENT
Lessee: Grace Hopper
Location: Wuse, Abuja
12 January 2024
The lessee occupies the flat described in this lease agreement for a term of one year.
"""


class FieldTests(unittest.TestCase):
    def test_cofo_fields_and_type(self):
        self.assertEqual(detect_document_type(COFO), "certificate_of_occupancy")
        fields = extract_fields(COFO)
        self.assertEqual(fields["holderName"], "Ada Lovelace")
        self.assertEqual(fields["plotOrTitleNumber"], "12")
        self.assertEqual(fields["locationText"], "Lekki, Lagos")
        self.assertEqual(fields["issueDate"], "12 March 2020")

    def test_title_slot_accepts_a_certificate_of_occupancy(self):
        self.assertTrue(type_matches("title_deed", "certificate_of_occupancy"))
        self.assertFalse(type_matches("title_deed", "lease_agreement"))
        self.assertTrue(type_matches("survey", "survey_plan"))

    def test_lease_does_not_satisfy_a_title_claim(self):
        fact = document_fact(LEASE, "title_deed", None)
        self.assertTrue(fact["readable"])
        self.assertEqual(fact["detectedType"], "lease_agreement")
        self.assertFalse(fact["typeMatch"])

    def test_short_text_is_unreadable(self):
        fact = document_fact("hello", "title_deed", None)
        self.assertFalse(fact["readable"])
        self.assertEqual(fact["readerError"], "low_text")

    def test_missing_ocr_stays_unreadable(self):
        fact = document_fact("", "title_deed", "ocr_unavailable")
        self.assertFalse(fact["readable"])
        self.assertEqual(fact["readerError"], "ocr_unavailable")
        self.assertIsNone(fact["fields"]["holderName"])


if __name__ == "__main__":
    unittest.main()
