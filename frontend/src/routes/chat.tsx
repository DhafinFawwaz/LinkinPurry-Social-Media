import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const socket = io(URL, {autoConnect: false});

export default function Chat() {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [fooEvents, setFooEvents] = useState<any[]>([]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }
        function onDisconnect() {
            setIsConnected(false);
        }
        function onFoo(val: any) {
            setFooEvents(prev => [...prev, val]);
        }
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('foo', onFoo);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('foo', onFoo);
        }
    }, []);

    function onSubmit(event: any) {
        event.preventDefault();
        socket.timeout(2000).emit('create-something', 12, () => {
            console.log('emitted');
        });
    }

    return (
        <div>
            <h1>Chat</h1>
            <button onClick={() => socket.connect()}>Connect</button>
            <button onClick={() => socket.disconnect()}>Disconnect</button>
            <form onSubmit={ onSubmit }>
                <button type="submit">Submit</button>
            </form>
            <div>
                <h2>Connection Status</h2>
                <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
                <ul> { fooEvents.map((event, index) => <li key={ index }>{ event }</li>)} </ul>
            </div>
        </div>
    );
}