import { useState ,useEffect, useRef, memo } from 'react';
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

    useEffect(() => {
        // let audioCtx = new AudioContext();
        // let source = audioCtx.createMediaStreamSource(props.stream);
        // let analyser = audioCtx.createAnalyser();
            
        // source.connect(analyser);
        // analyser.connect(audioCtx.destination);
            
        // analyser.fftSize = 256;

        // const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        // const interval = setInterval(() => {
            // analyser.getByteFrequencyData(frequencyData);
            // console.log(frequencyData[0])
        // },300);
        // return () => {
        //     clearInterval(interval);
        // }
    },[]);


    useEffect(() => {
        const navbarheight = document.getElementById('meet_navbar').offsetHeight;
        setScreenHeight((window.screen.height / 2) - (navbarheight/2) + 'px');
        videoref.current.srcObject = props.stream;
    }, [props.stream]);

    useEffect(() => {
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
    }, [props.controls, props.users, props.stream]);

    return (
        <div className={props.length === 1 ? styles.overlay : ''} style={{
            position: 'relative',
            width: props.length < 4 ? '95%' : '49%', 
            height: screenheight,
            marginBottom: '2px'
        }}>
            <video 
                ref={videoref}
                className={`${styles.video} ${viewFullScreen ? styles.fullscreen : ''}`}  
                // muted={props.index === 0 && "muted"}
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