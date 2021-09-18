import io from 'socket.io-client';

const socket = io('https://meet-in-server.herokuapp.com/', { transports: ['websocket'] });
// http://localhost:5000/

export default socket;    