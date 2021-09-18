import { memo, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Menu, MenuItem } from '@material-ui/core';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InfoIcon from '@material-ui/icons/Info';
import PeopleIcon from '@material-ui/icons/People';
import ChatIcon from '@material-ui/icons/Chat';

import { streamAction } from '../../../store/index';
import socket from '../../../utils/socket';
import Info from './info/info';
import People from './people/people';
import Chat from './chat/chat';
import styles from './controls.module.css';

function Controls() {
    const [replace, setReplace] = useState(false);
    const [removeIcon, setRemoveIcon] = useState(false);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [disableVideo, setDisableVideo] = useState(false);
    const [showScreenShareBtn, setShowScreenShareBtn] = useState(true); 
    const [anchorEl, setAnchorEl] = useState(null);

    /* controls view */
    const [showInfo, setShowInfo] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const [showChat, setShowChat] = useState(false);
    // users 
    const [activeUsers, setActiveUser] = useState([]);
    // messages
    const [msg, setMsg] = useState([]);
    // router
    const history = useHistory();
    // redux
    const dispatch = useDispatch();
    /* selector ---> stream */
    const avstream = useSelector(state => state.stream.avstream);
    const currentpeer = useSelector(state => state.stream.current_peer);
    /* selector ---> auth */
    const username = useSelector(state => state.auth.user_name);
    const usermail = useSelector(state => state.auth.user_mail);

    const handleCallEnded = () => {
        history.replace('/');
    }

    useEffect(() => {
        const videoTrack = avstream.getVideoTracks()[0];
        if(replace) {
            if(currentpeer) {
                const sender = currentpeer.getSenders().find(s => s.track.kind === videoTrack.kind);
                sender.replaceTrack(videoTrack);
            }
        }
    }, [currentpeer, replace, avstream])

    const stopScreenShare = () => {
        if(avstream) {
            if(avstream.id) {
                socket.emit('control', { id: avstream.id, audio: audio, video: video, screen: false });
            }
        }
        let videoTrack = [];
        if(avstream !== null) {
            videoTrack = avstream.getVideoTracks()[0];
            if(!avstream.getVideoTracks()[0]) {
                videoTrack = [];
            }
        }
        if(videoTrack.length !== 0) {
            setReplace(true);
        }
        /* stop-sharing-screen */
        socket.emit('stop-sharing-screen', {username, usermail});
    } 

    const onShareScreen = () => {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always'
            },
            audio: {
                echoCancellation: true,
                noiseCancellation: true
            }
        })
        .then(stream => {
            /* sharing screen */
            socket.emit('sharing-screen', {username, usermail});
            /* dispatch screen */
            dispatch(streamAction.setScreenStream(stream));
            // 
            if(avstream) {
                if(avstream.id) {
                    socket.emit('control', { id: avstream.id, audio: audio, video: video, screen: true });
                }
            }
            const videoTrack = stream?.getVideoTracks()[0];
            videoTrack.onended = () => {
                stopScreenShare();
            };
            if(currentpeer) {
                const sender = currentpeer.getSenders().find(s => s.track.kind === videoTrack.kind);
                sender.replaceTrack(videoTrack);
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    const onVideo = () => {
        const videoTracks = avstream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
            if(avstream) {
                if(avstream.id) {
                    socket.emit('control', { id: avstream.id, audio: audio, video: track.enabled });
                }
            }
            setVideo(track.enabled);
        });
    }

    const onAudio = () => {
        const audioTracks = avstream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
            if(avstream) {
                if(avstream.id) {
                    socket.emit('control', { id: avstream.id, audio: track.enabled, video: video });
                }
            }
            setAudio(track.enabled);
        });
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    /* Info */
    const onToggleInfo = () => {
        setShowUsers(false);
        setShowChat(false);
        setShowInfo(prev => !prev);
    }

    const onCloseInfo = () => {
        setShowInfo(false);
    }

    /* Users */
    const onTogglePeople = () => {
        setShowInfo(false);
        setShowChat(false);
        setShowUsers(prev => !prev);
    }

    const onCloseUsers = () => {
        setShowUsers(false);
    }

    /* Chat */
    const onToggleChat = () => {
        setShowInfo(false);
        setShowUsers(false);
        setShowChat(prev => !prev);
    }

    const onCloseChat = () => {
        setShowChat(false);
    }

    useEffect(() => {
        if(navigator.userAgent.match(/iPad/i)){
            setShowScreenShareBtn(false);
        }
        if(navigator.userAgent.match(/iPhone/i)){
            setShowScreenShareBtn(false);
        }
        if(navigator.userAgent.match(/Android/i)){
            setShowScreenShareBtn(false);
        }
        if(navigator.userAgent.match(/BlackBerry/i)){
            setShowScreenShareBtn(false);
        }           
        if(navigator.userAgent.match(/webOS/i)){
            setShowScreenShareBtn(false);
        }
    }, []);

    useEffect(() => {
        socket.on('meet-creator', response => {
            setRemoveIcon(response);
        });
        // active users
        socket.on('people', users => {
            setActiveUser(users);
        });
        socket.on('message-me', ({chatMsg, username, time}) => {
            setMsg(prev => [...prev, {message: chatMsg, username, time, me: true}]);
        });
        socket.on('message-users', ({chatMsg, username, time}) => {
            setMsg(prev => [...prev, {message: chatMsg, username, time, me: false}]);
        });
        // 
        const audioTracks = avstream.getAudioTracks();
        const videoTracks = avstream.getVideoTracks();
        if(videoTracks?.length === 0) {
            setDisableVideo(true);
        }
        let video = false;
        let audio = false;
        audioTracks.forEach(track => {
            audio = track.enabled;
        });
        videoTracks.forEach(track => {
            video = track.enabled;
        });
        socket.on('joined', (joined) => {
            if(avstream) {
                if(avstream.id) {
                    socket.emit('control', { id: avstream.id, audio: audio, video: video, screen: false });
                }
            }
            setAudio(audio);
            setVideo(video);
        });
    },[avstream]);

    useEffect(() => {
        return () => {
            socket.off('meet-creator');
            socket.off('people');
            socket.off('message-me');
            socket.off('message-users');
            socket.off('joined');
        }
    }, []);

    return (
        <>
            {/* Dialogs */}
            <Info open={showInfo} close={onCloseInfo}/>
            <People removeIcon={removeIcon} open={showUsers} close={onCloseUsers} users={activeUsers}/>
            <Chat open={showChat} close={onCloseChat} msg={msg}/>
            {/* Controls  */}
            <Button className={styles.callend} onClick={handleCallEnded}>
                <CallEndIcon/>
            </Button>
            <div className={styles.controls}>
                {showScreenShareBtn &&
                <Button style={{minWidth: '50px'}} onClick={onShareScreen}>
                    <ScreenShareIcon/>
                </Button>
                }
                <Button disabled={disableVideo} style={{minWidth: '50px', borderRadius: '10px'}} onClick={onVideo}>
                    {video ? <VideocamIcon fontSize="small"/> : <VideocamOffIcon fontSize="small"/>}
                </Button>
                <Button style={{minWidth: '50px', borderRadius: '10px'}} onClick={onAudio}>
                    {audio ? <MicIcon/> : <MicOffIcon/>}
                </Button>
            </div>
            <Button className={styles.morevert} onClick={handleClick}>
                <MoreVertIcon/>
            </Button>
            <Menu 
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={onToggleInfo}><InfoIcon/></MenuItem>
                <MenuItem onClick={onTogglePeople}><PeopleIcon/></MenuItem>
                <MenuItem onClick={onToggleChat}><ChatIcon/></MenuItem>
            </Menu>
        </>
    )
}

export default memo(Controls);