from pathlib import Path
from PIL import Image
import json, shutil, hashlib

root = Path(__file__).resolve().parents[1] / 'outputs' / 'cloud-pet-demo'
manifest_path = root / 'references/time-extensions/spring-summer-generation-manifest.json'
data = json.loads(manifest_path.read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
for a in data['assets']:
    source = Path(a['sourceGeneratedFile'])
    original = root / a['originalFile']
    target = root / a['webpFile']
    original.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, original)
    with Image.open(source) as im:
        a['originalDimensions'] = list(im.size)
        im.convert('RGB').resize((853,912), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=90, method=6)
    a['originalSha256'] = sha(original)
    a['originalCopyVerified'] = a['originalSha256'] == sha(source)
    a['webpSha256'] = sha(target)
    a['webpBytes'] = target.stat().st_size
    a['webpDimensions'] = [853,912]
    a['motherSha256AtDelivery'] = sha(root / a['motherFile'])
    print(a['key'], a['originalDimensions'], a['webpBytes'], a['originalCopyVerified'])
manifest_path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
