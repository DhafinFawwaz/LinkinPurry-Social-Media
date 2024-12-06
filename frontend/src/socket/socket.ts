
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { io } from 'socket.io-client';

const socket = io(URL, {
	autoConnect: false,
	withCredentials: true
});

export default socket;