import { memo, useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close';

import socket from '../../../../utils/socket';
import styles from './chat.module.css';

function Chat(props) {
    const [chatMsg, setchatMsg] = useState('');
    const [disabled, setDisabled] = useState(true);
    const inputRef = useRef(null);
    const divRef = useRef(null);
    const chatRef = useRef(null);

    const onChatMsg = (e) => {
        if(e.length <= 0) {
            setDisabled(true);
        }
        setchatMsg(e)
        setDisabled(false);
    }

    const onSend = () => {
        const username = localStorage.getItem('auth_name');
        const time = new Date().toLocaleTimeString().split(':');
        const currenttime = `${time[0]}:${time[1]} ${time[2].split(' ')[1].toLowerCase()}`;           
        socket.emit('message', {chatMsg, username, time: currenttime});
        setTimeout(() => {
            if(chatRef.current) {
                chatRef.current.scrollIntoView({behavior:'smooth'});
            }
        });
    }

    useEffect(() => {
        setTimeout(()=> {
            if(inputRef.current) {
                inputRef.current.focus();
            }
        });
    },[]);

    return (
        <Dialog scroll={'paper'} maxWidth={'sm'} fullWidth={true} open={props.open} onClose={props.close}>
            <DialogTitle>
                <span className={styles.dialogtitle}>call messages</span>
                <Button data-testid="closebtn" className={styles.closebtn} onClick={props.close}>
                    <CloseIcon/>
                </Button>
            </DialogTitle>
            <DialogContent ref={divRef} className={styles.chatbox}>
                    {props.msg.map((chat, index) => {
                        return (
                        <div 
                            key={index} 
                            ref={chatRef}
                            style={{alignSelf: chat.me ? 'flex-end': 'flex-start', textAlign: chat.me ? 'end' : 'start'}} 
                            className={styles.chat}
                        >
                            <div className={styles.chattime}>{chat.me ? 'you' : chat.username}&nbsp;&nbsp;{chat.time}</div>
                            <div className={styles.chatmsg}>{chat.message}</div>
                        </div>
                        )
                    })}
            </DialogContent>
            <DialogActions>
                <div style={{width:'100%'}}>
                    <input 
                        ref={inputRef}
                        className={styles['input-send']}
                        placeholder="Send a message to everyone" 
                        value={chatMsg} 
                        onChange={e => onChatMsg(e.target.value)} 
                    />
                    <Button data-testid="sendbtn" disabled={disabled} className={styles['btn-send']} onClick={onSend} color="primary">
                        <SendIcon/>
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    )
}

export default memo(Chat);