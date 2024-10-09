import socket from '../components/socket';
import Colors from './Colors';
import loadingchunkimg from '../public/game/LoadingChunk.png';
import pointerimg from '../public/game/pxpointer.png';

const Movement = (canvasRef, contextRef) => {
    const canvas = document.getElementById('viewport');
    const context = canvas.getContext('2d');

    let CVSWIDTH = context.canvas.width;
    let CVSHEIGHT = context.canvas.height;
    let CANVASMX = 0;
    let CANVASMY = 0;
    let PXPOSX = 0;
    let PXPOSY = 0;
    let PRECPXCOORDX = 0;
    let PRECPXCOORDY = 0;
    let PXCOORDX = 0;
    let PXCOORDY = 0;

    console.log("render");
    const CANVASSIZE = 256 * 256;
    const CHUNKSIZE = 256;
    let CANVASVIEWSIZE = 0;
    let PIXELVIEWSIZE = 0;
    let SCALEFACTOR = 0;
    const LAYERNUM = 8;
    const LAYERSIZES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
    const LAYERCSIZES = [65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256];

    const position = { x: 0, y: 0 };
    let scale = 1;
    const mousePos = { x: 0, y: 0 };
    let isDragging = false;
    let lastTouch = null;
    let lastMouse = null;

    let paletteRef = 'black';
    let coordX = 0;
    let coordY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let currentLayer = LAYERNUM;

    context.imageSmoothingEnabled = false;
    const tileserver = new URL(location.protocol + "//" + location.hostname + ":" + location.port + "/tiles/");

    const loading = new Image();
    loading.src = loadingchunkimg;
    const pointer = new Image();
    pointer.src = pointerimg;
    const chunkloader = [[], [], [], [], [], [], [], [], []];
    const chunkloaded = [[], [], [], [], [], [], [], [], []];

    for (let i = 0; i < Colors.length; i++) {
        const element = document.getElementById(i.toString());
        if (element) {
            element.addEventListener('click', function () {
                paletteRef = Colors[i];
            });
        }
    }

    const setValues = () => {
        PIXELVIEWSIZE = scale;
        CANVASVIEWSIZE = PIXELVIEWSIZE * CANVASSIZE;
        SCALEFACTOR = CANVASSIZE - CANVASVIEWSIZE;
    };

    const setpixelchunk = async (cx, cy, x, y, color) => {
        const chunk = await chunkloader[LAYERNUM][cy * LAYERCSIZES[LAYERNUM] + cx];
        if (chunk != null) {
            const cvschunk = document.createElement("canvas");
            const ctx = cvschunk.getContext("2d");
            cvschunk.width = CHUNKSIZE;
            cvschunk.height = CHUNKSIZE;
            ctx.drawImage(chunk, 0, 0);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
            chunkloader[LAYERNUM][cy * LAYERCSIZES[LAYERNUM] + cx].src = cvschunk.toDataURL();
        }
    };

    const chunkcheckpxls = (chunkid) => {
        socket.on('chunkplace' + chunkid, (data) => {
            const { x, y, color } = data;
            const TILEX = Math.floor(PXCOORDX / 256);
            const TILEY = Math.floor(PXCOORDY / 256);
            const TILEPXLX = PXCOORDX - TILEX * 256;
            const TILEPXLY = PXCOORDY - TILEY * 256;
            const pxlcolor = paletteRef;
            setpixelchunk(TILEX, TILEY, TILEPXLX, TILEPXLY, pxlcolor);
        });
    };

    const draw = () => {
        if (CVSWIDTH !== context.canvas.width) {
            CVSWIDTH = context.canvas.width;
        }
        if (CVSHEIGHT !== context.canvas.height) {
            CVSHEIGHT = context.canvas.height;
        }
        context.clearRect(0, 0, CVSWIDTH, CVSHEIGHT);
        coordX = Math.floor(position.x / PIXELVIEWSIZE);
        coordY = Math.floor(position.y / PIXELVIEWSIZE);
        setValues();

        let layer;
        if (CANVASVIEWSIZE >= 256) {
            for (let i = LAYERNUM; i >= 0; i--) {
                if (LAYERSIZES[i] <= CANVASVIEWSIZE) {
                    layer = i;
                    break;
                }
            }
        } else {
            layer = 0;
        }

        currentLayer = layer;

        const layerchunks = (65536 / LAYERCSIZES[layer]);
        const layersize = LAYERCSIZES[layer] - SCALEFACTOR / layerchunks;
        const repx = Math.round(CVSWIDTH / 256) + 1;
        const repy = Math.round(CVSHEIGHT / 256) + 1;
        let startx = Math.floor(position.x / layersize) + 1;
        let starty = Math.floor(position.y / layersize) + 1;

        startx = Math.max(startx < 0 ? Math.abs(startx) : 0, 0);
        starty = Math.max(starty < 0 ? Math.abs(starty) : 0, 0);

        let chunkx = startx;
        let chunky = starty;

        if (layer == LAYERNUM) {
            context.imageSmoothingEnabled = false;
        } else {
            context.imageSmoothingEnabled = true;
        }

        const drawchunk = (cx, cy) => {
            const chunkid = cy * LAYERCSIZES[layer] + cx;

            const loadchunk = (img) => {
                context.drawImage(img, layersize * cx + position.x, layersize * cy + position.y, layersize, layersize);
            };

            if (chunkloaded[layer][chunkid] != null) {
                loadchunk(chunkloader[layer][chunkid]);
            } else {
                const chunk = new Image(CHUNKSIZE, CHUNKSIZE);
                chunk.src = tileserver + layer + "/" + cx + "/" + cy + ".png";
                loadchunk(loading);
                chunkloader[layer][chunkid] = chunk;

                chunk.onload = () => {
                    if (chunkloaded[layer][chunkid] == null) {
                        chunkcheckpxls(chunkid);
                        chunkloaded[layer][chunkid] = 1;
                    }
                };
            }
        };

        for (let i = 0; i < repy; i++) {
            for (let j = 0; j < repx; j++) {
                if (chunkx < layerchunks && chunky < layerchunks && chunkx < CVSWIDTH && chunky < CVSHEIGHT) {
                    drawchunk(chunkx, chunky);
                }
                chunkx++;
            }
            chunkx = startx;
            chunky++;
        }

        const drawpointer = () => {
            CANVASMX = mousePos.x - position.x;
            CANVASMY = mousePos.y - position.y;
            PRECPXCOORDX = CANVASMX / PIXELVIEWSIZE;
            PRECPXCOORDY = CANVASMY / PIXELVIEWSIZE;

            PXCOORDX = Math.floor(CANVASMX / PIXELVIEWSIZE);
            PXCOORDY = Math.floor(CANVASMY / PIXELVIEWSIZE);

            PXCOORDX = Math.min(PXCOORDX, CANVASSIZE - 1);
            PXCOORDX = Math.max(PXCOORDX, 0);

            PXCOORDY = Math.min(PXCOORDY, CANVASSIZE - 1);
            PXCOORDY = Math.max(PXCOORDY, 0);

            PXPOSX = PXCOORDX * PIXELVIEWSIZE;
            PXPOSY = PXCOORDY * PIXELVIEWSIZE;

            mouseX = PXCOORDX;
            mouseY = PXCOORDY;

            document.getElementById("coordbox").innerText = "(" + mouseX + ", " + mouseY + ")";

            context.fillStyle = paletteRef;
            context.fillRect(PXPOSX + position.x, PXPOSY + position.y, PIXELVIEWSIZE, PIXELVIEWSIZE);
        };

        drawpointer();
    };

    const handleScale = async (ds) => {
        if (ds !== undefined) {
            let move = (ds / 100) * (scale * 0.1);
            move = Math.sign(move) * Math.max(Math.abs(move), 0.001);
            scale -= move;
            scale = parseFloat(scale.toFixed(3));
            scale = Math.min(scale, 10);
            scale = Math.max(scale, 0.0035);
        }
    };

    const zoom = async (scaleChange, anchor) => {
        const PREVSCALE = (CANVASSIZE - SCALEFACTOR) / CANVASSIZE;
        await handleScale(scaleChange);
        setValues();
        const AFTERSCALE = (CANVASSIZE - SCALEFACTOR) / CANVASSIZE;

        if (anchor === "m") {
            position.x += (PREVSCALE - AFTERSCALE) * PRECPXCOORDX || 0;
            position.y += (PREVSCALE - AFTERSCALE) * PRECPXCOORDY || 0;
        } else {
            position.x += (PREVSCALE - AFTERSCALE) * (Math.abs(Math.min(position.x, 0)) / PIXELVIEWSIZE) || 0;
            position.y += (PREVSCALE - AFTERSCALE) * (Math.abs(Math.min(position.y, 0)) / PIXELVIEWSIZE) || 0;
        }
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastTouch.x;
            const deltaY = touch.clientY - lastTouch.y;
            lastTouch = { x: touch.clientX, y: touch.clientY };
            position.x += deltaX;
            position.y += deltaY;
        }
    };

    const handleTouchEnd = () => {
        isDragging = false;
    };

    let mouseDownTime = 0;
    let mouseDownCoords = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
        mouseDownTime = new Date().getTime();
        mouseDownCoords = { x: e.clientX, y: e.clientY };
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;

        if (isDragging) {
            const deltaX = e.clientX - lastMouse.x;
            const deltaY = e.clientY - lastMouse.y;
            lastMouse = { x: e.clientX, y: e.clientY };
            position.x += deltaX;
            position.y += deltaY;
        }
    };

    const handleMouseUp = () => {
        isDragging = false;
    };

    const handleClick = (e) => {
        if (!isDragging && mouseDownTime > new Date().getTime() - 300 && mouseDownCoords.x === e.clientX && mouseDownCoords.y === e.clientY) {
            const token = localStorage.getItem("token");
            if (!token) return;
            const sendpixel = (x, y, color) => {
                socket.emit("place", { x, y, color, token });
            };
            const pixelColor = paletteRef;
            if (currentLayer == LAYERNUM) {
                sendpixel(PXCOORDX, PXCOORDY, pixelColor);
            }
        }
    };

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.imageSmoothingEnabled = false;
    };

    const handleWheel = async (e) => {
        await zoom(e.deltaY, "m");
    };

    const initializeEventListeners = () => {
        context.canvas.addEventListener('touchstart', handleTouchStart);
        context.canvas.addEventListener('touchmove', handleTouchMove);
        context.canvas.addEventListener('touchend', handleTouchEnd);
        context.canvas.addEventListener('mousedown', handleMouseDown);
        context.canvas.addEventListener('mousemove', handleMouseMove);
        context.canvas.addEventListener('mouseup', handleMouseUp);
        context.canvas.addEventListener('click', handleClick);
        window.addEventListener('resize', handleResize);
        context.canvas.addEventListener('wheel', handleWheel);
    };

    const cleanupEventListeners = () => {
        context.canvas.removeEventListener('touchstart', handleTouchStart);
        context.canvas.removeEventListener('touchmove', handleTouchMove);
        context.canvas.removeEventListener('touchend', handleTouchEnd);
        context.canvas.removeEventListener('mousedown', handleMouseDown);
        context.canvas.removeEventListener('mousemove', handleMouseMove);
        context.canvas.removeEventListener('mouseup', handleMouseUp);
        context.canvas.removeEventListener('click', handleClick);
        window.removeEventListener('resize', handleResize);
        context.canvas.removeEventListener('wheel', handleWheel);
    };

    const startDrawing = () => {
        const interval = setInterval(draw, 16);
        return () => {
            clearInterval(interval);
            cleanupEventListeners();
        };
    };

    initializeEventListeners();
    startDrawing();
};

export default Movement;