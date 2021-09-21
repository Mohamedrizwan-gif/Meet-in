import { memo, useState } from 'react';
import { 
    Avatar, Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Divider, LinearProgress, Box 
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RemoveCircleOutlinedIcon from '@material-ui/icons/RemoveCircleOutline';

import socket from '../../../../utils/socket';
import styles from './people.module.css';

function DialogRemove(props) {
    const handleRemove = () => {
        socket.emit('removeuser', props.streamid);
    }
    return (
        <Dialog open={props.open}>
            <DialogTitle>Remove user?</DialogTitle>
            <DialogContent>Remove {props.username} from the meeting</DialogContent>
            <DialogActions>
                <Button onClick={props.close}>Close</Button>
                <Button onClick={handleRemove}>Remove</Button>
            </DialogActions>
        </Dialog>
    )
}

function People(props) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
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
                            <Button className={styles.removebtn} onClick={() => setOpen(true)}>
                                <RemoveCircleOutlinedIcon/>
                            </Button>
                            }
                            <DialogRemove 
                                open={open} 
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