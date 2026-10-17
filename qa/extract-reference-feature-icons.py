"""Extract the approved seasonal feature illustrations from user reference PNGs.

This reuses the deterministic edge-background removal from the project's
original extraction script. The source screenshots are never modified.
"""
from pathlib import Path
from collections import deque
import ast
import hashlib
import json
import numpy as np
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1]
source_script = (root / 'work/extract-locked-assets.py').read_text(encoding='utf-8')
tree = ast.parse(source_script)
function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'extract_transparent')
namespace = {'Image': Image, 'ImageFilter': ImageFilter, 'np': np, 'deque': deque}
exec(compile(ast.Module(body=[function], type_ignores=[]), '<extract_transparent>', 'exec'), namespace)

spec = {
    'spring': ('f1b94c62c9739dfb5909d90767048376.png', {
        'bath': (33, 1160, 294, 1360), 'book': (336, 1163, 548, 1360), 'store': (579, 1148, 825, 1366)}),
    'summer': ('05dd24272bb3e0a0d191010147cd3c1f.png', {
        'bath': (40, 1188, 308, 1380), 'book': (345, 1194, 546, 1380), 'store': (632, 1199, 842, 1380)}),
    'autumn': ('4b92ed6fadf526c0eaed0e1e6f17ed7a.png', {
        'bath': (46, 1168, 318, 1340), 'book': (377, 1175, 556, 1340), 'store': (652, 1181, 846, 1340)}),
    'winter': ('4f6c76809cd3673a111548514d081d14.png', {
        'bath': (64, 1143, 310, 1323), 'book': (383, 1148, 548, 1323), 'store': (639, 1152, 858, 1323)})
}
dest = root / 'outputs/cloud-pet-demo/dist/assets'
manifest = {}
for season, (filename, boxes) in spec.items():
    original = Path('D:/桌面') / filename
    source = Image.open(original).convert('RGB')
    manifest[season] = {'source': filename, 'sha256': hashlib.sha256(original.read_bytes()).hexdigest(), 'icons': {}}
    for kind, box in boxes.items():
        icon, retained = namespace['extract_transparent'](source, box)
        # Soften only the cut boundary; keep the original illustration pixels.
        rgba=np.asarray(icon).copy()
        h,w=rgba.shape[:2]
        yy,xx=np.indices((h,w))
        edge=np.minimum.reduce([xx,yy,w-1-xx,h-1-yy]).astype(np.float32)
        feather=np.clip(edge/11,0,1)
        feather=feather*feather*(3-2*feather)
        rgba[:,:,3]=np.rint(rgba[:,:,3].astype(np.float32)*feather).astype(np.uint8)
        icon=Image.fromarray(rgba,'RGBA')
        output = dest / f'feature-{season}-{kind}.png'
        icon.save(output, optimize=True)
        manifest[season]['icons'][kind] = {'file': output.name, 'box': box, 'size': icon.size, 'retainedFraction': round(retained, 3)}
        print(f'{season} {kind}: {icon.size}, {output.stat().st_size} bytes, {retained:.2f} retained')
(dest / 'feature-icon-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

sheet = Image.new('RGB', (840, 4 * 180), '#eff8fe')
for row, season in enumerate(spec):
    for col, kind in enumerate(('bath', 'book', 'store')):
        im = Image.open(dest / f'feature-{season}-{kind}.png').convert('RGBA')
        im.thumbnail((248, 155), Image.Resampling.LANCZOS)
        sheet.paste(im, (col * 280 + (280 - im.width) // 2, row * 180 + 10), im)
sheet.save(root / 'work/feature-icon-review.jpg', quality=92)
