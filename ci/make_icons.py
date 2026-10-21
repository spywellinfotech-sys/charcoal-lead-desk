import os,glob
from PIL import Image
src=Image.open('assets/icon.png').convert('RGBA')
res='android/app/src/main/res'
for d,s in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
    p=f'{res}/mipmap-{d}'
    if not os.path.isdir(p): continue
    im=src.resize((s,s),Image.LANCZOS)
    for n in ('ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png'):
        im.save(f'{p}/{n}')
# drop adaptive icon xmls so the full-bleed logo is used as is
for f in glob.glob(f'{res}/mipmap-anydpi-v26/ic_launcher*.xml'): os.remove(f)
print('icons done')
