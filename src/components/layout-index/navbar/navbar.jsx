import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Avatar, Box, Divider } from '@material-ui/core';
import { GoogleLogin } from 'react-google-login';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Transition from 'react-transition-group/Transition';
import ShareIcon from '@material-ui/icons/Share';

import { authAction } from '../../../store/index';
import socket from '../../../utils/socket';
import styles from './navbar.module.css';

function Navbar(props) {
    const [timedate, setTimeDate] = useState('');
    const [recentMeetings, setRecentMeetings] = useState([]);
    const username = useSelector(state => state.auth.user_name);
    const usermail = useSelector(state => state.auth.user_mail);
    const userimg = useSelector(state => state.auth.user_img);
    const dispatch = useDispatch();

    const onShare = (meetid) => {
        if(navigator.share) {
            navigator.share({
                title: 'Meet-in',
                text: 'To join the meeting on the meet-in, click the link',
                url: `${window.location.href}${meetid}`
            })
            .then(() => {
                console.log('shared succesfully');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    const responseGoogle = (response) => {
        if(response.profileObj) {
            localStorage.setItem('auth_name', response.profileObj.name);
            localStorage.setItem('auth_email', response.profileObj.email);
            localStorage.setItem('auth_img', response.profileObj.imageUrl);
            dispatch(authAction.setuserName(response.profileObj.name));
            dispatch(authAction.setuserMail(response.profileObj.email));
            dispatch(authAction.setuserImg(response.profileObj.imageUrl));
        }
    }

    const onSignout = () => {
        localStorage.removeItem('auth_name');
        localStorage.removeItem('auth_email');
        localStorage.removeItem('auth_img');
        window.location.reload();
    }

    useEffect(() => {
        if(usermail) {
            socket.emit('login', usermail);
            socket.on('login-credential', meetingcredential => {
                setRecentMeetings(meetingcredential);
            });
        }
        const interval = setInterval(() => {
            const time = new Date().toLocaleTimeString().split(' ');
            const currenttime = time[0].split(':');
            const date = new Date().toGMTString().split(' ');
            setTimeDate(`${currenttime[0]}:${currenttime[1]} ${time[1]} - ${date[0]} ${date[1]} ${date[2]} ${date[3]}`);
        },1000)
        return () => {
            clearInterval(interval);
        }
    },[usermail]);

    useEffect(() => {
        return () => {
            socket.off('login-credential');
        }
    }, []);

    return (
        <>
            <div className={styles.header}>Meet-in</div>
            <div className={styles.date}>{timedate}</div>
            {usermail === null ?
                <GoogleLogin
                    clientId="1055288869825-5vi937dcmouif088tvf5qvptkl703a2p.apps.googleusercontent.com"
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />
                :
                <>
                    <Button onClick={() => props.setProfile(prev => !prev)}>
                        <Avatar alt="profile" src={userimg}/>
                    </Button>
                    {!(props.profile) && (props.recentMeeting) &&
                    <Transition in={props.recentMeeting} timeout={400} mountOnEnter unmountOnExit>
                        {state =>  {
                            return (
                                    <Box className={`${styles['meeting-bar']} ${props.recentMeeting ? styles['open-meeting-bar'] : ''}`} boxShadow={12}>
                                        {recentMeetings.length !== 0 ?
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Meeting ID</th>
                                                    <th>Created At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentMeetings.map((data, index) => {
                                                    return (
                                                        <tr key={index}> 
                                                            <td>
                                                                <CopyToClipboard text={data.meet_id}>
                                                                    <Button>{data.meet_id}</Button>
                                                                </CopyToClipboard>
                                                            </td>
                                                            <td>
                                                                {new Date(`${data.createdAt}`).toLocaleTimeString().split(':')[0]}:
                                                                {new Date(`${data.createdAt}`).toLocaleTimeString().split(':')[1]}&nbsp;
                                                                {new Date(`${data.createdAt}`).toLocaleTimeString().split(' ')[1]}
                                                            </td>
                                                            <td>
                                                                <Button onClick={onShare.bind(this, data.meet_id)}>
                                                                    <ShareIcon/>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                        :
                                        <div className={styles['no-recent']}>Recent Meetings are not found</div>
                                        }
                                    </Box>
                                )
                        }}
                    </Transition>
                    }
                    {props.profile &&
                        <Box className={styles['profile-bar']} boxShadow={10}>
                            <Avatar 
                                style={{
                                    margin: "auto",
                                    width: "80px", 
                                    height: "80px"
                                }} 
                                alt="profile" 
                                src={userimg}
                            />
                            <div style={{color: 'black', margin:'15px'}}>
                                <p>{username}</p>
                                <p>{usermail}</p>
                            </div>
                            <GoogleLogin
                                clientId="1055288869825-5vi937dcmouif088tvf5qvptkl703a2p.apps.googleusercontent.com"
                                render={renderProps => (
                                    <Button className={styles.manage_btn} variant="outlined" onClick={renderProps.onClick}>
                                        Manage your Google Account
                                    </Button>
                                )}
                                onSuccess={responseGoogle}
                                onFailure={responseGoogle}
                                cookiePolicy={'single_host_origin'}
                            />
                            <Divider/>
                            <Button onClick={() => props.setRecentMeeting(true)} className={styles.popup_btn} variant="outlined">
                                Recent Meetings
                            </Button>
                            <Button onClick={onSignout} className={styles.popup_btn} variant="outlined">
                                Sign out
                            </Button>
                            <Divider/>
                            <div className={styles.timedate}>{timedate}</div>
                        </Box>
                    }
                </>
            }
        </>
    )
}

export default React.memo(Navbar);