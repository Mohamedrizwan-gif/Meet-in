import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    Avatar, Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Divider, LinearProgress, Box 
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RemoveCircleOutlinedIcon from '@material-ui/icons/RemoveCircleOutline';

import socket from '../../../../utils/socket';
import styles from './people.module.css';

function DialogRemove(props) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if(props.state.open) {
            if(props.index === props.state.index) {
                setOpen(true);
            }
        }
        if(!props.state.open) {
            if(props.state.index === props.index) {
                setOpen(false);
            }
        }
    }, [props.state.open, props.state.index, props.index]);

    const handleRemove = () => {
        socket.emit('removeuser', props.streamid);
        props.close(props.index);
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Remove user?</DialogTitle>
            <DialogContent>Remove {props.username} from the meeting</DialogContent>
            <DialogActions>
                <Button onClick={props.close.bind(this, props.index)}>Close</Button>
                <Button onClick={handleRemove}>Remove</Button>
            </DialogActions>
        </Dialog>
    )
}

function People(props) {
    const [open, setOpen] = useState({open: false, index: null });
    const username = useSelector(state => state.auth.user_name);
    const userimg = useSelector(state => state.auth.user_img);

    const handleClose = (index) => {
        setOpen(prev => {
            return {...prev, open: false, index: index}
        });
    }

    return (
        <Dialog open={props.open} onClose={props.close}>
            <DialogTitle>
                <span className={styles.dialogtitle}>People</span>
                <Button className={styles.closebtn} onClick={props.close}><CloseIcon/></Button>
            </DialogTitle>
            <DialogContent>
                {props.users.length === 0 &&
                <Box style={{width: '200px'}}>
                    <LinearProgress />
                </Box>
                }
                {props.users.map((user, index) => {
                    return (
                    <div key={index}>
                        <div className={styles.dialogcontent}>
                            <Avatar alt="profile" src={user.userimg}/>
                            <div className={styles.dialogcontentname}>{user.username}</div>
                            {props.removeIcon &&
                            <Button 
                                disabled={(user.userimg === userimg) && (user.username === username) ? true : false}
                                className={styles.removebtn} 
                                onClick={() => setOpen({open:true, index:index})}
                            >
                                <RemoveCircleOutlinedIcon/>
                            </Button>
                            }
                            <DialogRemove 
                                index={index}
                                state={open} 
                                close={handleClose} 
                                username={user.username} 
                                streamid={user.stream_id}
                            />
                        </div>
                        {(props.users.length - 1) !== index && <Divider/>}
                    </div>
                    )
                })}
            </DialogContent>
        </Dialog>
    )
}

export default memo(People);