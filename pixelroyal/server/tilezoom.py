import datetime
from PIL import Image

startTime = datetime.datetime.now()
countOfUpdatedImages = 0
folderNum = 8
while folderNum > 0:
    foldersCount = 0
    if folderNum == 8:
        foldersCount = 256
    elif folderNum == 7:
        foldersCount = 128
    elif folderNum == 6:
        foldersCount = 64
    elif folderNum == 5:
        foldersCount = 32
    elif folderNum == 4:
        foldersCount = 16
    elif folderNum == 3:
        foldersCount = 8
    elif folderNum == 2:
        foldersCount = 4
    elif folderNum == 1:
        foldersCount = 2
    else:
        foldersCount = 1

    n = 0
    def merge(img1,img2,img3,img4, saveFile):
        image1 = Image.open(img1)
        image2 = Image.open(img2)
        image3 = Image.open(img3)
        image4 = Image.open(img4)

        image1 = image1.resize((128, 128))
        image2 = image2.resize((128, 128))
        image3 = image3.resize((128, 128))
        image4 = image4.resize((128, 128))

        new_image = Image.new("RGB",(256,256), (250,250,250))
        new_image.paste(image1,(0,0))
        new_image.paste(image2,(0,128))
        new_image.paste(image3,(128,0))
        new_image.paste(image4,(128,128))
        new_image.save(saveFile)

    i = 0 
    while (i < foldersCount-1):
        j = 0
        y = 0
        while (j < foldersCount-1):
            merge(f"tiles/{folderNum}/{j}/{i}.png", f"tiles/{folderNum}/{j}/{i+1}.png", f"tiles/{folderNum}/{j+1}/{i}.png", f"tiles/{folderNum}/{j+1}/{i+1}.png", f"tiles/{folderNum-1}/{y}/{n}.png")
            j+=2
            y+=1
            countOfUpdatedImages += 1
            print(countOfUpdatedImages)
        n+=1
        i+=2

    if countOfUpdatedImages == 21845:
        countOfUpdatedImages = 0
        now = datetime.datetime.now()
        difference = startTime - now
        seconds_in_day = 24 * 60 * 60
        print(f"Done in {difference.days * seconds_in_day + difference.seconds} seconds.")
    folderNum -= 1