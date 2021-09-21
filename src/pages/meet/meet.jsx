import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { 
    Button, Snackbar, AppBar, Toolbar, 
    Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, Avatar 
} from '@material-ui/core';
import FlipCameraAndroidIcon from '@material-ui/icons/FlipCameraAndroid';

import { manageAction } from '../../store/index';
import Video from '../../components/layout-meet/video/video';
import socket from '../../utils/socket';
import styles from  './meet.module.css';

function AlertNewUserDialog(props) {
    return (
        <>
            <Dialog open={props.open}>
                <DialogTitle>Someone want's to join in this meeting</DialogTitle>
                <DialogContent>
                    <Avatar style={{margin:'auto'}} src={props.userimg}/>
                    <DialogContentText style={{textAlign:'center'}}>{props.username}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={props.closeAlertDialog.bind(null, 'allow', props.username, props.usermail)}>
                        Allow
                    </Button>
                    <Button variant="outlined" onClick={props.closeAlertDialog.bind(null, 'deny', props.username, props.usermail)}>
                        Deny
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

function Meet() {  
    const [openAlertDialog, setOpenAlertDialog] = useState([]);
    const [presentingScreen, setPresentingScreen] = useState(null);
    const [unPresentingScreen ,setUnPresentingScreen] = useState(null);
    const [userConnected, setUserConnected] = useState({username:'', connected: false});
    const [userDisconnected, setUserDisconnected] = useState({username:'', connected: false});
    const [time, setTime] = useState('');
    const history = useHistory();
    const dispatch = useDispatch();
    /* selector ---> stream */
    const avstream = useSelector(state => state.stream.avstream);
    const currentpeer = useSelector(state => state.stream.current_peer);
    /* selector ---> auth */
    const username = useSelector(state => state.auth.user_name);
    const usermail = useSelector(state => state.auth.user_mail);
    const routemeet = useSelector(state => state.manage.route_meet);
    // 
    let length = 1;
    let flip = 0;

    const closeAlertDialog = (result, newusername, newusermail) => {
        if(result === 'allow') {
            socket.emit('allow-user', {newusername, newusermail, allow: true});
        }
        if(result === 'deny') {
            socket.emit('allow-user', {newusername, newusermail, allow: false})
        }
        setOpenAlertDialog(alert => alert.filter(al => al.username !== newusername));
    }

    const onFlipCamera = async() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
            return;
        }
        try {
            // videokind devices
            const devices = [];
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            mediaDevices.forEach(device => {
                if(device.kind === 'videoinput') {
                    devices.push(device);
                }
            });
            let tot_device = devices.length - 1; 
            // 
            if(tot_device === 0) {
                length = 0;
            }
            const videostream = await navigator.mediaDevices.getUserMedia({audio: false, video: {
                deviceId: { exact: devices[length].deviceId }
            }});
            avstream.addTrack(videostream.getVideoTracks()[0]);
            if(currentpeer) {
                const videoTrack = videostream.getVideoTracks()[0];
                const sender = currentpeer.getSenders().find(s => s.track.kind === videoTrack.kind);
                sender.replaceTrack(videoTrack);
            }
            // if(tot_device > 0) {
                if(tot_device === length) {
                    length = 0;
                }
                else if(tot_device !== length) {
                    length++;
                }
            // }
            ++flip;
            dispatch(manageAction.setFlipCamera(flip));
        }
        catch(err) {
            if(err.message === 'Could not start video source') {
                console.log('Please check the camera connection');
            }
            console.log(err);
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const time = new Date().toLocaleTimeString().split(':');
            const currenttime = `${time[0]}:${time[1]} ${time[2].split(' ')[1].toLowerCase()}`;
            setTime(currenttime);    
        }, 1000);
        if(routemeet) {
            socket.on('user-connected', ({username}) => {
                setUserConnected({username, connected: true});
            });
            socket.on('user-disconnected', ({username}) => {
                setUserDisconnected({username, connected: true});
            });
            socket.on('invalid-meeting-id', msg => {
                history.push('/');
            });
            /* remove user */
            socket.on('remove-user', id => {
                if(avstream) {
                    if(avstream.id === id) {
                        socket.disconnect();
                        history.replace('/');
                    }
                }
            });
            /* presenting screen */
            socket.on('presenting-screen', ({username, usermail}) => {
                setPresentingScreen(username);
            });
            /* screen unpresented */
            socket.on('unpresented-screen', ({username, usermail}) => {
                setUnPresentingScreen(username);
            });
        }
        // 
        return () => {
            clearInterval(timer);
        }
    }, [history, avstream, routemeet]);

    useEffect(() => {
        if(routemeet) {
            socket.on('verify-user', ({username: _name, usermail: _mail, newusername, newusermail, newuserimg}) => {
                if(_name === username) {
                    if(_mail === usermail) {
                        setOpenAlertDialog(prev => [...prev, {
                            username: newusername, 
                            usermail: newusermail, 
                            userimg: newuserimg,
                            open: true
                        }]);
                    }
                }
            });
            socket.on('not-allow', ({username: _name, usermail: _mail}) => {
                if(_name === username) {
                    if(_mail === usermail) {
                        console.log('not allowed');     
                    }
                }
            });
        }
    }, [username, usermail, routemeet]);

    useEffect(() => {
        return () => {
            socket.off('user-connected');
            socket.off('user-disconnected');
            socket.off('invalid-meeting-id');
            socket.off('remove-user');
            socket.off('presenting-screen');
            socket.off('unpresented-screen');
            socket.off('verify-user');
            socket.off('not-allow');
        }
    }, []);

    return (
        <div className={styles.meet}>
            <AppBar id="meet_navbar" position="static">
                <Toolbar className={styles.toolbar}>
                    <div>
                        <Button style={{color: 'white'}} variant="outlined">
                            {time}
                        </Button>
                    </div>
                    <Button className={styles['btn-flipcamera']} variant="outlined" onClick={onFlipCamera}>
                        <FlipCameraAndroidIcon/>
                    </Button>
                </Toolbar>
            </AppBar>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                open={userConnected.connected}
                autoHideDuration={2000}
                message={`${userConnected.username} is joined`}
                onClose={() => { setUserConnected(prev => {return {...prev, connected: false}}) }}
            />
            {/* screen presenting */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                open={Boolean(presentingScreen)}
                autoHideDuration={4000}
                message={`${presentingScreen} is presenting screen`}
                onClose={() => { setPresentingScreen(null) }}
            />
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                open={Boolean(unPresentingScreen)}
                autoHideDuration={4000}
                message={`${unPresentingScreen} is unpresenting screen`}
                onClose={() => { setUnPresentingScreen(null) }}
            />
            {/*  */}
            <Snackbar 
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                open={userDisconnected.connected}
                autoHideDuration={2000}
                message={`${userDisconnected.username} is left the meeting`}
                onClose={() => { setUserDisconnected(prev => {return {...prev, connected: false}}) }}
            />
            {openAlertDialog.map((alert, index) => {
                return (
                    <AlertNewUserDialog 
                        key={index}
                        open={alert.open} 
                        closeAlertDialog={closeAlertDialog} 
                        username={alert.username}
                        usermail={alert.usermail}
                        userimg={alert.userimg}
                    />
                )
            })
            }
            <Video/>
        </div>
    )
}

export default Meet;