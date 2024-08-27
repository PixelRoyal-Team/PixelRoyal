import sys
from PIL import Image
import os, shutil
from tqdm import tqdm

cwidth = 256
cheight = 256
chunksize = 256

folder = '../server/tiles/'

chunktest = Image.open("./ChunkTest.png");

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
            #image = Image.new('RGB', (chunksize, chunksize), color='white')
            image = chunktest.copy()
            image.save(f"{folder}/{i}/{x}/{y}.png", "PNG")

print("Tiles created!")