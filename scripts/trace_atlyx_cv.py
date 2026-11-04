"""Extract clean polygonal outlines of the ATLYX logo with OpenCV."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(r"D:\student form\lms-portal-new\lms-portal")
SRC = ROOT / "public" / "atlyx-logo.png"
OUT = ROOT / "scripts" / "_logo_trace_cv.png"


def main():
    im = np.array(Image.open(SRC).convert("RGBA"))
    rgb = im[:, :, :3]
    gray = rgb.sum(axis=2)
    mask = (gray > 40).astype(np.uint8) * 255

    contours, hier = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)
    print("n contours", len(contours))

    debug = Image.fromarray(im)
    draw = ImageDraw.Draw(debug)
    colors = [(255, 32, 32), (32, 255, 64), (64, 160, 255)]

    all_polys = []
    for i, c in enumerate(contours[:4]):
        area = cv2.contourArea(c)
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.004 * peri, True)
        pts = approx.reshape(-1, 2).astype(float)
        print(f"contour {i} area={area:.0f} peri={peri:.1f} verts={len(pts)}")
        print(np.round(pts, 1).tolist())
        all_polys.append(pts)
        xy = [tuple(p) for p in pts] + [tuple(pts[0])]
        draw.line(xy, fill=colors[i % 3], width=2)
        for j, p in enumerate(pts):
            draw.ellipse((p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3), fill=colors[i % 3])
            draw.text((p[0] + 4, p[1] - 10), str(j), fill=(255, 255, 0))

    debug.save(OUT)
    print("saved", OUT)

    # Also dump a slightly tighter / looser approx
    print("\n--- tighter ---")
    for i, c in enumerate(contours[:4]):
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.0025 * peri, True)
        pts = approx.reshape(-1, 2).astype(float)
        print(f"contour {i} verts={len(pts)}")
        print(np.round(pts, 1).tolist())


if __name__ == "__main__":
    main()
