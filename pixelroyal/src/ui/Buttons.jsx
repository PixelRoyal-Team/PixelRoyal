import menubtn from '/pixelroyal/src/public/ui/menu.svg';
import chatbtn from '/pixelroyal/src/public/ui/chat.svg';
import modtoolsbtn from '/pixelroyal/src/public/ui/modtools.svg';
import zoomin from '/pixelroyal/src/public/ui/zoomin.svg';
import zoomout from '/pixelroyal/src/public/ui/zoomout.svg';

import axios from 'axios';
import { verify } from '../App';

import Menu from './Menu/Menu';
import Chat from '../components/chat';
import Modtools from '../components/Modtools';
import './buttons.css';
import Colors from '../canvas/Colors';
import socket from '../components/socket';

import { useEffect, useState, useRef } from 'react';

const BarStyle = {
    position: "absolute",
    top: "0px",
    margin: "7px"
}

const CornerStyle = {
    position: "absolute",
    bottom: "0px",
    margin: "7px",
    pointerEvents: "none"
}

const PaletteStyle = {
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

const PaletteRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
};

const ColorSelectStyle = {
    width: "40px",
    height: "40px"
}

const IconStyle = {
    width: "20px",
    height: "20px"
}

const BtnStyle = {
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
        <div onClick={props.click} className="btn" style={BtnStyle}>
            <img style={IconStyle} src={props.btn} />
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
        <div id={props.id} style={{ ...PaletteBtnStyle, backgroundColor: props.color }}></div>
    )
}

const ColorSelect = (props) => {
    return (
        <input type="color" style={ColorSelectStyle} />
    )
}

const SideButtons = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showModtools, setShowModtools] = useState(false);
    const [adminLevel, setAdminLevel] = useState(0);
    const [placetime, setPlacetime] = useState(0);
    const [cooldown, setCooldown] = useState(0);

    const timeoutRef = useRef(null);
    const cooldownRef = useRef(0);

    useEffect(() => {
        const v = verify();
        if (v) {
            axios.get(`${window.location.protocol}//${window.location.host}/getAdminLevel/${v.id}`)
                .then(response => {
                    setAdminLevel(response.data.admin_level);
                });
        }

        const updateCooldown = () => {
            console.log("update");
            cooldownRef.current--;
            setCooldown(cooldownRef.current);
            console.log(placetime - 1);

            if (cooldownRef.current != 0) {
                timeoutRef.current = setTimeout(updateCooldown, 1000);
            }
        };

        socket.on('updateCooldown', (data) => {
            setCooldown(data.timer);
            setPlacetime(data.placetime);

            cooldownRef.current = data.timer;

            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(updateCooldown, 1000);
        });

        return () => {
            clearTimeout(timeoutRef.current);
            socket.off('updateCooldown');
        };
    }, []);

    const ShowMenu = () => {
        return <Menu show={showMenu} setShow={setShowMenu} />;
    }

    const ShowChat = () => {
        return <Chat show={showChat} />
    }

    const ShowModtools = () => {
        return <Modtools show={showModtools} setShow={setShowModtools} />;
    }

    const ShowCooldown = () => {
        return <div className='cooldown' style={{ opacity: cooldown > 0 ? 1 : 0 }}>{cooldown}</div>
    }
    return (
        <>
            <ShowChat />

            <div id="SideBar" style={BarStyle}>
                <IconButton btn={menubtn} click={() => setShowMenu(!showMenu)} />
                <IconButton btn={chatbtn} click={() => setShowChat(!showChat)} />
                {adminLevel > 0 ? <IconButton btn={modtoolsbtn} click={() => setShowModtools(!showModtools)} /> : null}
            </div>
            <ShowCooldown />
            <ShowMenu />
            <ShowModtools />
        </>
    )
}

const CornerButtons = (props) => {
    return (
        <>
            <div id="BottomBar" style={CornerStyle}>
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
    const paletteBtn = [];

    for (let i = 0; i < Colors.length; i += 2) {
        paletteBtn.push(<div style={PaletteRowStyle}><PaletteBtn id={i} color={Colors[i]} /><PaletteBtn id={i + 1} color={Colors[i + 1]} /></div>);
    }

    return (
        <>
            <div id="PaletteBar" style={PaletteStyle}>
                <div id="PaletteBox" style={PaletteBoxStyle}>
                    {paletteBtn}
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