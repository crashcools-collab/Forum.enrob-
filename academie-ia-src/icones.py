"""Génère les icônes de l'application (192 et 512 px) dans le dossier passé en argument."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sortie = Path(sys.argv[1])
POLICES = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"]

def police(taille):
    for p in POLICES:
        if Path(p).exists():
            return ImageFont.truetype(p, taille)
    return ImageFont.load_default()

for cote in (192, 512):
    img = Image.new("RGB", (cote, cote), (13, 13, 13))
    d = ImageDraw.Draw(img)
    # Dégradé orange vers jaune dans un carré arrondi, laissant une marge pour les icônes « maskable »
    m = int(cote * 0.16)
    masque = Image.new("L", (cote, cote), 0)
    ImageDraw.Draw(masque).rounded_rectangle([m, m, cote - m, cote - m], radius=int(cote * 0.12), fill=255)
    degrade = Image.new("RGB", (cote, cote))
    for x in range(cote):
        t = x / (cote - 1)
        couleur = (255, int(106 + (196 - 106) * t), 0)
        ImageDraw.Draw(degrade).line([(x, 0), (x, cote)], fill=couleur)
    img.paste(degrade, (0, 0), masque)
    f = police(int(cote * 0.30))
    texte = "IA"
    boite = d.textbbox((0, 0), texte, font=f)
    l, h = boite[2] - boite[0], boite[3] - boite[1]
    d.text(((cote - l) / 2 - boite[0], (cote - h) / 2 - boite[1]), texte, font=f, fill=(13, 13, 13))
    img.save(sortie / f"icone-{cote}.png", optimize=True)
