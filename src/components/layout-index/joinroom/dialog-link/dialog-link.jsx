import { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, ClickAwayListener, 
    Tooltip, Button
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ShareIcon from '@material-ui/icons/Share';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import styles from './dialog-link.module.css';

function DialogLink(props) {
    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    }

    const handleTooltipOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        props.onClose();
    }

    const onShare = () => {
        if(navigator.share) {
            navigator.share({
                title: 'Meet-in',
                text: 'To join the meeting on the meet-in, click the link',
                url: `https://meet-in.netlify.app/#/${props.meetid}`
            })
            .then(() => {
                console.log('');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    return (
        <Dialog open={props.open} onClose={handleClose}>
            <DialogTitle>
                <span className={styles.dialogtitle}>link to your meeting</span>
                <Button style={{position: 'absolute'}} onClick={handleClose}><CloseIcon/></Button>
            </DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.dialogcontent}>
                    Copy this link and send it to people you want to meet with.
                    Be sure to save it so you can use it later, too.
                </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogaction}>
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <div>
                        <Tooltip
                            open={open}
                            onClose={handleTooltipClose}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title="Copied"
                        >
                            <CopyToClipboard text={props.meetid}> 
                                <Button style={{
                                    width: '100%',
                                    backgroundColor: 'lightgrey'
                                }} onClick={handleTooltipOpen}>
                                    {props.meetid}
                                </Button>
                            </CopyToClipboard>
                        </Tooltip>
                    </div>
                </ClickAwayListener>
                <Button style={{marginLeft: 'inherit'}} variant="contained" onClick={onShare}>
                    <ShareIcon/>
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogLink;