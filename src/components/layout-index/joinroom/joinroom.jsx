import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { 
    Button, TextField, Menu, MenuItem, Dialog, 
    DialogContent, DialogActions, Snackbar, 
    IconButton, CircularProgress
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import LinkIcon from '@material-ui/icons/Link';
import QueueIcon from '@material-ui/icons/Queue';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import CloseIcon from '@material-ui/icons/Close';
import { v1 as uuid } from 'uuid';

import { manageAction } from '../../../store/index';
import socket from '../../../utils/socket';
import DialogLink from './dialog-link/dialog-link';
import styles from './joinroom.module.css';

function DialogInvalid(props) {
    return (
        <Dialog open={props.open} onClose={props.close}>
            <DialogContent>
                    This meeting ID is not valid.
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={props.close}>Dismiss</Button>
            </DialogActions>
        </Dialog>
    )
}

function Joinroom(props) {
    const [open, setOpen] = useState(false);
    const [inValidID, setInValidID] = useState(false);
    const [enterroom, setEnterRoom] = useState(false);
    const [btnclicked, setBtnClicked] = useState(false);
    const [deny, setDeny] = useState(true);
    const [showspin, setShowSpin] = useState(true);
    const [notallowed, setNotAllowed] = useState(true);
    const [allowUser, setAllowUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [meetid, setMeetId] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const params = useParams();
    const dispatch = useDispatch();
    const username = useSelector(state => state.auth.user_name);  
    const usermail = useSelector(state => state.auth.user_mail);
    const userimg = useSelector(state => state.auth.user_img);
    const avstream = useSelector(state => state.stream.avstream);
    const notallow = useSelector(state => state.manage.notallow);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleCloseModal = () => {
        setOpen(false);
    }

    const onLater = () => {
        if(props.error === 'Permission denied') {
            setError('Please allow access to your camera and microphone');
            return;
        }
        if(!usermail && !username && !userimg) {
            setError('Please login into continue');
            return;
        }
        const ID = uuid();
        socket.emit('create-meeting-id', {ID, username, usermail});
    }

    const onInstant = () => {
        if(props.error === 'Permission denied') {
            setError('Please allow access to your camera and microphone');
            return;
        }
        if(!usermail && !username && !userimg) {
            setError('Please login into continue');
            return;
        }        
        const ID = uuid();
        socket.emit('create-instant-meeting', {ID, username, usermail});
        socket.on('created-instant-meeting', id => {
            dispatch(manageAction.setrouteMeet(true));
            history.push(`/meet/${id}`);
        });
    }

    const onJoin = () => {
        if(props.error === 'Permission denied') {
            setError('Please allow access to your camera and microphone');
            return;
        }
        if(!usermail && !username && !userimg) {
            setError('Please login into continue');
            return;
        }
        if(avstream?.getTracks().length === 0) {
            setError('Please check your media connection');
            return;
        }
        if(!avstream) {
            return;
        }
        setShowSpin(true);
        setBtnClicked(true);
        setAllowUser(true);
        setDeny(true);
        socket.emit('onjoin', {meetid, username, usermail, userimg});
    }

    useEffect(() => {
        socket.on('created-meeting-id', id => {
            setMeetId(id);
            setOpen(true);
        });
        socket.on('invalid-id', (invalid) => {
            if(invalid) {
                setAllowUser(null);
                setInValidID(true);
            }
        });
        socket.on('enter-room', (enter) => {
            if(enter) {
                setEnterRoom(true);
            }
        });
        socket.on('join', ({username: _name, usermail: _mail, allow}) => {
            if(_name === username) {
                if(_mail === usermail) {
                    if(allow) {
                        if(btnclicked) {
                            dispatch(manageAction.setrouteMeet(true));
                            history.replace(`/meet/${meetid}`);
                        }
                    }
                    if(!allow) {
                        setAllowUser(false)
                    }
                }
            }
        });
    }, [dispatch, history, meetid, username, usermail, btnclicked]);

    useEffect(() => {
        if(params.roomid) {
            setMeetId(params.roomid);
        }
        if(params.roomid === "meet") {
            setMeetId('');
        }
        if(!params.roomid) {
            setMeetId('');
        }
    }, [params.roomid]);

    useEffect(() => {
        let timer1;
        let timer2;
        let timer3;
        if(notallow) {
            timer1 = setTimeout(() => setNotAllowed(false), 7000);
        }
        if(allowUser) {
            timer2 = setTimeout(() => setShowSpin(false), 10000);
        }
        if(allowUser === false) {
            timer3 = setTimeout(() => setDeny(false), 8000);
        }
        return () => {
            if(timer1) {
                clearTimeout(timer1);
            }
            if(timer2) {
                clearTimeout(timer2);
            }
            if(timer3) {
                clearTimeout(timer3);
            }
        }
    }, [notallow, allowUser]);

    useEffect(() => {
        return () => {
            socket.off('created-instant-meeting');
            socket.off('created-meeting-id');
            socket.off('invalid-id');
            socket.off('enter-room');
            socket.off('join');
        }
    }, []);

    return (
        <>
            <div className={styles.overlay}>
                <br/>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    open={error.length > 0}
                    autoHideDuration={9000}
                    message={error}
                    onClose={() => setError('')}
                    action={
                        <>
                            <IconButton 
                                aria-label="close" 
                                color="inherit"
                                size="small" 
                                onClick={() => setError('')}
                            >
                                <CloseIcon/>
                            </IconButton>
                        </>
                    }
                />
                {/* Dialog */}
                <DialogLink meetid={meetid} open={open} onClose={handleCloseModal}/>
                <DialogInvalid open={inValidID} close={() => setInValidID(false)}/>
                {/*  */}
                {notallow && notallowed &&
                <>
                    <div className={styles.joinrequest}>Someone in the meeting Removed you</div>
                    <br/>
                </>
                }
                <Button data-testid="New Meeting" className={styles.newmeetbtn} color="primary" variant="contained" onClick={handleClick}>
                    New Meeting&nbsp;<VideoCallIcon/>
                </Button>
                <Menu
                    id="menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={onLater}><LinkIcon/>&nbsp;Create a meeting for later</MenuItem>
                    <MenuItem onClick={onInstant}><AddIcon/>&nbsp;Start an instant meeting</MenuItem>
                </Menu>
                <div className={styles.info}>To create a new meeting click above or click below to join in the meeting</div>
                <TextField
                    value={meetid}
                    style={{width: '90%'}} 
                    label="Enter a code or link" 
                    onChange={e => setMeetId(e.target.value)} 
                    variant="outlined"
                />
                <br/>
                <Button className={styles.joinbtn} disabled={meetid.length <= 0} variant="contained" onClick={onJoin}>
                    Join&nbsp;<QueueIcon/>
                </Button>
                {allowUser && showspin &&
                    <div style={{marginTop: '5px'}}>
                    <CircularProgress/>
                    {enterroom &&
                    <div className={styles.joinrequest}>Asking to join...</div>
                    }
                    </div>
                }
                {allowUser === false && deny &&
                <div className={styles.joinrequest}>You can't join this meeting</div>
                }
            </div>
        </>
    )
}

export default Joinroom;