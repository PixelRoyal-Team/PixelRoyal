import os
from PIL import Image

# Define the path to the folder containing the tiles
folder = '../server/tiles/8/'
output_image_path = 'merged_image.png'  # Output path for the merged image
output_size = 256  # The output image will be 256x256 pixels

# Create a new blank image to hold the averaged colors
merged_image = Image.new('RGB', (output_size, output_size))

# Loop through each directory (1 to 256)
for x in range(1, output_size + 1):
    for y in range(1, output_size + 1):
        # Construct the path for the tile image
        tile_path = os.path.join(folder, f"{x - 1}/{y - 1}.png")  # Adjust to get the correct directory

        # Check if the image tile exists
        if os.path.exists(tile_path):
            tile_image = Image.open(tile_path).convert('RGB')  # Ensure the image is in RGB mode

            # Get the color of the tile, taking the pixel at (0,0)
            color = tile_image.getpixel((0, 0))
            
            # Place the color in the merged image
            merged_image.putpixel((x - 1, y - 1), color)

# Save the merged image
merged_image.save(output_image_path)

print(f"Merged image created and saved as {output_image_path}")