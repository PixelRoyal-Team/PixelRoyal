import menubtn from '/pixgame/src/public/ui/menu.svg';
import chatbtn from '/pixgame/src/public/ui/chat.svg';
import zoomin from '/pixgame/src/public/ui/zoomin.svg';
import zoomout from '/pixgame/src/public/ui/zoomout.svg';

import Menu from './Menu/Menu';
import ChatBox from '../components/Chatbox';

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

const iconstyle = {
  margin: "5px",
  width: "30px",
  height: "30px"
}

const btnstyle = {
  width: "40px",
  height: "40px",
  borderRadius: "5px",
  border: "1px solid black",
  boxShadow: "inset 0 0 0 3px darkgray",
  margin: "3px",
  pointerEvents: "auto"
}

const TextBoxStyle = {
  //width: "80px",
  height: "40px",
  borderRadius: "5px",
  border: "1px solid black",
  backgroundColor: "white",
  boxShadow: "inset 0 0 0 3px darkgray",
  margin: "3px",
  padding: "3px",
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

export default function Buttons(props) {
  if (props.bar == "side") {
  return (
    <SideButtons />
  )
  } else if (props.bar == "corner") {
  return (
    <CornerButtons zoomin={props.zoomin} zoomout={props.zoomout} posx={props.posx} posy={props.posy} mousex={props.mousex} mousey={props.mousey} />
  )
  } else {
    return null;
  }
}