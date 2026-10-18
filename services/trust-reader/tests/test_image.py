import io
import unittest

from PIL import Image

from trust_reader.image_facts import classify_image_text, dhash_hex, gps_to_degrees, image_fact


def png_bytes(color: tuple[int, int, int]) -> bytes:
    image = Image.new("RGB", (32, 32), color)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


class ImageTests(unittest.TestCase):
    def test_same_pixels_share_a_dhash(self):
        image = Image.new("RGB", (32, 32), (20, 80, 40))
        self.assertEqual(dhash_hex(image), dhash_hex(image.copy()))

    def test_horizontal_contrast_changes_the_dhash(self):
        dark = Image.new("L", (32, 32), 0)
        bars = Image.new("L", (32, 32), 0)
        for x in range(32):
            if x % 2 == 0:
                for y in range(32):
                    bars.putpixel((x, y), 255)
        self.assertNotEqual(dhash_hex(dark), dhash_hex(bars))

    def test_screenshot_text_is_not_a_property_photo(self):
        photo, reason = classify_image_text("this is a screenshot of a listing")
        self.assertEqual(photo, "no")
        self.assertEqual(reason, "screenshot")

    def test_empty_ocr_does_not_claim_a_building(self):
        photo, reason = classify_image_text("")
        self.assertEqual(photo, "unknown")
        self.assertIsNone(reason)

    def test_gps_south_west_is_negative(self):
        lat = gps_to_degrees((6, 25, 0), "N")
        lng = gps_to_degrees((3, 24, 0), "E")
        self.assertAlmostEqual(lat, 6.416666, places=5)
        self.assertAlmostEqual(lng, 3.4, places=5)
        self.assertLess(gps_to_degrees((6, 0, 0), "S"), 0)

    def test_png_fact_has_a_hash_and_no_false_building_claim(self):
        fact = image_fact(png_bytes((30, 90, 40)), "", None)
        self.assertTrue(fact["readable"])
        self.assertEqual(len(fact["dHashHex"]), 16)
        self.assertEqual(fact["propertyPhoto"], "unknown")
        self.assertIsNone(fact["exifGps"])


if __name__ == "__main__":
    unittest.main()
