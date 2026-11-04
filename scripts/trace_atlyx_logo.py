"""Extract logo silhouettes from the 2D ATLYX mark for 3D reconstruction."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(r"D:\student form\lms-portal-new\lms-portal")
SRC = ROOT / "public" / "atlyx-logo.png"
OUT = ROOT / "scripts" / "_logo_trace.png"


def largest_contours(mask: np.ndarray, min_area: int = 200):
    labeled, n = ndimage.label(mask)
    contours = []
    for i in range(1, n + 1):
        component = labeled == i
        area = int(component.sum())
        if area < min_area:
            continue
        # Boundary via erosion
        eroded = ndimage.binary_erosion(component)
        border = component & ~eroded
        ys, xs = np.where(border)
        # Order border pixels by walking
        pts = order_boundary(xs, ys, component)
        contours.append((area, pts))
    contours.sort(key=lambda c: -c[0])
    return contours


def order_boundary(xs, ys, component):
    pts = list(zip(xs.tolist(), ys.tolist()))
    if not pts:
        return np.zeros((0, 2))
    start = min(pts, key=lambda p: (p[1], p[0]))
    used = set()
    ordered = [start]
    used.add(start)
    neigh = [
        (1, 0), (1, 1), (0, 1), (-1, 1),
        (-1, 0), (-1, -1), (0, -1), (1, -1),
    ]
    cur = start
    h, w = component.shape
    for _ in range(len(pts) + 10):
        found = None
        for dx, dy in neigh:
            nx, ny = cur[0] + dx, cur[1] + dy
            if (nx, ny) in used:
                continue
            if 0 <= ny < h and 0 <= nx < w and component[ny, nx]:
                # must be border
                if any(
                    not component[ny + oy, nx + ox]
                    for ox, oy in neigh
                    if 0 <= ny + oy < h and 0 <= nx + ox < w
                ) or True:
                    if (nx, ny) in set(pts) or (component[ny, nx] and not (
                        0 < ny < h - 1 and 0 < nx < w - 1 and component[ny-1:ny+2, nx-1:nx+2].all()
                    )):
                        found = (nx, ny)
                        break
        if found is None:
            break
        ordered.append(found)
        used.add(found)
        cur = found
        if len(ordered) > len(pts):
            break
    return np.array(ordered, dtype=float)


def simplify(pts, tol=2.0):
    if len(pts) < 3:
        return pts
    # Ramer-Douglas-Peucker
    def rdp(points, epsilon):
        if len(points) < 3:
            return points
        start, end = points[0], points[-1]
        line = end - start
        length = np.linalg.norm(line)
        if length < 1e-6:
            dists = np.linalg.norm(points - start, axis=1)
        else:
            n = line / length
            rel = points - start
            proj = rel @ n
            closest = start + np.outer(np.clip(proj, 0, length), n)
            dists = np.linalg.norm(points - closest, axis=1)
        i = int(np.argmax(dists))
        if dists[i] > epsilon:
            left = rdp(points[: i + 1], epsilon)
            right = rdp(points[i:], epsilon)
            return np.vstack([left[:-1], right])
        return np.vstack([start, end])

    closed = np.vstack([pts, pts[0]])
    simp = rdp(closed, tol)
    if np.allclose(simp[0], simp[-1]):
        simp = simp[:-1]
    return simp


def main():
    im = Image.open(SRC).convert("RGBA")
    a = np.array(im)
    rgb = a[:, :, :3].astype(np.int16)
    mask = rgb.sum(axis=2) > 40
    print("mask", mask.sum(), "shape", mask.shape)

    labeled, n = ndimage.label(mask)
    print("components", n)
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        print(f"  comp {i}: area={len(xs)} bbox=({xs.min()},{ys.min()})-({xs.max()},{ys.max()})")

    # Extract outer contour of full mask using marching-squares-ish via binary_fill
    # Use scipy.ndimage to find holes too
    filled = ndimage.binary_fill_holes(mask)
    hole = filled & ~mask
    print("hole pixels", hole.sum())

    contours = largest_contours(mask, min_area=80)
    print("contour count", len(contours))
    debug = Image.fromarray(a)
    draw = ImageDraw.Draw(debug)
    colors = [(255, 0, 0), (0, 255, 0), (0, 128, 255), (255, 255, 0)]
    for idx, (area, pts) in enumerate(contours[:6]):
        simp = simplify(pts, tol=2.5)
        print(f"contour {idx} area={area} raw={len(pts)} simp={len(simp)}")
        print("  pts:", np.round(simp, 1).tolist())
        if len(simp) >= 2:
            xy = [tuple(p) for p in simp] + [tuple(simp[0])]
            draw.line(xy, fill=colors[idx % 4], width=2)
            for p in simp:
                draw.ellipse((p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2), fill=colors[idx % 4])
    debug.save(OUT)
    print("saved", OUT)


if __name__ == "__main__":
    main()
