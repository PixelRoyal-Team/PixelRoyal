import { useState, useEffect } from 'react';

import Info from './Info';
import Account from './Account';
import Rules from './Rules';
import Support from './Support';

const MenuStyle = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  color: "black",
  backgroundColor: "white",
  width: "60%",
  height: "70%",
  border: "2px solid black",
  borderRadius: "5px",
  padding: "5px",
  boxShadow: "0 0 5px 5px darkgray",
  boxSizing: "border-box",
  overflow: "hidden",
  //display: "flex",
  flexDirection: "column",
}

const TabListStyle = {
  borderBottom: "2px solid lightgray",
  justifyContent: "center",
  display: "flex"
}

const TabBtnStyle = {
  border: "none",
  width: "120px",
  height: "40px",
  backgroundColor: "white",
  color: "darkgray",
  textAlign: "center",
  display: "block",
}

const TabBtnClickStyle = {
  border: "2px solid #007399",
  borderRadius: "5px",
  width: "120px",
  height: "40px",
  backgroundColor: "#0099cc",
  color: "white",
  textAlign: "center",
  display: "block",
}

const ContentStyle = {
  padding: "10px",
  overflowY: "auto",
  height: "100%"
}

const List = {
  display: "inline-block",
  //justifyContent: "space-between",
  listStyle: "none",
  margin: "0",
  padding: "0"
}

const BtnListStyle = {
  float: "left",
  paddingBottom: "5px"
}

export default function Menu({show}) {
  const [showContent, setShowContent] = useState(1);
  const [buttonHighlight, setButtonHighlight] = useState(1);

  const [menuOpacity, setMenuOpacity] = useState(0);
  const [menuDisplay, setMenuDisplay] = useState("none");
    
  useEffect(() => {
    
    if (show) {
      setMenuOpacity(1);
      setMenuDisplay("flex");
    } else {
      setMenuOpacity(0);
      setMenuDisplay("none");
    }

  }, [show]);
  
  function ButtonClicked(id) {
    setShowContent(id);
    setButtonHighlight(id);
  }

  function BtnStyle(id) {
    if (id == buttonHighlight) {
      return TabBtnClickStyle;
    } else {
      return TabBtnStyle;
    }
  }
  
  const MenuCtx = () => {
    if (showContent == 1) {
      return (<Info />);
    } else if (showContent == 2) {
      return (<Account />);
    } else if (showContent == 3) {
      return (<Rules />);
    } else if (showContent == 4) {
      return (<Support />);
    }
  }
  
  return (
  
  <div id="menu" style={{opacity: menuOpacity, display: menuDisplay, ...MenuStyle}} >
    <div id="tablist" style={TabListStyle}>
      <ul id="menulist" style={List}>
      <li style={BtnListStyle}>
      <button style={BtnStyle(1)} onClick={() => ButtonClicked(1)}>Info</button>
      </li>
      <li style={BtnListStyle}>
      <button style={BtnStyle(2)} onClick={() => ButtonClicked(2)}>Account</button>
      </li>
      <li style={BtnListStyle}>
      <button style={BtnStyle(3)} onClick={() => ButtonClicked(3)}>Rules</button>
      </li>
      <li style={BtnListStyle}>
      <button style={BtnStyle(4)} onClick={() => ButtonClicked(4)}>Support</button>
      </li>
      </ul>
    </div>
    <div id="content" style={ContentStyle}>
      <MenuCtx />
    </div>
  </div>
  );
}