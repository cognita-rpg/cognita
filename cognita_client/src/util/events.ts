import { useCallback, useEffect, useState } from "react";

export type Event<TData = any> = {
    id: string;
    event_type: string;
    data: TData | null;
};

export function useEvent<TData = any>(
    event: string,
    onEvent: (event: Event<TData>) => void
) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const activateSocket = useCallback(() => {
        if (socket) {
            if (socket.OPEN) {
                socket.close();
            }

            setSocket(null);
        }
        const newSocket = new WebSocket(
            `wss://${window.location.host}/api/events/${event}`
        );
        newSocket.onerror = () => setTimeout(activateSocket, 100);
        newSocket.onmessage = (ev) => {
            onEvent(JSON.parse(ev.data));
        };
        setSocket(newSocket);
    }, [event, onEvent]);

    useEffect(() => {
        activateSocket();
        return () => {
            if (socket) {
                if (socket.OPEN) {
                    socket.close();
                }
                setSocket(null);
            }
        };
    }, [activateSocket, event, onEvent]);
}
