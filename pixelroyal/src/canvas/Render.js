import socket from '../components/socket';
//import Buttons from '../ui/Buttons';

import loadingchunkimg from '../public/game/LoadingChunk.png';
import pointerimg from '../public/game/pxpointer.png';

const Movement = (canvas, context) => {
    const CVSWIDTH = { current: context.canvas.width };
    const CVSHEIGHT = { current: context.canvas.height };
    const CANVASMX = { current: 0 };
    const CANVASMY = { current: 0 };
    const PXPOSX = { current: 0 };
    const PXPOSY = { current: 0 };
    const PRECPXCOORDX = { current: 0 };
    const PRECPXCOORDY = { current: 0 };
    const PXCOORDX = { current: 0 };
    const PXCOORDY = { current: 0 };

    console.log("render");
    const CANVASSIZE = 256 * 256;
    const CHUNKSIZE = 256;
    const CANVASVIEWSIZE = { current: 0 };
    const PIXELVIEWSIZE = { current: 0 };
    const SCALEFACTOR = { current: 0 };
    const LAYERNUM = 8;
    const LAYERSIZES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
    const LAYERCSIZES = [65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256];

    const position = { x: 0, y: 0 };
    const scale = { current: 1 };
    const mousePos = { x: 0, y: 0 };
    const isDragging = { current: false };
    const lastTouch = { current: null };
    const lastMouse = { current: null };

    const paletteRef = { current: 'black' };
    let coordX = 0;
    let coordY = 0;
    let mouseX = 0;
    let mouseY = 0;

    context.imageSmoothingEnabled = false;
    const tileserver = new URL(location.protocol + "//" + location.hostname + ":" + location.port + "/tiles/");

    const loading = new Image();
    loading.src = loadingchunkimg;
    const pointer = new Image();
    pointer.src = pointerimg;
    const chunkloader = [[], [], [], [], [], [], [], [], []];
    const chunkloaded = [[], [], [], [], [], [], [], [], []];

    const setValues = () => {
        PIXELVIEWSIZE.current = scale.current;
        CANVASVIEWSIZE.current = PIXELVIEWSIZE.current * CANVASSIZE;
        SCALEFACTOR.current = CANVASSIZE - CANVASVIEWSIZE.current;
    };

    const setpixelchunk = async (cx, cy, x, y, color) => {
        const chunk = await chunkloader[LAYERNUM][cy * LAYERCSIZES[LAYERNUM] + cx];
        if (chunk != null) {
            let cvschunk = document.createElement("canvas");
            let ctx = cvschunk.getContext("2d");
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
            const TILEX = Math.floor(PXCOORDX.current / 256);
            const TILEY = Math.floor(PXCOORDY.current / 256);
            const TILEPXLX = PXCOORDX.current - TILEX * 256;
            const TILEPXLY = PXCOORDY.current - TILEY * 256;
            let pxlcolor = paletteRef.current;
            setpixelchunk(TILEX, TILEY, TILEPXLX, TILEPXLY, pxlcolor);
        });
        return () => {
            socket.off('chunkplace' + chunkid);
        };
    };

    const draw = () => {
        if (CVSWIDTH.current !== context.canvas.width) {
            CVSWIDTH.current = context.canvas.width;
        }
        if (CVSHEIGHT.current !== context.canvas.height) {
            CVSHEIGHT.current = context.canvas.height;
        }
        context.clearRect(0, 0, CVSWIDTH.current, CVSHEIGHT.current);
        coordX = Math.floor(position.x / PIXELVIEWSIZE.current);
        coordY = Math.floor(position.y / PIXELVIEWSIZE.current);
        setValues();

        let layer;
        if (CANVASVIEWSIZE.current >= 256) {
            for (let i = LAYERNUM; i >= 0; i--) {
                if (LAYERSIZES[i] <= CANVASVIEWSIZE.current) {
                    layer = i;
                    break;
                }
            }
        } else {
            layer = 0;
        }

        let layerchunks = (65536 / LAYERCSIZES[layer]);
        let layersize = LAYERCSIZES[layer] - SCALEFACTOR.current / layerchunks;
        let repx = Math.round(CVSWIDTH.current / 256) + 1;
        let repy = Math.round(CVSHEIGHT.current / 256) + 1;
        let startx = Math.floor(position.x / layersize) + 1;
        let starty = Math.floor(position.y / layersize) + 1;

        startx = Math.max(startx < 0 ? Math.abs(startx) : 0, 0);
        starty = Math.max(starty < 0 ? Math.abs(starty) : 0, 0);

        let chunkx = startx;
        let chunky = starty;

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
                if (chunkx < layerchunks && chunky < layerchunks && chunkx < CVSWIDTH.current && chunky < CVSHEIGHT.current) {
                    drawchunk(chunkx, chunky);
                }
                chunkx++;
            }
            chunkx = startx;
            chunky++;
        }

        const drawpointer = () => {
            CANVASMX.current = mousePos.x - position.x;
            CANVASMY.current = mousePos.y - position.y;
            PRECPXCOORDX.current = CANVASMX.current / PIXELVIEWSIZE.current;
            PRECPXCOORDY.current = CANVASMY.current / PIXELVIEWSIZE.current;

            PXCOORDX.current = Math.floor(CANVASMX.current / PIXELVIEWSIZE.current);
            PXCOORDY.current = Math.floor(CANVASMY.current / PIXELVIEWSIZE.current);

            PXCOORDX.current = Math.min(PXCOORDX.current, CANVASSIZE - 1);
            PXCOORDX.current = Math.max(PXCOORDX.current, 0);

            PXCOORDY.current = Math.min(PXCOORDY.current, CANVASSIZE - 1);
            PXCOORDY.current = Math.max(PXCOORDY.current, 0);

            PXPOSX.current = PXCOORDX.current * PIXELVIEWSIZE.current;
            PXPOSY.current = PXCOORDY.current * PIXELVIEWSIZE.current;

            mouseX = PXCOORDX.current;
            mouseY = PXCOORDY.current;

            context.fillStyle = paletteRef.current;
            context.fillRect(PXPOSX.current + position.x, PXPOSY.current + position.y, PIXELVIEWSIZE.current, PIXELVIEWSIZE.current);
        };

        drawpointer();
    };

    const handleScale = async (ds) => {
        if (ds !== undefined) {
            let move = (ds / 100) * (scale.current * 0.1);
            move = Math.sign(move) * Math.max(Math.abs(move), 0.001);
            scale.current -= move;
            scale.current = parseFloat(scale.current.toFixed(3));
            scale.current = Math.min(scale.current, 10);
            scale.current = Math.max(scale.current, 0.0035);
        }
    };

    const zoom = async (scaleChange, anchor) => {
        let PREVSCALE = (CANVASSIZE - SCALEFACTOR.current) / CANVASSIZE;
        await handleScale(scaleChange);
        setValues();
        let AFTERSCALE = (CANVASSIZE - SCALEFACTOR.current) / CANVASSIZE;

        if (anchor === "m") {
            position.x += (PREVSCALE - AFTERSCALE) * PRECPXCOORDX.current || 0;
            position.y += (PREVSCALE - AFTERSCALE) * PRECPXCOORDY.current || 0;
        } else {
            position.x += (PREVSCALE - AFTERSCALE) * (Math.abs(Math.min(position.x, 0)) / PIXELVIEWSIZE.current) || 0;
            position.y += (PREVSCALE - AFTERSCALE) * (Math.abs(Math.min(position.y, 0)) / PIXELVIEWSIZE.current) || 0;
        }
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            isDragging.current = true;
            lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging.current && e.touches.length === 1) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastTouch.current.x;
            const deltaY = touch.clientY - lastTouch.current.y;
            lastTouch.current = { x: touch.clientX, y: touch.clientY };
            position.x += deltaX;
            position.y += deltaY;
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    let mouseDownTime = 0;
    let mouseDownCoords = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
        mouseDownTime = new Date().getTime();
        mouseDownCoords = { x: e.clientX, y: e.clientY };
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;

        if (isDragging.current) {
            const deltaX = e.clientX - lastMouse.current.x;
            const deltaY = e.clientY - lastMouse.current.y;
            lastMouse.current = { x: e.clientX, y: e.clientY };
            position.x += deltaX;
            position.y += deltaY;
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleClick = (e) => {
        if (!isDragging.current && mouseDownTime > new Date().getTime() - 300 && mouseDownCoords.x === e.clientX && mouseDownCoords.y === e.clientY) {
            const sendpixel = (x, y, color) => {
                socket.emit("place", { x, y, color });
            };
            const pixelColor = paletteRef.current;
            sendpixel(PXCOORDX.current, PXCOORDY.current, pixelColor);
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
    const cleanup = startDrawing();

    return () => {
        cleanup();
    };
};

export default Movement;