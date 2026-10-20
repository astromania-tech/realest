import io
import unittest

from PIL import Image

from trust_reader.image_facts import classify_image_text, dhash_hex, gps_to_degrees, image_fact
from trust_reader.photo_classifier import CLASSIFIER_VERSION, classify_scene


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

    def test_empty_ocr_leaves_the_scene_check_to_decide(self):
        photo, reason = classify_image_text("")
        self.assertEqual(photo, "unknown")
        self.assertIsNone(reason)

    def test_gps_south_west_is_negative(self):
        lat = gps_to_degrees((6, 25, 0), "N")
        lng = gps_to_degrees((3, 24, 0), "E")
        self.assertAlmostEqual(lat, 6.416666, places=5)
        self.assertAlmostEqual(lng, 3.4, places=5)
        self.assertLess(gps_to_degrees((6, 0, 0), "S"), 0)

    def test_a_flat_png_is_not_a_property_photo(self):
        fact = image_fact(png_bytes((30, 90, 40)), "", None)
        self.assertTrue(fact["readable"])
        self.assertEqual(len(fact["dHashHex"]), 16)
        self.assertEqual(fact["propertyPhoto"], "no")
        self.assertEqual(fact["propertyPhotoReason"], "flat")
        self.assertIsNone(fact["exifGps"])
        self.assertEqual(CLASSIFIER_VERSION, "scene-1")

    def test_a_facade_is_a_building_and_a_field_is_land(self):
        building = Image.new("RGB", (128, 128), (135, 180, 220))
        for y in range(50, 128):
            for x in range(128):
                building.putpixel((x, y), (190, 160, 130))
        for y in range(60, 110, 20):
            for x in range(16, 110, 24):
                for dy in range(10):
                    for dx in range(12):
                        building.putpixel((x + dx, y + dy), (40, 40, 50))
        self.assertEqual(classify_scene(building), ("yes", "building"))

        land = Image.new("RGB", (128, 128), (70, 140, 40))
        for x in range(0, 128, 10):
            for y in range(128):
                for dx in range(4):
                    land.putpixel((x + dx, y), (20, 70, 20))
        self.assertEqual(classify_scene(land), ("yes", "land"))

    def test_a_white_page_with_rules_is_a_document(self):
        page = Image.new("RGB", (128, 128), (250, 250, 250))
        for y in range(8, 120, 6):
            for x in range(8, 110):
                page.putpixel((x, y), (10, 10, 10))
        self.assertEqual(classify_scene(page), ("no", "document_page"))


if __name__ == "__main__":
    unittest.main()
