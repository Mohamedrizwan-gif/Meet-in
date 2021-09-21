import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
    AppBar, Toolbar, Button, Grid, 
    CircularProgress, Paper, Snackbar, IconButton
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

import Navbar from '../../components/layout-index/navbar/navbar';
import Joinroom from '../../components/layout-index/joinroom/joinroom';
import { streamAction } from '../../store/index';
import socket from '../../utils/socket';
import styles from './index.module.css';

function Index() {
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);
    const [disableAudio, setDisableAudio] = useState(false);
    const [disableVideo, setDisableVideo] = useState(false);
    const [spin, setSpin] = useState(true);
    const [profile, setProfile] = useState(false);
    const [recentMeeting, setRecentMeeting] = useState(false);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState('');
    const [showbtn, setShowbtn] = useState(false);
    const myVideo = useRef();
    /* dispatch */
    const dispatch = useDispatch();
    
    const onBackground = () => {
        if(profile) {
            setProfile(false);
        }
        if(recentMeeting) {
            setRecentMeeting(false);
        }
    }
    
    const onAudio = () => {
        const audioTracks = myVideo.current.srcObject.getAudioTracks();
        if(audioTracks.length > 0) {
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
                setAudio(track.enabled);
            });
        }
    }
    
    const onVideo = () => {
        const videoTracks = myVideo.current.srcObject.getVideoTracks();
        if(videoTracks.length > 0) {
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
                setVideo(track.enabled);
            });
        }
    }

    useEffect(() => {
        socket.open();
    }, []);

    useEffect(() => {
        (async() => {
                let audiotrack = null;
                let videotrack = null;
                const audioStream = navigator.mediaDevices.getUserMedia({audio: {
                    echoCancellation: true
                }, video: false});
                const videoStream = navigator.mediaDevices.getUserMedia({audio: false, video: {
                        width: { min: 1024, ideal: 1280, max: 1920 },
                        height: { min: 576, ideal: 720, max: 1080 },
                    }
                });
                const audiovideostream = await Promise.allSettled([audioStream, videoStream]);
                audiovideostream.forEach(stream => {
                    if(stream.status === "fulfilled") {
                        if(stream.value.getAudioTracks().length) {
                            audiotrack = stream.value;
                        }
                        if(stream.value.getVideoTracks().length) {
                            videotrack = stream.value;
                        }
                        setSpin(false);
                        setShowbtn(true);        
                    }
                    if(stream.status === "rejected") {
                        if(stream.reason.message === "Could not start audio source") {
                            audiotrack = null;
                            setAlert('Please check the mic connection');
                        }
                        if(stream.reason.message === "Could not start video source") {
                            videotrack = null;
                            setVideo(false);
                            setAlert('Please check the camera connection');
                        }
                        if(stream.reason.message === "Permission denied") {
                            audiotrack = null;
                            videotrack = null;
                            setVideo(false);
                            setAlert('Allow this site access your camera and microphone and refresh the page');
                        }
                        setError(stream.reason.message);
                        setSpin(false);
                        setShowbtn(true);        
                    }
                });
                if(audiotrack === null) {
                    audiotrack = [];
                }
                else {
                    audiotrack = audiotrack.getAudioTracks();
                }
                if(videotrack === null) {
                    videotrack = [];
                }
                else {
                    videotrack = videotrack.getVideoTracks();
                }
                const combinedStream = new MediaStream([...audiotrack, ...videotrack]);
                dispatch(streamAction.setAVStream(combinedStream));
                let audioTracks = [];
                let videoTracks = [];
                if(myVideo.current) {
                    myVideo.current.srcObject = combinedStream;
                    audioTracks = myVideo.current.srcObject.getAudioTracks();
                    videoTracks = myVideo.current.srcObject.getVideoTracks();
                }
                if(audioTracks.length === 0) {
                    setDisableAudio(true);
                    setAudio(false); 
                }
                if(videoTracks.length === 0) {
                    if(myVideo.current) {
                        myVideo.current.style.backgroundColor = 'black';
                    }
                    setDisableVideo(true);
                    setVideo(false); 
                }
        })();
    },[dispatch, myVideo]);

    return (
        <div onClick={onBackground}>
            <AppBar position="fixed">
                <Toolbar className={styles.header}>
                    <Navbar 
                        profile={profile} 
                        setProfile={setProfile} 
                        recentMeeting={recentMeeting} 
                        setRecentMeeting={setRecentMeeting}
                    />
                </Toolbar>
            </AppBar>
            <br/>
            <br/>
            <br/>
            <br/>
            {/* error snackbar */}
            <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    open={alert.length > 0}
                    autoHideDuration={9000}
                    message={alert}
                    onClose={() => setAlert('')}
                    action={
                        <>
                            <IconButton 
                                aria-label="close" 
                                color="inherit" 
                                size="small"    
                                onClick={() => setAlert('')}
                            >
                                <CloseIcon/>
                            </IconButton>
                        </>
                    }
                />
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                open={error.length > 0}
                autoHideDuration={9000}
                message={error}
                onClose={() => setError('')}
                action={
                    <>
                        <IconButton size="small" aria-label="close" onClick={() => setError('')}>
                            <CloseIcon/>
                        </IconButton>
                    </>
                }
            />
            {/* error snackbar */}
            <Grid container>
                <Grid item xs={12} md={6}>
                    <div className={styles.title}>
                        Video conferencing is free to use.<br/> Try it now 
                    </div>
                    <Paper className={styles.paper} variant="outlined" elevation={10}>
                        {spin &&
                            <div style={{zIndex: 1}} className="spinner">
                                <CircularProgress></CircularProgress>
                            </div>
                        }
                        <video 
                            ref={myVideo}
                            className={styles.myvideo} 
                            muted="muted"
                            autoPlay 
                            playsInline
                        />
                        {/* video button */}
                        {showbtn &&
                        <div className={styles['myVideo-btn']}>
                            <Button 
                                style={{background: audio ? 'none' : '#d93025'}}
                                className={styles.btn}
                                onClick={onAudio} 
                                disabled={disableAudio}
                                variant="outlined"
                            >
                                {audio ? <MicIcon/> : <MicOffIcon/>}
                            </Button>
                            &nbsp;
                            &nbsp;
                            <Button
                                style={{background: video ? 'none' : '#d93025'}}
                                className={styles.btn}
                                onClick={onVideo}
                                disabled={disableVideo}
                                variant="outlined"
                            >
                                {video ? <VideocamIcon/> : <VideocamOffIcon/>}
                            </Button>
                        </div>
                        }
                        {/* video button */}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Joinroom error={error}/>
                </Grid>
            </Grid>
            <br/>
        </div>
    )
}

export default Index;