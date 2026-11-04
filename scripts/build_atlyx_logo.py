"""
Build a genuine 3D ATLYX emblem (angular A + lightning) as a GLB.

Geometry is reconstructed from the 2D mark and 3D reference — not a
text extrusion and not a textured plane.
"""
from __future__ import annotations

import json
import math
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import Polygon
from trimesh.creation import triangulate_polygon

ROOT = Path(r"D:\student form\lms-portal-new\lms-portal")
OUT_GLB = ROOT / "public" / "models" / "atlyx-logo.glb"
PREV_DIR = ROOT / "scripts" / "_logo_previews"
REF_DST = ROOT / "public" / "references" / "atlyx-3d-reference.png"
REF_SRC = ROOT / "public" / "images" / "atlyx-3d-monument.png"

# ---------------------------------------------------------------------------
# Source polygons in 2D logo pixel space (500x500, origin top-left).
# Traced from public/atlyx-logo.png via OpenCV, then cleaned to sharp corners.
# ---------------------------------------------------------------------------
# Exterior silhouette only (A-window is a closed hole, as in the 3D reference).
MAIN_OUTER_IMG = np.array(
    [
        [427.0, 175.0],  # lightning tip
        [323.0, 229.0],  # lightning underside
        [255.0, 276.0],  # bolt inner
        [202.0, 387.0],  # down-spike tip
        [201.0, 378.0],
        [224.0, 323.0],
        [221.0, 315.0],  # crotch right
        [176.0, 315.0],  # crotch left
        [148.0, 359.0],  # left foot inner
        [97.0, 358.0],  # left foot outer
        [102.0, 341.0],
        [225.0, 138.0],  # A peak left
        [271.0, 138.0],  # A peak right
        [319.0, 218.0],  # lightning root (top)
    ],
    dtype=np.float64,
)

# Closed triangular A counter, slightly inset from the 2D inner edges
# so bevel/facet offsets stay manifold.
MAIN_HOLE_IMG = np.array(
    [
        [246.0, 198.0],  # apex
        [214.0, 252.0],  # left
        [248.0, 258.0],  # bottom notch
        [272.0, 236.0],  # right
    ],
    dtype=np.float64,
)

RIGHT_IMG = np.array(
    [
        [344.0, 263.0],  # top
        [315.0, 292.0],  # left upper
        [315.0, 299.0],  # left
        [351.0, 358.0],  # bottom left
        [399.0, 359.0],  # bottom right
        [401.0, 351.0],  # right lower
        [354.0, 274.0],  # right upper
        [348.0, 265.0],  # top-right
    ],
    dtype=np.float64,
)

# World scale: logo height ~ 2.0
IMG_BBOX = (97.0, 136.0, 427.0, 387.0)
CX = (IMG_BBOX[0] + IMG_BBOX[2]) * 0.5
CY = (IMG_BBOX[1] + IMG_BBOX[3]) * 0.5
SCALE = 2.0 / (IMG_BBOX[3] - IMG_BBOX[1])
THICKNESS = 0.40
BEVEL = 0.016
FACET = 0.020
WALL_INSET = 0.008


def img_to_xy(pts: np.ndarray) -> np.ndarray:
    xy = np.empty_like(pts)
    xy[:, 0] = (pts[:, 0] - CX) * SCALE
    xy[:, 1] = (CY - pts[:, 1]) * SCALE
    return xy


def signed_area(pts: np.ndarray) -> float:
    x, y = pts[:, 0], pts[:, 1]
    return 0.5 * float(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))


def ensure_ccw(pts: np.ndarray) -> np.ndarray:
    return pts if signed_area(pts) > 0 else pts[::-1].copy()


def ensure_cw(pts: np.ndarray) -> np.ndarray:
    return pts if signed_area(pts) < 0 else pts[::-1].copy()


def inset_ring(pts: np.ndarray, dist: float, outward: bool = False) -> np.ndarray:
    """Mitered offset. `pts` should be CCW for a solid outer ring."""
    n = len(pts)
    out = np.zeros_like(pts)
    sign = -1.0 if outward else 1.0
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        v1 = p1 - p0
        v2 = p2 - p1
        n1 = np.array([-v1[1], v1[0]], dtype=np.float64)
        n2 = np.array([-v2[1], v2[0]], dtype=np.float64)
        ln1 = np.linalg.norm(n1)
        ln2 = np.linalg.norm(n2)
        if ln1 < 1e-9 or ln2 < 1e-9:
            out[i] = p1
            continue
        n1 /= ln1
        n2 /= ln2
        bis = n1 + n2
        bl = np.linalg.norm(bis)
        if bl < 1e-6:
            out[i] = p1 + sign * dist * n1
            continue
        bis /= bl
        denom = float(np.dot(bis, n1))
        if abs(denom) < 0.25:
            denom = 0.25 if denom >= 0 else -0.25
        miter = sign * dist / denom
        miter = float(np.clip(miter, -dist * 4.0, dist * 4.0))
        out[i] = p1 + bis * miter
    return out


def triangulate(outer: np.ndarray, holes: list[np.ndarray] | None = None) -> np.ndarray:
    """Ear-clip triangulation. Returns (T, 3) indices into concatenated verts.
    Vertex layout: outer, then each hole.
    """
    holes = holes or []
    verts = [outer]
    hole_ranges = []
    base = len(outer)
    for h in holes:
        hole_ranges.append((base, base + len(h)))
        verts.append(h)
        base += len(h)
    all_pts = np.vstack(verts)
    # Build polygon loops as index lists
    outer_idx = list(range(len(outer)))
    hole_idxs = [list(range(a, b)) for a, b in hole_ranges]

    # Link holes to outer via Steiner bridges (max-x hole vertex -> visible outer)
    loops = [outer_idx]
    for h in hole_idxs:
        pts_h = all_pts[h]
        i_local = int(np.argmax(pts_h[:, 0]))
        h_i = h[i_local]
        hp = all_pts[h_i]
        # Find an outer vertex to the right that doesn't cross edges
        best = None
        best_d = 1e9
        for oi in loops[0]:
            op = all_pts[oi]
            if op[0] < hp[0] - 1e-6:
                continue
            d = float(np.linalg.norm(op - hp))
            if d < best_d:
                best_d = d
                best = oi
        if best is None:
            # fallback: closest outer
            d = np.linalg.norm(all_pts[loops[0]] - hp, axis=1)
            best = loops[0][int(np.argmin(d))]
        # Rotate hole so it starts at h_i, then splice into outer at `best`
        hi = h.index(h_i)
        h_rot = h[hi:] + h[:hi]
        o = loops[0]
        pos = o.index(best)
        loops[0] = o[: pos + 1] + h_rot + [h_i, best] + o[pos + 1 :]

    ring = loops[0]
    faces = earclip(all_pts, ring)
    return np.array(faces, dtype=np.int32)


def point_in_tri(p, a, b, c) -> bool:
    v0, v1, v2 = c - a, b - a, p - a
    den = v0[0] * v1[1] - v1[0] * v0[1]
    if abs(den) < 1e-12:
        return False
    u = (v2[0] * v1[1] - v1[0] * v2[1]) / den
    v = (v0[0] * v2[1] - v2[0] * v0[1]) / den
    return u >= -1e-9 and v >= -1e-9 and (u + v) <= 1 + 1e-9


def earclip(pts: np.ndarray, ring: list[int]) -> list[list[int]]:
    idx = list(ring)
    faces: list[list[int]] = []
    guard = 0
    while len(idx) > 3 and guard < 10000:
        guard += 1
        n = len(idx)
        clipped = False
        for i in range(n):
            i0, i1, i2 = idx[(i - 1) % n], idx[i], idx[(i + 1) % n]
            a, b, c = pts[i0], pts[i1], pts[i2]
            cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
            if cross <= 1e-12:
                continue  # not a CCW ear
            ear = True
            for j in idx:
                if j in (i0, i1, i2):
                    continue
                if point_in_tri(pts[j], a, b, c):
                    ear = False
                    break
            if not ear:
                continue
            faces.append([i0, i1, i2])
            idx.pop(i)
            clipped = True
            break
        if not clipped:
            # fallback: force a triangle
            faces.append([idx[0], idx[1], idx[2]])
            idx.pop(1)
    if len(idx) == 3:
        faces.append(idx)
    return faces


class MeshBuilder:
    def __init__(self):
        self.positions: list[list[float]] = []
        self.normals: list[list[float]] = []
        self.colors: list[list[float]] = []
        self.indices: list[int] = []

    def add_face(self, verts: np.ndarray, normal: np.ndarray | None = None):
        """Add a triangle or quad (as two tris). verts shape (3 or 4, 3)."""
        if normal is None:
            e1 = verts[1] - verts[0]
            e2 = verts[2] - verts[0]
            n = np.cross(e1, e2)
            ln = np.linalg.norm(n)
            n = n / ln if ln > 1e-12 else np.array([0.0, 0.0, 1.0])
        else:
            n = normal / (np.linalg.norm(normal) + 1e-12)
        base = len(self.positions)
        for v in verts:
            self.positions.append(v.tolist())
            self.normals.append(n.tolist())
            self.colors.append(color_at(v[0], v[1], v[2]))
        if len(verts) == 3:
            self.indices.extend([base, base + 1, base + 2])
        else:
            self.indices.extend([base, base + 1, base + 2, base, base + 2, base + 3])

    def add_tris(self, pts3: np.ndarray, faces: np.ndarray, z_normal_sign: float):
        for f in faces:
            v = pts3[list(f)]
            e1 = v[1] - v[0]
            e2 = v[2] - v[0]
            n = np.cross(e1, e2)
            if n[2] * z_normal_sign < 0:
                v = v[[0, 2, 1]]
            self.add_face(v)

    def add_strip_sides(self, a: np.ndarray, b: np.ndarray, za0, za1, zb0, zb1):
        """Connect two 2D rings at possibly different z values. a/b (N,2)."""
        n = len(a)
        for i in range(n):
            j = (i + 1) % n
            v00 = np.array([a[i, 0], a[i, 1], za0])
            v10 = np.array([a[j, 0], a[j, 1], za0 if np.ndim(za0) == 0 else za0])
            # za0/za1 scalars
            p0 = np.array([a[i, 0], a[i, 1], za0], dtype=np.float64)
            p1 = np.array([a[j, 0], a[j, 1], za0], dtype=np.float64)
            p2 = np.array([b[j, 0], b[j, 1], zb1], dtype=np.float64)
            p3 = np.array([b[i, 0], b[i, 1], zb1], dtype=np.float64)
            # If za and zb differ per-endpoint use zb0 too when rings match 1:1
            p2 = np.array([b[j, 0], b[j, 1], zb1], dtype=np.float64)
            p3 = np.array([b[i, 0], b[i, 1], zb0], dtype=np.float64)
            self.add_face(np.stack([p0, p1, p2, p3]))


def color_at(x: float, y: float, z: float) -> list[float]:
    """Bright cyan (top / lightning) -> electric blue -> violet (bottom-left)."""
    yn = float(np.clip((y + 1.05) / 2.15, 0, 1))
    xn = float(np.clip((x + 1.35) / 2.7, 0, 1))
    purple = np.array([0.72, 0.22, 1.00])
    blue = np.array([0.12, 0.48, 1.00])
    cyan = np.array([0.18, 0.95, 1.00])
    t = yn ** 0.9
    col = (1 - t) * ((1 - t) * purple + t * blue) + t * ((1 - t) * blue + t * cyan)
    col = col * (1 - 0.45 * xn) + cyan * (0.45 * xn)
    col = col * (1 - 0.35 * (1 - yn) * (1 - xn)) + purple * (0.35 * (1 - yn) * (1 - xn))
    # Rim highlights on beveled z-extremes
    rim = min(1.0, abs(abs(z) - THICKNESS * 0.5) / (FACET + BEVEL + 1e-6))
    col = col * (1 - 0.12 * rim) + np.array([0.75, 0.98, 1.0]) * (0.12 * rim)
    col = np.clip(col * 1.12, 0, 1)
    return [float(col[0]), float(col[1]), float(col[2]), 1.0]


def shapely_rings(geom):
    if geom.is_empty:
        return np.zeros((0, 2)), []
    poly = max(geom.geoms, key=lambda g: g.area) if geom.geom_type == "MultiPolygon" else geom
    exterior = np.array(poly.exterior.coords, dtype=np.float64)
    if np.allclose(exterior[0], exterior[-1]):
        exterior = exterior[:-1]
    holes = []
    for interior in poly.interiors:
        h = np.array(interior.coords, dtype=np.float64)
        if np.allclose(h[0], h[-1]):
            h = h[:-1]
        holes.append(h)
    return ensure_ccw(exterior), [ensure_cw(h) for h in holes]


def wall_ring(ring: np.ndarray, z0: float, z1: float, reverse: bool, mb: MeshBuilder):
    n = len(ring)
    for i in range(n):
        j = (i + 1) % n
        p0 = np.array([ring[i, 0], ring[i, 1], z0])
        p1 = np.array([ring[j, 0], ring[j, 1], z0])
        p2 = np.array([ring[j, 0], ring[j, 1], z1])
        p3 = np.array([ring[i, 0], ring[i, 1], z1])
        if reverse:
            mb.add_face(np.stack([p0, p3, p2, p1]))
        else:
            mb.add_face(np.stack([p0, p1, p2, p3]))


def bevel_to_inset(ring, inset, za, zb, reverse, mb: MeshBuilder):
    mapped = np.array([closest_on_ring(p, inset) for p in ring])
    n = len(ring)
    for i in range(n):
        j = (i + 1) % n
        p0 = np.array([ring[i, 0], ring[i, 1], za])
        p1 = np.array([ring[j, 0], ring[j, 1], za])
        p2 = np.array([mapped[j, 0], mapped[j, 1], zb])
        p3 = np.array([mapped[i, 0], mapped[i, 1], zb])
        if reverse:
            mb.add_face(np.stack([p0, p3, p2, p1]))
        else:
            mb.add_face(np.stack([p0, p1, p2, p3]))


def build_piece(outer_xy: np.ndarray, hole_xy: np.ndarray | None, mb: MeshBuilder):
    outer = ensure_ccw(subdivide_ring(outer_xy, 0.10))
    holes_xy = []
    if hole_xy is not None:
        holes_xy = [ensure_cw(subdivide_ring(hole_xy, 0.10))]
    poly = Polygon(outer, holes=holes_xy)
    if not poly.is_valid:
        poly = poly.buffer(0)
    outer, holes_xy = shapely_rings(poly)

    z_back = -THICKNESS * 0.5
    z_bw = -THICKNESS * 0.5 + BEVEL
    z_fw = THICKNESS * 0.5 - BEVEL
    z_front = THICKNESS * 0.5
    z_facet_f = THICKNESS * 0.5 + FACET
    z_facet_b = -THICKNESS * 0.5 - FACET

    inset1 = poly.buffer(-BEVEL, join_style=2, mitre_limit=2.0)
    inset2 = poly.buffer(-(BEVEL + FACET), join_style=2, mitre_limit=2.0)
    ring_b, holes_b = shapely_rings(inset1)
    ring_c, holes_c = shapely_rings(inset2) if not inset2.is_empty else (ring_b, holes_b)

    wall_ring(outer, z_bw, z_fw, reverse=False, mb=mb)
    for h in holes_xy:
        wall_ring(h, z_fw, z_bw, reverse=False, mb=mb)

    bevel_to_inset(outer, ring_b, z_fw, z_front, reverse=False, mb=mb)
    bevel_to_inset(outer, ring_b, z_bw, z_back, reverse=True, mb=mb)
    bevel_to_inset(ring_b, ring_c, z_front, z_facet_f, reverse=False, mb=mb)
    bevel_to_inset(ring_b, ring_c, z_back, z_facet_b, reverse=True, mb=mb)

    if holes_xy and holes_b:
        bevel_to_inset(holes_xy[0], holes_b[0], z_fw, z_front, reverse=True, mb=mb)
        bevel_to_inset(holes_xy[0], holes_b[0], z_bw, z_back, reverse=False, mb=mb)
    if holes_b and holes_c:
        bevel_to_inset(holes_b[0], holes_c[0], z_front, z_facet_f, reverse=True, mb=mb)
        bevel_to_inset(holes_b[0], holes_c[0], z_back, z_facet_b, reverse=False, mb=mb)

    # Triangulate inset rings
    holes_list = [h for h in holes_c if len(h) >= 3]
    faces_c = triangulate(ring_c, holes_list)
    verts_list = [ring_c] + holes_list
    verts2 = np.vstack(verts_list) if verts_list else ring_c
    pts_f = np.column_stack([verts2[:, 0], verts2[:, 1], np.full(len(verts2), z_facet_f)])
    pts_b = np.column_stack([verts2[:, 0], verts2[:, 1], np.full(len(verts2), z_facet_b)])
    mb.add_tris(pts_f, faces_c, z_normal_sign=1.0)
    mb.add_tris(pts_b, faces_c, z_normal_sign=-1.0)


def ring_from_shapely(geom) -> np.ndarray:
    if geom.is_empty:
        return np.zeros((0, 2))
    poly = geom
    if geom.geom_type == "MultiPolygon":
        poly = max(geom.geoms, key=lambda g: g.area)
    coords = np.array(poly.exterior.coords, dtype=np.float64)
    if len(coords) > 1 and np.allclose(coords[0], coords[-1]):
        coords = coords[:-1]
    return coords


def closest_on_ring(p: np.ndarray, ring: np.ndarray) -> np.ndarray:
    best = ring[0]
    best_d = 1e18
    n = len(ring)
    for i in range(n):
        a = ring[i]
        b = ring[(i + 1) % n]
        ab = b - a
        l2 = float(np.dot(ab, ab))
        if l2 < 1e-12:
            q = a
        else:
            t = float(np.clip(np.dot(p - a, ab) / l2, 0.0, 1.0))
            q = a + t * ab
        d = float(np.dot(p - q, p - q))
        if d < best_d:
            best_d = d
            best = q
    return best


def subdivide_ring(pts: np.ndarray, max_len: float) -> np.ndarray:
    out = []
    n = len(pts)
    for i in range(n):
        a = pts[i]
        b = pts[(i + 1) % n]
        out.append(a)
        dist = float(np.linalg.norm(b - a))
        steps = int(dist / max_len)
        for s in range(1, steps):
            out.append(a + (b - a) * (s / steps))
    return np.array(out, dtype=np.float64)


def build_mesh() -> MeshBuilder:
    mb = MeshBuilder()
    hole = img_to_xy(MAIN_HOLE_IMG) if MAIN_HOLE_IMG is not None else None
    build_piece(img_to_xy(MAIN_OUTER_IMG), hole, mb)
    build_piece(img_to_xy(RIGHT_IMG), None, mb)
    return mb


# ---------------------------------------------------------------------------
# GLB export (PBR metallic + vertex colors)
# ---------------------------------------------------------------------------
def export_glb(mb: MeshBuilder, path: Path):
    pos = np.asarray(mb.positions, dtype=np.float32)
    nrm = np.asarray(mb.normals, dtype=np.float32)
    col = np.asarray(mb.colors, dtype=np.float32)
    idx = np.asarray(mb.indices, dtype=np.uint32)

    # Normalize just in case
    nlen = np.linalg.norm(nrm, axis=1, keepdims=True)
    nrm = nrm / np.clip(nlen, 1e-8, None)

    blobs = []
    def add(arr: np.ndarray) -> tuple[int, int, int]:
        b = arr.tobytes()
        pad = (4 - (len(b) % 4)) % 4
        blobs.append(b + b"\x00" * pad)
        return sum(len(x) for x in blobs[:-1]), len(b), len(b) + pad

    off_pos, len_pos, _ = add(pos)
    off_nrm, len_nrm, _ = add(nrm)
    off_col, len_col, _ = add(col)
    off_idx, len_idx, _ = add(idx)
    bin_blob = b"".join(blobs)

    mins = pos.min(axis=0).tolist()
    maxs = pos.max(axis=0).tolist()

    gltf = {
        "asset": {"version": "2.0", "generator": "ATLYX logo builder"},
        "scene": 0,
        "scenes": [{"nodes": [0], "name": "Scene"}],
        "nodes": [{"mesh": 0, "name": "ATLYXLogo"}],
        "meshes": [{
            "name": "ATLYXEmblem",
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1, "COLOR_0": 2},
                "indices": 3,
                "material": 0,
            }],
        }],
        "materials": [{
            "name": "ATLYXCrystalMetal",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.88,
                "roughnessFactor": 0.14,
            },
            "emissiveFactor": [0.04, 0.12, 0.22],
            "doubleSided": False,
        }],
        "accessors": [
            {
                "bufferView": 0, "componentType": 5126, "count": len(pos),
                "type": "VEC3", "min": mins, "max": maxs,
            },
            {"bufferView": 1, "componentType": 5126, "count": len(nrm), "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": len(col), "type": "VEC4"},
            {"bufferView": 3, "componentType": 5125, "count": len(idx), "type": "SCALAR"},
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": off_pos, "byteLength": len_pos, "target": 34962},
            {"buffer": 0, "byteOffset": off_nrm, "byteLength": len_nrm, "target": 34962},
            {"buffer": 0, "byteOffset": off_col, "byteLength": len_col, "target": 34962},
            {"buffer": 0, "byteOffset": off_idx, "byteLength": len_idx, "target": 34963},
        ],
        "buffers": [{"byteLength": len(bin_blob)}],
    }
    gltf_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    pad = (4 - (len(gltf_bytes) % 4)) % 4
    gltf_bytes += b" " * pad

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        # 12-byte header
        total = 12 + 8 + len(gltf_bytes) + 8 + len(bin_blob)
        f.write(struct.pack("<4sII", b"glTF", 2, total))
        f.write(struct.pack("<I4s", len(gltf_bytes), b"JSON"))
        f.write(gltf_bytes)
        f.write(struct.pack("<I4s", len(bin_blob), b"BIN\x00"))
        f.write(bin_blob)
    print(f"Wrote {path} ({path.stat().st_size} bytes, {len(pos)} verts, {len(idx)//3} tris)")
    print(f"Bounds min={mins} max={maxs}")


# ---------------------------------------------------------------------------
# Software preview renderer (orthographic + simple PBR-ish shading)
# ---------------------------------------------------------------------------
def look_at(eye, target, up):
    eye = np.asarray(eye, dtype=np.float64)
    target = np.asarray(target, dtype=np.float64)
    up = np.asarray(up, dtype=np.float64)
    z = eye - target
    z /= np.linalg.norm(z)
    x = np.cross(up, z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    m = np.eye(4)
    m[0, :3] = x
    m[1, :3] = y
    m[2, :3] = z
    t = np.eye(4)
    t[:3, 3] = -eye
    return m @ t


def project_points(pts, view, scale, w, h):
    ph = np.c_[pts, np.ones(len(pts))]
    cam = (view @ ph.T).T
    x = cam[:, 0] * scale + w * 0.5
    y = -cam[:, 1] * scale + h * 0.55
    z = cam[:, 2]
    return np.stack([x, y, z], axis=1)


def render_view(mb: MeshBuilder, eye, name: str, size=720):
    pos = np.asarray(mb.positions, dtype=np.float64)
    nrm = np.asarray(mb.normals, dtype=np.float64)
    col = np.asarray(mb.colors, dtype=np.float64)[:, :3]
    idx = np.asarray(mb.indices, dtype=np.int32).reshape(-1, 3)

    view = look_at(eye, np.array([0.0, 0.05, 0.0]), np.array([0.0, 1.0, 0.0]))
    scale = size * 0.28
    # Soft light-blue backdrop like the reference
    img = Image.new("RGB", (size, size), (224, 236, 252))
    draw = ImageDraw.Draw(img, "RGBA")

    vpos = project_points(pos, view, scale, size, size)
    R = view[:3, :3]
    vnrm = (R @ nrm.T).T
    light = np.array([0.45, 0.72, 0.55])
    light = light / np.linalg.norm(light)
    light_cam = R @ light
    light_cam /= np.linalg.norm(light_cam)

    # Painter's algorithm: far (larger cam-z, since +Z is toward camera? view maps world so
    # camera looks down -Z, so smaller z is closer). Sort by mean z descending (far first).
    tris = vpos[idx]
    depth = tris[:, :, 2].mean(axis=1)
    order = np.argsort(-depth)

    for ti in order:
        p = tris[ti]
        n = vnrm[idx[ti]].mean(axis=0)
        ln = np.linalg.norm(n)
        if ln < 1e-8:
            continue
        n = n / ln
        # Skip back faces (normal pointing away from camera, cam looks -Z so front has n_z < 0)
        if n[2] > 0.08:
            continue
        albedo = col[idx[ti]].mean(axis=0)
        ndl = max(0.0, float(np.dot(n, light_cam)))
        h = light_cam + np.array([0.0, 0.0, 1.0])
        h /= np.linalg.norm(h)
        spec = max(0.0, float(np.dot(n, h))) ** 40
        env = np.array([0.55, 0.88, 1.0]) * (0.5 + 0.5 * n[1]) + np.array(
            [0.38, 0.12, 0.78]
        ) * (0.5 - 0.5 * n[1])
        rgb = albedo * (0.38 + 0.70 * ndl) + spec * np.array([0.92, 0.98, 1.0]) * 0.85 + env * albedo * 0.28
        rgb = np.clip(rgb, 0, 1)
        fill = tuple(int(c * 255) for c in rgb)
        xy = [(float(p[0, 0]), float(p[0, 1])), (float(p[1, 0]), float(p[1, 1])), (float(p[2, 0]), float(p[2, 1]))]
        draw.polygon(xy, fill=fill)

    PREV_DIR.mkdir(parents=True, exist_ok=True)
    fp = PREV_DIR / f"{name}.png"
    img.save(fp)
    print("preview", fp)
    return fp


def copy_reference():
    REF_DST.parent.mkdir(parents=True, exist_ok=True)
    if REF_SRC.exists() and not REF_DST.exists():
        Image.open(REF_SRC).save(REF_DST)
        print("copied reference to", REF_DST)


def main():
    copy_reference()
    mb = build_mesh()
    export_glb(mb, OUT_GLB)
    views = {
        "front": np.array([0.0, 0.15, 4.0]),
        "back": np.array([0.0, 0.15, -4.0]),
        "left": np.array([-4.0, 0.15, 0.0]),
        "right": np.array([4.0, 0.15, 0.0]),
        "angled": np.array([2.2, 1.4, 3.4]),
    }
    for name, eye in views.items():
        render_view(mb, eye, name)


if __name__ == "__main__":
    main()
