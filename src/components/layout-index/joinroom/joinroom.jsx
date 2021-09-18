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
    const [allowUser, setAllowUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [meetid, setMeetId] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const params = useParams();
    const dispatch = useDispatch();
    /* selector ---> auth */
    const username = useSelector(state => state.auth.user_name);  
    const usermail = useSelector(state => state.auth.user_mail);
    const userimg = useSelector(state => state.auth.user_img);

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
        if(!usermail && !username) {
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
        if(!usermail && !username) {
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
        if(!usermail && !username) {
            setError('Please login into continue');
            return;
        }
        setAllowUser(true);
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
        socket.on('join', ({username: _name, usermail: _mail, allow}) => {
            if(_name === username) {
                if(_mail === usermail) {
                    if(allow) {
                        dispatch(manageAction.setrouteMeet(true));
                        history.push(`/meet/${meetid}`);
                    }
                    if(!allow) {
                        setAllowUser(false)
                    }
                }
            }
        });
    }, [dispatch, history, meetid, username, usermail]);

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
        return () => {
            socket.off('created-instant-meeting');
            socket.off('created-meeting-id');
            socket.off('invalid-id');
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
                            <IconButton size="small" aria-label="close" onClick={() => setError('')}>
                                <CloseIcon/>
                            </IconButton>
                        </>
                    }
                />
                {/* Dialog */}
                <DialogLink meetid={meetid} open={open} onClose={handleCloseModal}/>
                <DialogInvalid open={inValidID} close={() => setInValidID(false)}/>
                {/*  */}
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
                {allowUser &&
                    <>
                    <div className={styles.joinrequest}>Asking to join...</div>
                    <CircularProgress/>
                    </>
                }
                {allowUser === false &&
                <div className={styles.joinrequest}>You can't join this meeting</div>
                }
            </div>
        </>
    )
}

export default Joinroom;