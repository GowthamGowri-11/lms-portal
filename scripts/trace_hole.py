from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw

src = Path(r"D:\student form\lms-portal-new\lms-portal\public\atlyx-logo.png")
im = np.array(Image.open(src).convert("RGBA"))
gray = im[:, :, :3].sum(axis=2)
mask = (gray > 40).astype(np.uint8) * 255
contours, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
print("hier", hier)
for i, c in enumerate(contours):
    parent = hier[0][i][3] if hier is not None else -1
    print(i, "area", cv2.contourArea(c), "parent", parent, "verts", len(c))

# Flood from a point inside the A triangle
h, w = mask.shape
inside = np.zeros_like(mask)
# guess hole center
cx, cy = 240, 230
print("pixel at guess", im[cy, cx])
# The hole is black, so invert and find components that are black and not background
inv = (mask == 0).astype(np.uint8)
num, lab, stats, cents = cv2.connectedComponentsWithStats(inv, 8)
print("black components", num)
for i in range(num):
    print(i, "area", stats[i, cv2.CC_STAT_AREA], "centroid", cents[i],
          "bbox", stats[i, cv2.CC_STAT_LEFT], stats[i, cv2.CC_STAT_TOP],
          stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT])
