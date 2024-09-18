import menubtn from '/pixelroyal/src/public/ui/menu.svg';
import chatbtn from '/pixelroyal/src/public/ui/chat.svg';
import zoomin from '/pixelroyal/src/public/ui/zoomin.svg';
import zoomout from '/pixelroyal/src/public/ui/zoomout.svg';

import Menu from './Menu/Menu';
//import ChatBox from '../components/Chatbox';

import { useState } from 'react';

const barstyle = {
  position: "absolute",
  top: "0px",
  margin: "7px"
}

const cornerstyle = {
  position: "absolute",
  bottom: "0px",
  margin: "7px",
  pointerEvents: "none"
}

const PalletteStyle = {
  position: "absolute",
  bottom: "0px",
  right: "0px",
  padding: "7px"
}

const ColorSelectStyle = {
  width: "40px",
  height: "40px"
}
const iconstyle = {
  width: "20px",
  height: "20px"
}

const btnstyle = {
  width: "40px",
  height: "40px",
  borderRadius: "7px",
  border: "1px solid #505050",
  margin: "3px",
  pointerEvents: "auto",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  cursor: 'pointer'
}

const TextBoxStyle = {
  //width: "80px",
  height: "40px",
  borderRadius: "7px",
  border: "1px solid #505050",
  backgroundColor: "white",
  margin: "3px",
  padding: "0 12px",
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: "auto"
}

const IconButton = (props) => {
  return (
    <div onClick={props.click} className="btn" style={btnstyle}>
      <img style={iconstyle} src={props.btn} />
    </div>
  )
}

const TextBox = (props) => {
  return (
    <div className="txtbox" style={TextBoxStyle}>
      <p>{props.text}</p>
    </div>
  )  
}

const ColorSelect = (props) => {
  return (
	  <input type="color" ref={props.paletteRef} style={ColorSelectStyle} />
  )
}

const SideButtons = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const ShowMenu = () => {
    return <Menu show={showMenu} setShow={setShowMenu} />;
  }

  const ShowChat = () => {
    if (showChat) {
      return <ChatBox />;
      //return null;
    }
  }

  return (
    <>
    <ShowMenu />
    <ShowChat />

    <div id="SideBar" style={barstyle}>
    <IconButton btn={menubtn} click={() => setShowMenu(!showMenu)} />
    <IconButton btn={chatbtn} click={() => setShowChat(!showChat)} />
    </div>
    </>
  )
}

const CornerButtons = (props) => {
  return (
    <>
    <div id="BottomBar" style={cornerstyle}>
    <div id="zoom" style={{pointerEvents: "none"}}>
    <IconButton btn={zoomin} click={props.zoomin}/>
    <IconButton btn={zoomout} click={props.zoomout}/>
    </div>
    <TextBox text={`(${props.posx}, ${props.posy}), (${props.mousex}, ${props.mousey})`} />
    </div>
    </>
  )
}

const Palette = (props) => {
  return (
    <>
	<div id="PaletteBar" style={PalletteStyle} >
    <ColorSelect paletteRef={props.paletteRef} />
	</div>
    </>
  )	
}

export default function Buttons(props) {
  if (props.bar == "side") {
  return (
    <SideButtons />
  )
  } else if (props.bar == "corner") {
  return (
    <CornerButtons zoomin={props.zoomin} zoomout={props.zoomout} posx={props.posx} posy={props.posy} mousex={props.mousex} mousey={props.mousey} />
  )
  } else if (props.bar == "palette") {
	return (
	  <Palette paletteRef={props.paletteRef} />
	)
  } else {
    return null;
  }
}