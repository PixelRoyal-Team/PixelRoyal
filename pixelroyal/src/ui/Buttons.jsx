import menubtn from '/pixelroyal/src/public/ui/menu.svg';
import chatbtn from '/pixelroyal/src/public/ui/chat.svg';
import modtoolsbtn from '/pixelroyal/src/public/ui/modtools.svg';
import zoomin from '/pixelroyal/src/public/ui/zoomin.svg';
import zoomout from '/pixelroyal/src/public/ui/zoomout.svg';

import axios from 'axios';
import { verify } from './Menu/Account';

import Menu from './Menu/Menu';
import Chat from '../components/chat';
import Modtools from '../components/Modtools';
import Colors from '../canvas/Colors';

import { useEffect, useState } from 'react';

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

const PaletteBoxStyle = {
    display: "flex",
	flexDirection: "column",
	alignItems: "center",
    padding: "3px",
	backgroundColor: "lightgray",
    border: "2px solid darkgray"
}

const PaletteBtnStyle = {
    width: "20px",
	height: "20px"
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
      <p id={props.name}>{props.text}</p>
    </div>
  )
}

const PaletteBtn = (props) => {
	return (
	   <div id={props.id} style={{...PaletteBtnStyle, backgroundColor: props.color}}></div>
	)
}

const ColorSelect = (props) => {
  return (
    <input type="color"	style={ColorSelectStyle} />
  )
}

const SideButtons = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showModtools, setShowModtools] = useState(false);
  const [adminLevel, setAdminLevel] = useState(0);

  useEffect(() => {
    const v = verify()
    if (v) {
      axios.get(`${window.location.protocol}//${window.location.host}/getAdminLevel/${v.id}`)
        .then(function (response) {
          setAdminLevel(response.data.admin_level)
        })
    }
  }, [])

  const ShowMenu = () => {
    return <Menu show={showMenu} setShow={setShowMenu} />;
  }

  const ShowChat = () => {
    if (showChat) {
      return <Chat />;
      //return null;
    }
  }

  const ShowModtools = () => {
    return <Modtools show={showModtools} setShow={setShowModtools} />;
  }

  return (
    <>
      <ShowChat />

      <div id="SideBar" style={barstyle}>
        <IconButton btn={menubtn} click={() => setShowMenu(!showMenu)} />
        <IconButton btn={chatbtn} click={() => setShowChat(!showChat)} />
        {adminLevel > 0 ? <IconButton btn={modtoolsbtn} click={() => setShowModtools(!showModtools)} /> : null}
      </div>
      <ShowMenu />
      <ShowModtools />
    </>
  )
}

const CornerButtons = (props) => {
  return (
    <>
      <div id="BottomBar" style={cornerstyle}>
        <div id="zoom" style={{ pointerEvents: "none" }}>
          <IconButton btn={zoomin} click={props.zoomin} />
          <IconButton btn={zoomout} click={props.zoomout} />
        </div>
        <TextBox name="coordbox" text="(x, y)" />
      </div>
    </>
  )
}


const Palette = (props) => {
  return (
    <>
      <div id="PaletteBar" style={PalletteStyle}>
	    <div id="PaletteBox" style={PaletteBoxStyle}>
            {Colors.map((color, index) => <PaletteBtn id={index} color={color} />)}
		</div>
      </div>
    </>
  );
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