import React, { useEffect, useRef } from 'react';

import Buttons from '../ui/Buttons';

import loadingchunkimg from '/pixgame/src/public/game/LoadingChunk.png';
import pointerimg from '/pixgame/src/public/game/pxpointer.png'

const Movement = ({ canvas, context, handle }) => {
  //setup
  context.imageSmoothingEnabled = false;
  
  var CVSWIDTH = context.canvas.width;
  var CVSHEIGHT = context.canvas.height;

  
  
  const CANVASSIZE = 256*256;
  const CHUNKSIZE = 256;
  
  //const position = useRef({ x: -(canvassize/2-cvswidth/2), y: -(canvassize/2-cvsheight/2) });
  const position = useRef({ x: 0, y: 0 });
  const scale = useRef(0);
  const mousePos = useRef({ x: 0, y: 0});
  const isDragging = useRef(false);
  const lastTouch = useRef(null);
  const lastMouse = useRef(null);
  
  const tileserver = new URL(location.protocol + "//" + location.hostname + ":3002");
  
  //load assets
  var loading = new Image()
 loading.src = loadingchunkimg;
  var pointer = new Image()
  pointer.src = pointerimg;
  var chunkloader = [[],[],[],[],[],[],[],[],[]];
  
  const draw = () => {
    
    if (CVSWIDTH != context.canvas.width) {
      CVSWIDTH = context.canvas.width;
      console.log("Canvas width updated:", CVSWIDTH);
    }
    if (CVSHEIGHT != context.canvas.height) {
      CVSHEIGHT = context.canvas.height;
      console.log("Canvas height updated:", CVSHEIGHT);
    }
    
    context.clearRect(0, 0, CVSWIDTH, CVSHEIGHT);
    
    //context.save();
    //context.scale(scale, scale);

    //CALCULATE LAYERS DEMO WORK IN PROGRESS!!!
    
    const CANVASVIEWSIZE = CANVASSIZE-scale.current; //How much canvas is big on render
    const PIXELVIEWSIZE = CANVASVIEWSIZE/CANVASSIZE; //How much pixels are big on render
    const LAYERNUM = 8;
    const LAYERSIZES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
    const LAYERCSIZES = [65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256];

    var layer;

    if (CANVASVIEWSIZE >= 256) {
    for (let i = LAYERNUM; i >= 0; i--) {
      if (LAYERSIZES[i] <= CANVASVIEWSIZE) {
        var layer = i;
        break;
      }
    }
    } else {
      var layer = 0;
    }
    
    var layerchunks = (65536/LAYERCSIZES[layer]); //How many chunks are in a layer
    var layersize = LAYERCSIZES[layer]-Math.round(scale.current/layerchunks); //How big is the layer chunks also affected by scale
    
    var repx = Math.round(CVSWIDTH / 256)+1;
    var repy = Math.round(CVSHEIGHT / 256)+1;

    var startx = Math.floor(position.current.x / layersize)+1;
    var starty = Math.floor(position.current.y / layersize)+1;

    if (startx < 0) {
      startx = Math.abs(startx);
    } else {
      startx = 0;
    }
    if (starty < 0) {
      starty = Math.abs(starty);
    } else {
      starty = 0;
    }
    
    var chunkx = startx;
    var chunky = starty;

    function drawchunk(cx, cy) {
      const chunkid = cy * LAYERCSIZES[layer] + cx;

      function loadchunk(img) {
        context.drawImage(img, layersize  * cx + position.current.x, layersize * cy + position.current.y, layersize, layersize);
      }
      
      if (chunkloader[layer][chunkid] != null) {
        loadchunk(chunkloader[layer][chunkid]);
      } else {
        
        var chunk = new Image(CHUNKSIZE, CHUNKSIZE);
        chunk.src = tileserver + "/" + layer + "/"+ cx + "/" + cy + ".png";

        loadchunk(loading);
        
        chunk.onload = () => {
          //loadchunk(chunk);
          chunkloader[layer][chunkid] = chunk;
        }
      }
    }
    
    for (let i = 0; i < repy; i++) {
      for (let i = 0; i < repx; i++) {
        if (chunkx < layerchunks && chunky < layerchunks && chunkx < CVSWIDTH && chunky < CVSHEIGHT) {  //check if chunks dont clip out canvas or arent more than the ones needed
          drawchunk(chunkx, chunky);
        }
        chunkx++;
      }
      chunkx = startx;
      chunky++;
    }
    //context.restore();
    function drawpointer() {
      let CANVASMX = mousePos.current.x - position.current.x;
      let CANVASMY = mousePos.current.y - position.current.y;

      let PXPOSX = Math.floor(CANVASMX/PIXELVIEWSIZE)*PIXELVIEWSIZE;
      let PXPOSY = Math.floor(CANVASMY/PIXELVIEWSIZE)*PIXELVIEWSIZE;
      
      context.fillRect(PXPOSX+position.current.x, PXPOSY+position.current.y, PIXELVIEWSIZE, PIXELVIEWSIZE);
    }

    drawpointer();
  };

  const handleScale = (ds) => {
    if (ds !== undefined) {
      const move = Math.round(ds * (((2000000+CANVASSIZE-256)-(scale.current+2000000)) * 0.0001));

      scale.current += move;

      scale.current = Math.min(scale.current, CANVASSIZE-256);
      scale.current = Math.max(scale.current, -2000000);
    }
  }

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

      position.current.x += deltaX;
      position.current.y += deltaY;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
     mousePos.current = { x: e.clientX, y: e.clientY };
    
    if (isDragging.current) {
      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      position.current.x += deltaX;
      position.current.y += deltaY;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.imageSmoothingEnabled = false;
  };

  const handleWheel = (e) => {
    handleScale(e.deltaY);
  };
  
  useEffect(() => {
    setInterval(draw, 1);
    
    context.canvas.addEventListener('touchstart', handleTouchStart);
    context.canvas.addEventListener('touchmove', handleTouchMove);
    context.canvas.addEventListener('touchend', handleTouchEnd);
    context.canvas.addEventListener('mousedown', handleMouseDown);
    context.canvas.addEventListener('mousemove', handleMouseMove);
    context.canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    context.canvas.addEventListener('wheel', handleWheel);

    return () => {
      context.canvas.removeEventListener('touchstart', handleTouchStart);
      context.canvas.removeEventListener('touchmove', handleTouchMove);
      context.canvas.removeEventListener('touchend', handleTouchEnd);
      context.canvas.removeEventListener('mousedown', handleMouseDown);
      context.canvas.removeEventListener('mousemove', handleMouseMove);
      context.canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      context.canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvas, context]);

  return (
    <Buttons bar="corner" zoomin={() => handleScale(500)} zoomout={() => handleScale(-500)}/>
  );


};

export default Movement;