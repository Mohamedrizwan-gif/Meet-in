import { memo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Button, Dialog, DialogTitle, 
    DialogContent, DialogContentText, DialogActions,
    ClickAwayListener, Tooltip 
 } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import styles from './info.module.css';

function Info(props) {
    const [open, setOpen] = useState(false);
    const params = useParams();
    
    const handleTooltipClose = () => {
        setOpen(false);
    }

    const handleTooltipOpen = () => {
        setOpen(true);
        setTimeout(() => setOpen(false), 500);
    }

    const handleClose = () => {
        props.close();
    }

    return (
        <Dialog maxWidth="sm" open={props.open} onClose={props.close}>
            <DialogTitle>
                <span className={styles.dialogtitle}>Your meeting is ready</span>
                <Button className={styles.closebtn} onClick={handleClose}><CloseIcon/></Button>
            </DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.dialogcontent}>
                    click the link and share this with others you want in the meeting
                </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogaction}>
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <div>
                        <Tooltip
                            PopperProps={{
                                disablePortal: true,
                            }}
                            open={open}
                            onClose={handleTooltipClose}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title="Copied"
                        >
                            <CopyToClipboard text={params.roomid}> 
                                <Button style={{
                                    width: '100%',
                                    backgroundColor: 'lightgrey'
                                }} onClick={handleTooltipOpen}>{params.roomid}</Button>
                            </CopyToClipboard>
                        </Tooltip>
                    </div>
                </ClickAwayListener>
            </DialogActions>
        </Dialog>
    )
}

export default memo(Info);