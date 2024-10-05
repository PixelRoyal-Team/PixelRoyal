import sys
from PIL import Image
from PIL import ImageDraw
import os, shutil
from tqdm import tqdm

cwidth = 256
cheight = 256
chunksize = 256

folder = '../server/tiles/'

chunktest = Image.open("./ChunkTest.png");
map = Image.open("./map.png");

def generatetile(TILEX, TILEY):
    image = Image.new('RGB', (256, 256), color='white')
    draw = ImageDraw.Draw(image)
    
    for y in range(16):
        for x in range(16):
            color = map.getpixel((TILEX * 16 + x, TILEY * 16 + y))
            
            draw.rectangle([(x * 16, y * 16), (x * 16 + 16, y * 16 + 16)], fill=color)

    return image
    

for filename in os.listdir(folder): #Empty directory
    file_path = os.path.join(folder, filename)
    try:
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
    except Exception as e:
        sys.exit('Failed to delete %s. Reason: %s' % (file_path, e))

print("Making tiles... please wait...")

for i in tqdm(range(9)): # Creates zoom tiles
    os.makedirs(f"{folder}/{i}/")
    for x in range(2 ** i):  
        os.makedirs(f"{folder}/{i}/{x}/")
        for y in range(2 ** i):
            
            if i == 8:
                image = generatetile(x, y)
                print("yes")
            else:
                image = Image.new('RGB', (chunksize, chunksize), color=(202, 227, 255))
                
            #image = chunktest.copy()
            
            image.save(f"{folder}/{i}/{x}/{y}.png", "PNG")

print("Tiles created!")

input("Press Enter to exit...")