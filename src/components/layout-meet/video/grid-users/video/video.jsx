import { useState ,useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import MicOffIcon from '@material-ui/icons/MicOff';

import maximize from '../../../../../assets/icons/maximize.svg';
import minimize from '../../../../../assets/icons/minimize.svg';
import styles from './video.module.css';

function Video(props) {
    const [screenheight, setScreenHeight] = useState('300px');
    const [username, setUsername] = useState('');
    const [micoff, setMicOff] = useState(false);
    const [videooff, setVideoOff] = useState(false);
    const [viewFullScreen, setViewFullScreen] = useState(false);
    const videoref = useRef();
    const imgref = useRef();
    const _username = useSelector(state => state.auth.user_name);
    const _userimg = useSelector(state => state.auth.user_img);
    const flipcamera = useSelector(state => state.manage.flip_camera);
    const avstream = useSelector(state => state.stream.avstream);

    useEffect(() => {        
        // let audioCtx = new AudioContext();
        // let source = audioCtx.createMediaStreamSource(props.stream);
        // let analyser = audioCtx.createAnalyser();
            
        // source.connect(analyser);
        // analyser.connect(audioCtx.destination);
            
        // analyser.fftSize = 256;

        // const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        // const interval = setInterval(() => {
        //     analyser.getByteFrequencyData(frequencyData);
        //     console.log(frequencyData[0])
        // },300);
        // return () => {
        //     clearInterval(interval);
        // }
        if(props.index === 0) {
            const audiostream = avstream.getAudioTracks();
            let videostream = [];
            if(avstream.getVideoTracks()[flipcamera]) {
                videostream = [avstream.getVideoTracks()[flipcamera]];
            }
            const combinedstream = new MediaStream([...audiostream, ...videostream]);
            videoref.current.srcObject = combinedstream
        }
    },[flipcamera, avstream, props.index]);

    useEffect(() => {
        const navbarheight = document.getElementById('meet_navbar').offsetHeight;
        const meetheight = document.getElementById('meet').offsetHeight;
        if(props.length === 1) {
            setScreenHeight((meetheight - (navbarheight + navbarheight)) + 'px');
        }
        else {
            setScreenHeight((window.screen.height / 2) - (navbarheight/2) + 'px');    
        }
        videoref.current.srcObject = props.stream;
        if(props.index === 0) {
            videoref.current.volume = 0;
        }
        else {
            videoref.current.volume = 0.9;
        }
        if(props.stream.getVideoTracks().length === 0) {
            videoref.current.style.backgroundColor = 'black';
        }
    }, [props.stream, props.index, props.length]);

    useEffect(() => {
        if(props.index === 0) {
            if(_userimg) {
                imgref.current.src = _userimg;
            }
            if(_username) {
                setUsername(_username);
            }
            if(props?.stream?.getVideoTracks().length === 0) {
                setVideoOff(true);
                imgref.current.style.display = "inline-block";
            }
            if(props?.stream?.getAudioTracks().length === 0) {
                setMicOff(true);
            }
            props?.stream?.getVideoTracks().forEach(track => {
                if(track.enabled) {
                    setVideoOff(false);
                    imgref.current.style.display = "none";
                }
                if(!track.enabled) {
                    setVideoOff(true);
                    imgref.current.style.display = "inline-block";
                }
            });
            props?.stream?.getAudioTracks().forEach(track => {
                if(track.enabled) {
                    setMicOff(false);
                }
                if(!track.enabled) {
                    setMicOff(true);
                }
            });
        }
        if(props.index !== 0) {
            if(props.controls) {
                const control = props.controls.find(ctrl => ctrl.id === props.stream.id);
                if(control) {
                    const user = props.users.find(user => user.stream_id === control.id);
                    if(user) {
                        imgref.current.src = user.userimg;
                        setUsername(user.username);
                    }
                    if(control.video) {
                        setVideoOff(false);
                        imgref.current.style.display = "none";
                    }
                    if(!control.video) {
                        setVideoOff(true);
                        imgref.current.style.display = "inline-block";
                    }
                    if(control.audio) {
                        setMicOff(false);
                    }
                    if(!control.audio) {
                        setMicOff(true);
                    }
                }
            }
        }
    }, [_username, _userimg, props.index, props.controls, props.users, props.stream]);

    return (
        // className={props.length === 1 ? styles.overlay : ''}
        <div style={{
            position: 'relative',
            width: props.length < 4 ? '95%' : '49%', 
            height: screenheight,
            marginBottom: '2px'
        }}>
            <video 
                ref={videoref}
                className={`${styles.video} ${viewFullScreen ? styles.fullscreen : ''}`}  
                autoPlay
            /> 
            <div className={styles.username}>{props.index === 0 ? 'you' : username}</div>
            {micoff &&
            <div className={styles.micoff}>
                <MicOffIcon/>
            </div>
            }
            {viewFullScreen && 
                <img alt="minimize" src={minimize} className={styles.minimize} onClick={() => setViewFullScreen(false)}/>
            }
            {!videooff &&
                <img alt="maximize" src={maximize} className={styles.maximize} onClick={() => setViewFullScreen(true)}/>
            }
            <img ref={imgref} alt="profile" className={styles.img} src={null}/>
        </div>
    )
}

export default memo(Video);