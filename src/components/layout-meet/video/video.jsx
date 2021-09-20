import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { CircularProgress, Backdrop } from '@material-ui/core';
import Peer from 'peerjs';

import { streamAction } from '../../../store/index';
import socket from '../../../utils/socket';
import Controls from '../controls/controls';
import Gridusers from './grid-users/grid-users';
import './video.css';

const peers = {}
let timer;

function Video() {
    const [streams, setStream] = useState([]);
    const [peerId, setPeerId] = useState(null);
    const [controls, setControls] = useState([]);
    const [users, setUsers] = useState([]);
    const [userEmitted, setUserEmitted] = useState(false);
    const params = useParams();
    const history = useHistory();
    // redux
    const dispatch = useDispatch();
    const avstream = useSelector(state => state.stream.avstream);
    const screenstream = useSelector(state => state.stream.screen_stream);
    const username = useSelector(state => state.auth.user_name);
    const usermail = useSelector(state => state.auth.user_mail);
    const userimg = useSelector(state => state.auth.user_img);
    const spin = useSelector(state => state.manage.spin);
    // 
    const peer = useMemo(() => new Peer(undefined),[]);
    const peerList = useMemo(() => [],[]);

    const connectToNewUser = useCallback((peerId, stream) => {
        if(!screenstream) {
            timer = setTimeout(() => {
                const call = peer.call(peerId, stream);
                if(!peerList.includes(call.peer)) {
                    dispatch(streamAction.setCurrentPeer(call.peerConnection));
                    peerList.push(call.peer);
                }
                // get stream from other user
                call.on('stream', userVideoStream => {
                    setStream(prev => {
                        const streams = prev.filter(stream => stream.id !== userVideoStream.id);
                        return [...streams, userVideoStream];
                    });
                });
                peers[peerId] = call;
            });
        }
        if(screenstream) {
            if(timer) {
                clearTimeout(timer);
            }
            const call = peer.call(peerId, stream);
            if(!peerList.includes(call.peer)) {
                dispatch(streamAction.setCurrentPeer(call.peerConnection));
                peerList.push(call.peer);
            }
            const videoTrack = screenstream.getVideoTracks()[0];
            const sender = call.peerConnection.getSenders().find(s => s.track.kind === videoTrack.kind);
            sender.replaceTrack(videoTrack);
            // get stream from other user
            call.on('stream', userVideoStream => {
                setStream(prev => {
                    const streams = prev.filter(stream => stream.id !== userVideoStream.id);
                    return [...streams, userVideoStream];
                });
            });
            peers[peerId] = call;
        }
    }, [dispatch, peer, screenstream, peerList]);

    useEffect(() => {
        if(streams.length < 2) {
            dispatch(streamAction.setCurrentPeer(null));
        }
    }, [dispatch, streams]);

    useEffect(() => {
        socket.on('people', users => {
            setUsers(users);
        });
        socket.on('ctrl', ctrl => {
            setControls(ctrl);
        });
        if(!username && !usermail) {
            history.push('/');
            return;
        }
        // user ---> disconnected
        socket.on('user-disconnected', ({peerId, Id}) => {
            if(peers[peerId]) {
                peers[peerId].close();
            }
            setStream(prev => prev.filter(stream => stream.id !== Id));
            delete peers[peerId];
        });
    },[username, usermail, history]);

    useEffect(() => {
        let stream = avstream;
        if(stream) {
            if(stream.id) {
                socket.emit('userstreamid', stream.id);
                setUserEmitted(true);
            }
        }
        if(stream) {
            if(!screenstream) { // not to render when streaming screen
                setStream(prev => [...prev, stream]); // myvideo
            }
            peer.on('call', call => {
                call.answer(stream);
                let length = 1;
                call.on('stream', remoteStream => { // get stream of the remote user
                    if(!peerList.includes(call.peer)) {
                        dispatch(streamAction.setCurrentPeer(call.peerConnection));
                        peerList.push(call.peer);
                    }
                    if(length === 1) {
                        setStream(prev => [...prev, remoteStream]);
                    }
                    if(remoteStream) {
                        length++;
                    }
                });
            });
            socket.on('user-connected', ({peerId}) => {
                connectToNewUser(peerId, stream);
            });  
        } 
    }, [dispatch, peer, connectToNewUser, avstream, screenstream, peerList]);

    useEffect(() => {
        peer.on('open', id => {
            setPeerId(id);
        });
        const roomId = params.roomid;
        if(userEmitted && peerId) { 
            socket.emit('join-room', {roomId, peerId, username, usermail, userimg});
        }
    },[peer, peerId, params.roomid, username, usermail, userimg, userEmitted]);

    useEffect(() => {
        return () => {
            socket.off('people');
            socket.off('ctrl');
            socket.off('user-disconnected');
            socket.off('userstreamid');
            socket.off('user-connected');
        }
    }, []);

    return (
        <>
            {spin &&
            <Backdrop
                open={true}
                style={{zIndex: 3}}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            }
            {/* video */}
            <Gridusers controls={controls} users={users} streams={streams}/>
            {/* controls */}
            {streams.length > 0 &&
                <div>
                    <Controls/>
                </div>
            }
        </>
    )
}

export default React.memo(Video);