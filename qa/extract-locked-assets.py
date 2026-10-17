"""Deterministic extraction from the user's locked UI references.

No generative model is used. Only original UI pixels above y=440 may be
reconstructed; all original world pixels y=440..911 are checked byte-for-byte.
The output WebP is lossless. Removed UI areas cannot be claimed as original.
"""
from pathlib import Path
from collections import deque
import hashlib
import json
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'outputs/cloud-pet-demo/dist/assets'
REFERENCES = ROOT / 'outputs/cloud-pet-demo/references'
SOURCE = Path('D:/桌面')
SOURCES = {
    'spring': 'exec-333481c8-efc2-49fa-a296-2aabdbd06adc.png',
    'summer-a': 'exec-5079da66-061f-4659-b08f-afd8dcfe132f.png',
    'autumn-a': 'exec-da726b5b-666f-48c4-b133-ad6dc1bab1f5.png',
    'winter': 'exec-ff6cce94-9c66-40e3-b573-aec3198cae17.png',
}
ASSETS.mkdir(parents=True, exist_ok=True)
REFERENCES.mkdir(parents=True, exist_ok=True)


def white_mask(image, box, pad=2):
    """Mask the bright UI glyphs only, not their rectangular bounding area."""
    x0,y0,x1,y1=box
    pixels=np.asarray(image)[y0:y1,x0:x1,:3].astype(np.int16)
    bright=(pixels.min(2)>164)&((pixels.max(2)-pixels.min(2))<88)
    m=Image.fromarray(np.uint8(bright)*255)
    m=m.filter(ImageFilter.MaxFilter(pad*2+1))
    canvas=Image.new('L',image.size,0)
    canvas.paste(m,(x0,y0))
    return np.asarray(canvas)>0


def shape_mask(image, box, radius=0):
    canvas=Image.new('L',image.size,0)
    draw=ImageDraw.Draw(canvas)
    if radius:
        draw.rounded_rectangle(box,radius=radius,fill=255)
    else:
        draw.rectangle(box,fill=255)
    return np.asarray(canvas)>0


def harmonic_inpaint(original, mask, iterations=850):
    """Red/black SOR solution of the discrete Laplace equation inside a mask.

    All known source pixels remain fixed. Large masked UI shapes get a smooth
    local transition, not imagined trees, stars, architecture or animals.
    """
    ys,xs=np.where(mask)
    if not len(xs):
        return original
    x0=max(0,int(xs.min())-3);x1=min(original.shape[1],int(xs.max())+4)
    y0=max(0,int(ys.min())-3);y1=min(original.shape[0],int(ys.max())+4)
    patch=original[y0:y1,x0:x1].astype(np.float32)
    hole=mask[y0:y1,x0:x1]
    known=~hole
    patch[hole]=patch[known].mean(axis=0)
    # Edges of this patch are outside each UI mask.
    yy,xx=np.indices(hole.shape)
    red=hole&((xx+yy)%2==0)
    black=hole&~red
    inner_red=red[1:-1,1:-1]
    inner_black=black[1:-1,1:-1]
    middle=patch[1:-1,1:-1]
    for _ in range(iterations):
        for selected in (inner_red,inner_black):
            avg=(patch[:-2,1:-1]+patch[2:,1:-1]+patch[1:-1,:-2]+patch[1:-1,2:])*.25
            middle[selected]+=1.72*(avg[selected]-middle[selected])
    out=original.copy()
    roi=out[y0:y1,x0:x1]
    roi[hole]=np.clip(np.rint(patch[hole]),0,255).astype(np.uint8)
    return out


def extract_transparent(source, box):
    """Remove only border-connected backdrop; enclosed white fur stays intact."""
    crop=source.crop(box).convert('RGB')
    rgb=np.asarray(crop).astype(np.float32)
    h,w=rgb.shape[:2]
    # Bilinear corner colors approximate each small original local backdrop.
    k=6
    tl=np.median(rgb[:k,:k].reshape(-1,3),0)
    tr=np.median(rgb[:k,-k:].reshape(-1,3),0)
    bl=np.median(rgb[-k:,:k].reshape(-1,3),0)
    br=np.median(rgb[-k:,-k:].reshape(-1,3),0)
    yy=np.linspace(0,1,h)[:,None,None]
    xx=np.linspace(0,1,w)[None,:,None]
    bg=(tl[None,None,:]*(1-xx)+tr[None,None,:]*xx)*(1-yy)+(bl[None,None,:]*(1-xx)+br[None,None,:]*xx)*yy
    distance=np.sqrt(((rgb-bg)**2).sum(2))
    # Restrictive enough to keep teal outlines and pale dog interiors.
    allowed=distance<47
    seen=np.zeros((h,w),dtype=bool)
    queue=deque()
    for x in range(w):
        for y in (0,h-1):
            if allowed[y,x] and not seen[y,x]:seen[y,x]=True;queue.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if allowed[y,x] and not seen[y,x]:seen[y,x]=True;queue.append((y,x))
    while queue:
        y,x=queue.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and allowed[ny,nx] and not seen[ny,nx]:
                seen[ny,nx]=True;queue.append((ny,nx))
    alpha=Image.fromarray(np.uint8(~seen)*255).filter(ImageFilter.GaussianBlur(.45))
    rgba=crop.convert('RGBA');rgba.putalpha(alpha)
    # Keep original geometry; only transparent margins are trimmed.
    bounds=alpha.getbbox()
    if bounds:rgba=rgba.crop(bounds)
    return rgba, float((~seen).mean())


ICON_BOXES={
    'bath':(90,1135,239,1268),
    'book':(370,1148,486,1267),
    'contact':(638,1149,758,1268),
    'nav-home':(140,1673,215,1738),
    'nav-calendar':(396,1672,461,1738),
    'nav-pet':(629,1669,720,1738),
}

manifest={
    'method':'Original crop + deterministic masked harmonic interpolation; no AI generation',
    'original_world_preserved_y':[440,911],
    'crop':[0,0,853,912],
    'compression':'lossless WebP for scenery; PNG alpha for icons',
    'limitations':['Reconstructed pixels inside former UI masks are local transitions, not original hidden scenery.','Icon alpha is extracted only from border-connected background; local original glow/shadow may remain.'],
    'assets':{},
}
review=[]

for season,filename in SOURCES.items():
    source_file=SOURCE/filename
    source=Image.open(source_file).convert('RGB')
    assert source.size==(853,1844),f'Unexpected source dimensions: {source.size}'
    ref=REFERENCES/f'{season}-user-original.png'
    shutil.copyfile(source_file,ref)
    assert hashlib.sha256(source_file.read_bytes()).hexdigest()==hashlib.sha256(ref.read_bytes()).hexdigest()
    scene=source.crop((0,0,853,912))
    original=np.asarray(scene).copy()
    combined=np.zeros(original.shape[:2],dtype=bool)
    # Two original system chrome regions and brand mark/name.
    masks=[
        white_mask(scene,(41,20,132,57),5),
        shape_mask(scene,(664,19,819,57),8),
        shape_mask(scene,(36,91,99,143),18),
        white_mask(scene,(105,96,218,133),5),
        shape_mask(scene,(653,78,828,151),36),
        shape_mask(scene,(57,237,243,296),29),
        white_mask(scene,(60,314,266,359),8),
        white_mask(scene,(58,367,541 if season=='autumn-a' else 525 if season=='winter' else 438,435),8),
    ]
    cleaned=original.copy()
    for i,mask in enumerate(masks):
        assert not mask[440:].any()
        combined|=mask
        cleaned=harmonic_inpaint(cleaned,mask,1000 if i in (2,4,5) else 420)
    changed=np.any(cleaned!=original,axis=2)
    assert not changed[440:].any(),'World pixels below y=440 changed'
    assert not np.any(changed & ~combined),'Changed pixels outside documented mask'
    output=ASSETS/f'locked-{season}.webp'
    Image.fromarray(cleaned).save(output,'WEBP',lossless=True,quality=100,method=6)
    loaded=np.asarray(Image.open(output).convert('RGB'))
    assert np.array_equal(loaded,cleaned),'Lossless output did not preserve exact RGB'
    maskpath=ASSETS/f'locked-{season}-repair-mask.png'
    Image.fromarray(np.uint8(combined)*255).save(maskpath)
    icon_info={}
    for name,box in ICON_BOXES.items():
        icon,coverage=extract_transparent(source,box)
        icon_path=ASSETS/f'locked-{season}-{name}.png'
        icon.save(icon_path,optimize=True)
        icon_info[name]={'file':icon_path.name,'originalCrop':box,'size':icon.size,'retainedFraction':round(coverage,3)}
    manifest['assets'][season]={
        'source':str(source_file),'sourceSHA256':hashlib.sha256(source_file.read_bytes()).hexdigest(),
        'referenceCopy':str(ref.relative_to(ROOT)),'output':output.name,'size':list(scene.size),
        'fileBytes':output.stat().st_size,'mask':maskpath.name,
        'changedPixelsAbove440':int(changed[:440].sum()),'changedPixelsAtOrBelow440':int(changed[440:].sum()),
        'allUnmaskedPixelsIdentical':True,'icons':icon_info,
    }
    review.append(Image.fromarray(cleaned))
    print(f'{season}: {output.name}, {output.stat().st_size} bytes; original world unchanged',flush=True)

sheet=Image.new('RGB',(853*2,912*2),(230,238,241))
for i,img in enumerate(review):sheet.paste(img,((i%2)*853,(i//2)*912))
sheet.save(ASSETS/'locked-scene-review.jpg',quality=92)
iconsheet=Image.new('RGB',(720,4*170),(209,221,232))
for row,season in enumerate(SOURCES):
    for col,name in enumerate(ICON_BOXES):
        icon=Image.open(ASSETS/f'locked-{season}-{name}.png').convert('RGBA')
        icon.thumbnail((105,125),Image.Resampling.LANCZOS)
        iconsheet.paste(icon,(col*120+(120-icon.width)//2,row*170+20),icon)
iconsheet.save(ASSETS/'locked-icon-review.png')
(ASSETS/'locked-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
