import React, { useRef, useEffect, useState, forwardRef } from 'react';
import Movement from './Render';

const Canvas = forwardRef((props, ref) => {

  return <canvas id="viewport" ref={ref}></canvas>;
});

const Viewport = () => {
  const canvasRef = useRef();
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setCanvas(canvas);
    setContext(canvas.getContext('2d'));
  }, []);

  return (
    <div>
      <Canvas ref={canvasRef} />
      {canvas && context && <Movement canvas={canvas} context={context} />}
    </div>
  );
};

export default Viewport;
