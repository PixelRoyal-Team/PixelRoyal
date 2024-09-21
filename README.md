# PixelRoyal
THIS IS THE ONLY AND OFFICIAL PIXELROYAL GITHUB REPOSITORY CREATED IN THE NAME OF OUR ORGANIZATION NAME **PIXELROYAL**, THAT HOSTS THE GAME FILES OF OUR GAME, ANY OTHER REPOSITORY WITH THE GAME FILES OF OUR GAME THAT AREN'T UNDER THIS ORGANIZATION GITHUB ACCOUNT AREN'T OFFICIAL.

Our game is inspired by r/place: a reddit event where users can place colored pixels on a blank canvas, it was originally an April fool to then become a big and loved community!

## Requirements:
- Node.js installed with NPM too.
- XAMPP with phpmyadmin (PMA) and MYSQL.

## Setup:
- Install PR repository (this), on where you want to run the game, for example your server.
- To install you can simply just download the zip of this repository or use git, anything you want.
- On the **command prompt** run `npm install` to install every package needed to run PR.
- After that run `npm run build`, a build folder will appear with the client game files built.
- To start the server go to the server folder in *pixelroyal/server/* and run `node server.js`.

## Processes:
Make sure to **LEAVE THESE PORTS FREE** for the game, they're the ports where the game processes run and they'll not work if there's already a process running on the same following ports.
- **80:** main game.
- **4000:** socket server.

The game accounts are stored in a MYSQL database while the game tiles are stored in *pixelroyal/server/tiles/*
