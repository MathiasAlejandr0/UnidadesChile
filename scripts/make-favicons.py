from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
LOGOS = PUBLIC / "logos"


def square_on_black(src: Image.Image, size: int, pad_ratio: float = 0.14) -> Image.Image:
    src = src.convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    inner = int(size * (1 - pad_ratio * 2))
    fitted = src.copy()
    fitted.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas.convert("RGBA")


def main() -> None:
    emblem = Image.open(LOGOS / "emblem.png")
    wordmark = Image.open(LOGOS / "logo.png")

    icon_512 = square_on_black(emblem, 512, 0.12)
    icon_512.save(PUBLIC / "favicon-512.png", "PNG")
    square_on_black(emblem, 192, 0.12).save(PUBLIC / "favicon-192.png", "PNG")
    square_on_black(emblem, 48, 0.1).save(PUBLIC / "favicon-48.png", "PNG")
    square_on_black(emblem, 32, 0.08).save(PUBLIC / "favicon-32.png", "PNG")
    square_on_black(emblem, 180, 0.12).save(PUBLIC / "apple-touch-icon.png", "PNG")

    ico_sizes = [16, 32, 48]
    ico_images = [square_on_black(emblem, s, 0.08).convert("RGBA") for s in ico_sizes]
    ico_images[0].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:],
    )

    og = Image.new("RGB", (1200, 630), (10, 10, 10))
    mark = wordmark.convert("RGBA")
    mark.thumbnail((920, 220), Image.Resampling.LANCZOS)
    ox = (1200 - mark.width) // 2
    oy = (630 - mark.height) // 2
    og.paste(mark, (ox, oy), mark)
    draw = ImageDraw.Draw(og)
    draw.rectangle((0, 0, 1199, 629), outline=(227, 6, 19), width=2)
    og.save(PUBLIC / "og-image.png", "PNG", optimize=True)

    print("ok", [p.name for p in sorted(PUBLIC.glob("favicon*"))], "apple-touch-icon.png", "og-image.png")


if __name__ == "__main__":
    main()
