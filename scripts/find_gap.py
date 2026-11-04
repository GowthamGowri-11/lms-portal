from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from collections import deque

src = Path(r"D:\student form\lms-portal-new\lms-portal\public\atlyx-logo.png")
im = np.array(Image.open(src).convert("RGBA"))
rgb = im[:, :, :3].astype(np.int16)
black = rgb.sum(axis=2) <= 40
h, w = black.shape

# BFS from inside A to find path to image border
start = (230, 240)  # y, x
print("start black", black[start])
q = deque([start])
prev = {start: None}
seen = {start}
end = None
while q:
    y, x = q.popleft()
    if x <= 97 or x >= 427 or y <= 136 or y >= 387:
        # still inside bbox - continue until we leave logo bbox significantly
        pass
    if x < 90 or x > 430 or y < 130 or y > 390:
        end = (y, x)
        break
    for dy, dx in ((0,1),(1,0),(0,-1),(-1,0)):
        ny, nx = y+dy, x+dx
        if 0<=ny<h and 0<=nx<w and black[ny,nx] and (ny,nx) not in seen:
            seen.add((ny,nx))
            prev[(ny,nx)] = (y,x)
            q.append((ny,nx))
print("end", end, "visited", len(seen))
# reconstruct path
path = []
cur = end
while cur is not None:
    path.append(cur[::-1])  # x,y
    cur = prev.get(cur)
path = path[::-1]
print("path len", len(path))
# find narrowest corridor: for each path point, distance to nearest logo pixel
from scipy.ndimage import distance_transform_edt
dist = distance_transform_edt(black)
narrow = []
for x,y in path:
    d = dist[y,x]
    if d < 3:
        narrow.append((x,y,float(d)))
print("narrow points", len(narrow))
print(narrow[:40], "...", narrow[-10:])

out = Image.fromarray(im)
dr = ImageDraw.Draw(out)
for x,y in path[::2]:
    dr.point((x,y), fill=(255,0,0))
for x,y,d in narrow:
    dr.ellipse((x-1,y-1,x+1,y+1), fill=(0,255,0))
out.save(Path(r"D:\student form\lms-portal-new\lms-portal\scripts\_gap.png"))
print("saved gap overlay")
