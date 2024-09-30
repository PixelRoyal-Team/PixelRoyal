import { useState, useEffect } from 'react';

import CloseBtn from '/pixelroyal/src/public/ui/close.svg';

import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

import '../ui/Menu/menu.css'

const DarkBg = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "black",
  opacity: "0.5",
  zIndex: "1"
}

const ContentStyle = {
  padding: "10px",
  overflowY: "auto",
  flex: "1 1 0%", // Allow content to grow and fill the remaining space
  boxSizing: "border-box",
  textAlign: "center"
}

const CloseBtnStyle = {
  float: "right",
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  boxShadow: "inset 0 0 0 3px darkgray",
  margin: "3px",
}

const iconstyle = {
  margin: "5px",
  width: "20px",
  height: "20px"
}

export default function Menu({ show, setShow }) {

  const [menuOpacity, setMenuOpacity] = useState(0);

  useEffect(() => {
    if (show) {
      setMenuOpacity(1)
    } else {

    }
  }, [show]);

  function closeMenu() {
    setMenuOpacity(0)
    setTimeout(() => { setShow(false) }, 301)
  }

  const [file, setFile] = useState();
  function handleChange(e) {
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
  }

  return (
    <>
      <div id="menuGroup" style={{ opacity: menuOpacity, display: `${show == true ? "flex" : "none"}` }} >
        <div id="dark" style={DarkBg} onClick={() => closeMenu()}> </div>
        <div id="menu" className={'menu'} >
          <div id="close" style={CloseBtnStyle} onClick={() => closeMenu()}>
            <img src={CloseBtn} style={iconstyle}></img>
          </div>
          <div id="content" class='modtools' style={ContentStyle}>
            <h4 id='first'>Ban a player</h4>
            <label>Enter a nickname</label>
            <input type="text" />
            <button>Submit</button>

            <h4>Rollback</h4>
            <label>Start X_Y</label>
            <input type="text" placeholder='X_Y' />
            <label>End X_Y</label>
            <input type="text" placeholder='X_Y' />
            <button>Submit</button>

            <h4>Load</h4>
            <label>Enter X_Y</label>
            <input type="text" placeholder='X_Y' />
            <img src={file} height={!file? 0:80}/>
            <label>Add Image:</label>
            <input type="file" onChange={handleChange} />
            <button>Submit</button>

            <h4>Protect</h4>
            <label>Start X_Y</label>
            <input type="text" placeholder='X_Y' />
            <label>End X_Y</label>
            <input type="text" placeholder='X_Y' />
            <button>Submit</button>

          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
