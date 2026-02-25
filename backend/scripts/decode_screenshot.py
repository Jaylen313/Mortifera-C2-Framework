"""Decode base64 screenshot to PNG file"""
import base64
import sys

if len(sys.argv) < 2:
    print("Usage: python decode_screenshot.py <base64_file>")
    sys.exit(1)

base64_file = sys.argv[1]

try:
    with open(base64_file, "r") as f:
        base64_data = f.read().strip()

    image_bytes = base64.b64decode(base64_data)

    output_file = "screenshot_decoded.png"
    with open(output_file, "wb") as f:
        f.write(image_bytes)

    print(f"✅ Screenshot saved: {output_file}")
    print(f"📂 Size: {len(image_bytes) / 1024:.2f} KB")

except Exception as e:
    print(f"❌ Error: {e}")
