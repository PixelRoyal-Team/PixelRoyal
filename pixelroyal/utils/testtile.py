from PIL import Image
from PIL import ImageDraw

map = Image.open("./map.png");

def generatetile(TILEX, TILEY):
    image = Image.new('RGB', (256, 256), color='white')
    draw = ImageDraw.Draw(image)
    
    for y in range(16):
        for x in range(16):
            color = map.getpixel((TILEX * 16 + x, TILEY * 16 + y))
            
            draw.rectangle([(x * 16, y * 16), (x * 16 + 16, y * 16 + 16)], fill=color)

    return image
    
image = generatetile(150, 70)
image.save(f"testtile.png", "PNG")