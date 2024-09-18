import React, { useEffect, useRef, useState } from 'react';
import socket from '../components/socket';

import Buttons from '../ui/Buttons';

import loadingchunkimg from '../public/game/LoadingChunk.png';
import pointerimg from '../public/game/pxpointer.png'

const Movement = ({ canvas, context, handle }) => {

  //setup global
  context.imageSmoothingEnabled = false;
  
  var CVSWIDTH = context.canvas.width;
  var CVSHEIGHT = context.canvas.height;

  var CANVASMX;
  var CANVASMY;

  var PXPOSX;
  var PXPOSY;
 
  var PRECPXCOORDX;
  var PRECPXCOORDY;
  
  var PXCOORDX;
  var PXCOORDY;
  
  const CANVASSIZE = 256*256;
  const CHUNKSIZE = 256;
  var CANVASVIEWSIZE;
  var PIXELVIEWSIZE;
  var SCALEFACTOR;
  const LAYERNUM = 8;
  const LAYERSIZES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
  const LAYERCSIZES = [65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256];
  
  //const position = useRef({ x: -(CANVASSIZE/2-CVSWIDTH/2), y: -(CANVASSIZE/2-CVSWIDTH/2) });
  const position = useRef({ x: 0, y: 0 });
  const scale = useRef(1);
  const mousePos = useRef({ x: 0, y: 0});
  const isDragging = useRef(false);
  const lastTouch = useRef(null);
  const lastMouse = useRef(null);
  
  const paletteRef = useRef(null);

  const [coordX, setCoordX] = useState(0);
  const [coordY, setCoordY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  
  const tileserver = new URL(location.protocol + "//" + location.hostname + ":" + location.port + "/tiles/");
  
  //load assets
  var loading = new Image()
 loading.src = loadingchunkimg;
  var pointer = new Image()
  pointer.src = pointerimg;
  var chunkloader = [[],[],[],[],[],[],[],[],[]];
  var chunkloaded = [[],[],[],[],[],[],[],[],[]];

  function setValues() {
    PIXELVIEWSIZE = scale.current;
    CANVASVIEWSIZE = PIXELVIEWSIZE*CANVASSIZE;
    SCALEFACTOR = CANVASSIZE-CANVASVIEWSIZE;
  }
  
  async function setpixelchunk(cx, cy, x, y, color) {
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
  }
  
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

    setCoordX(Math.floor(position.current.x/PIXELVIEWSIZE)+(CANVASSIZE/2-CVSWIDTH/2));
    setCoordY(Math.floor(position.current.y/PIXELVIEWSIZE)+(CANVASSIZE/2-CVSWIDTH/2));
    
    //CALCULATE LAYERS

    setValues();
    
    var layer;

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
    
    var layerchunks = (65536/LAYERCSIZES[layer]); //How many chunks are in a layer
    var layersize = LAYERCSIZES[layer]-SCALEFACTOR/layerchunks; //How big is the layer chunks also affected by scale
    
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
    
	function chunkcheckpxls(chunkid) {
		socket.on('chunkplace' + chunkid, (data) => {
			const {x, y, color} = data;
			
			const TILEX = Math.floor(PXCOORDX/256);
            const TILEY = Math.floor(PXCOORDY/256);
  
            const TILEPXLX = PXCOORDX-TILEX*256;
            const TILEPXLY = PXCOORDY-TILEY*256;
			
			console.log(chunkid+": "+TILEPXLX);
			
			let pxlcolor = paletteRef.current.value;
			
			setpixelchunk(TILEX, TILEY, TILEPXLX, TILEPXLY, pxlcolor);
		});
		 return () => {
	       socket.off('chunkplace'+chunkid);
        };
	}
  
    function drawchunk(cx, cy) {
      const chunkid = cy * LAYERCSIZES[layer] + cx;

      function loadchunk(img) {
        context.drawImage(img, layersize  * cx + position.current.x, layersize * cy + position.current.y, layersize, layersize);
      }
      
      if (chunkloaded[layer][chunkid] != null) {
        loadchunk(chunkloader[layer][chunkid]);
      } else {
        
        var chunk = new Image(CHUNKSIZE, CHUNKSIZE);
        chunk.src = tileserver + layer + "/"+ cx + "/" + cy + ".png";

        loadchunk(loading);
        
		chunkloader[layer][chunkid] = chunk;
		
        chunk.onload = () => {
          //loadchunk(chunk);
		  if (chunkloaded[layer][chunkid] == null) {
			 console.log(chunkloaded[layer][chunkid]);
		  	chunkcheckpxls(chunkid);
			chunkloaded[layer][chunkid] = 1;
	        console.log("checked"+chunkid);
		  }
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
	
    function drawpointer() {
      CANVASMX = mousePos.current.x - position.current.x;
      CANVASMY = mousePos.current.y - position.current.y;

      PRECPXCOORDX = CANVASMX/PIXELVIEWSIZE;
	  PRECPXCOORDY = CANVASMY/PIXELVIEWSIZE;
	  
      PXCOORDX = Math.floor(CANVASMX/PIXELVIEWSIZE);
      PXCOORDY = Math.floor(CANVASMY/PIXELVIEWSIZE);
      
	  PXCOORDX = Math.min(PXCOORDX, CANVASSIZE-1);
      PXCOORDX = Math.max(PXCOORDX, 0);
	  
	  PXCOORDY = Math.min(PXCOORDY, CANVASSIZE-1);
      PXCOORDY = Math.max(PXCOORDY, 0);
	  
	  PXPOSX = PXCOORDX*PIXELVIEWSIZE;
      PXPOSY = PXCOORDY*PIXELVIEWSIZE;
	  
      setMouseX(PXCOORDX);
      setMouseY(PXCOORDY);

      context.fillStyle = paletteRef.current.value;
      context.fillRect(PXPOSX+position.current.x, PXPOSY+position.current.y, PIXELVIEWSIZE, PIXELVIEWSIZE);
    }

    drawpointer();
  };
  
  const handleScale = async (ds) => {
    if (ds !== undefined) {
      
      let move = (ds/100)*(scale.current*0.1);
	  move = Math.sign(move)*Math.max(Math.abs(move), 0.001);
      
      scale.current -= move;

      scale.current = (scale.current).toFixed(3);

      scale.current = Math.min(scale.current, 10);
      scale.current = Math.max(scale.current, 0.0035);
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

  const handleClick = () => {
	if (!isDragging.current) {
	console.log("click");
    function sendpixel(x, y, color) {
	  socket.emit("place", {x, y, color});
	  console.log("sent pixel");
    }
	
	sendpixel(PXCOORDX, PXCOORDY, paletteRef.current.value);
	}
	
	//setpixelchunk(TILEX, TILEY, TILEPXLX, TILEPXLY);
  }
  
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.imageSmoothingEnabled = false;
  };

  const handleWheel = async (e) => {
    let PREVSCALE = (CANVASSIZE-SCALEFACTOR)/CANVASSIZE;
    
    await handleScale(e.deltaY);
    
    setValues();

    let AFTERSCALE = (CANVASSIZE-SCALEFACTOR)/CANVASSIZE;

    //ANCHOR:
    position.current.x += (PREVSCALE-AFTERSCALE)*PRECPXCOORDX;
    position.current.y += (PREVSCALE-AFTERSCALE)*PRECPXCOORDY;
  };
  
  useEffect(() => {
    setInterval(draw, 1);
    
    context.canvas.addEventListener('touchstart', handleTouchStart);
    context.canvas.addEventListener('touchmove', handleTouchMove);
    context.canvas.addEventListener('touchend', handleTouchEnd);
    context.canvas.addEventListener('mousedown', handleMouseDown);
    context.canvas.addEventListener('mousemove', handleMouseMove);
    context.canvas.addEventListener('mouseup', handleMouseUp);
	context.canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    context.canvas.addEventListener('wheel', handleWheel);

    return () => {
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
  }, [canvas, context]);

  return (
    <>
    <Buttons bar="corner" zoomin={() => handleScale(500)} zoomout={() => handleScale(-500)} posx={coordX} posy={coordY} mousex={mouseX} mousey={mouseY}/>
	<Buttons bar="palette" paletteRef={paletteRef}/>
	</>
  );


};

export default Movement;