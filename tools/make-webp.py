#!/usr/bin/env python3
"""Write a .webp beside every photograph that is meaningfully smaller as WebP.

Nothing is deleted and no original is touched: the .jpg and .png stay on disk and stay
referenced by js/data/*.js. The page only reaches for a .webp when the BUILD has recorded
that the file exists AND the browser has told us it can decode one, so a browser without
WebP simply keeps the original. That is why this is safe in a way that renaming is not.

Quality is chosen per file, not set globally: the lowest WebP quality whose luma SSIM
against the original clears the floor. The floor is deliberately not near 1.0 — SSIM here
is measured against a picture that is ALREADY a lossy JPEG, so on a textured photograph
most of what it scores is the original's own noise. Every choice this script makes was
also checked by eye at 1:1 against the original before the floor was set.

A PNG is tried LOSSLESS first: line art, graphs and anything carrying text keep every
pixel exactly, and only fall through to the quality ladder if lossless is not smaller.

A file that does not save at least MIN_GAIN is skipped, so nothing ships for a 2% win.

  python3 tools/make-webp.py --check     report only, write nothing
  python3 tools/make-webp.py             write the .webp files
"""
import io, os, sys, glob
import numpy as np
from PIL import Image

SSIM_FLOOR = 0.975
MIN_GAIN   = 0.12          # skip anything that saves less than 12%
QUALITIES  = (72, 76, 80, 84, 88, 92, 95)

def ssim(a, b):
    """Global SSIM on the luma plane with 8x8 box windows. No scipy."""
    a = a.astype(np.float64); b = b.astype(np.float64)
    C1, C2, k = (0.01 * 255) ** 2, (0.03 * 255) ** 2, 8
    def box(x):
        c = np.cumsum(np.cumsum(x, 0), 1); c = np.pad(c, ((1, 0), (1, 0)))
        return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)
    m1, m2 = box(a), box(b)
    s1, s2, s12 = box(a * a) - m1 * m1, box(b * b) - m2 * m2, box(a * b) - m1 * m2
    return float(np.mean(((2 * m1 * m2 + C1) * (2 * s12 + C2)) /
                         ((m1 ** 2 + m2 ** 2 + C1) * (s1 + s2 + C2))))

def encode(im, q):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    return buf.getvalue()

def luma(im):
    """Flatten onto mid grey first: an RGBA cut-out has arbitrary colour under its
       transparent pixels, and comparing that would demand a quality the eye never sees."""
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (128, 128, 128, 255))
        im = Image.alpha_composite(bg, im)
    return np.array(im.convert('L'))

def main():
    check = '--check' in sys.argv
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    files = sorted(glob.glob('assets/**/*.jpg', recursive=True) +
                   glob.glob('assets/**/*.png', recursive=True))
    kept = skipped = 0; before = after = 0
    for p in files:
        im = Image.open(p)
        alpha = im.mode in ('RGBA', 'LA') or 'transparency' in im.info
        ref = luma(im)
        orig = os.path.getsize(p)
        rgb = im.convert('RGBA' if alpha else 'RGB')
        best = None
        if p.lower().endswith('.png'):
            buf = io.BytesIO(); rgb.save(buf, 'WEBP', lossless=True, method=6)
            if len(buf.getvalue()) <= orig * (1 - MIN_GAIN):
                best = ('lossless', buf.getvalue(), 1.0)
        for q in (QUALITIES if best is None else ()):
            data = encode(rgb, q)
            s = ssim(ref, luma(Image.open(io.BytesIO(data))))
            if s >= SSIM_FLOOR:
                best = (q, data, s); break
        if best is None:
            data = encode(rgb, 95)
            best = (95, data, ssim(ref, luma(Image.open(io.BytesIO(data)))))
        q, data, s = best
        out = os.path.splitext(p)[0] + '.webp'
        gain = 1 - len(data) / orig
        if gain < MIN_GAIN:
            skipped += 1
            if os.path.exists(out) and not check: os.remove(out)
            continue
        kept += 1; before += orig; after += len(data)
        print(f'{p:52s} {orig/1024:7.1f} -> {len(data)/1024:7.1f} KB  q={q} ssim={s:.4f}')
        if not check:
            with open(out, 'wb') as f: f.write(data)
    verb = 'would write' if check else 'wrote'
    print(f'\n{verb} {kept} .webp  ({before/1024:.0f} -> {after/1024:.0f} KB, '
          f'{100*(1-after/before) if before else 0:.1f}% off)   skipped {skipped} that saved < {MIN_GAIN:.0%}')

main()
