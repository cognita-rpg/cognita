import { ReactNode, useCallback, useState } from "react";
import { useApi } from "../api";
import { EventContext } from "./types";
import useDeepCompareEffect from "use-deep-compare-effect";
import { useListState } from "@mantine/hooks";

export function EventsProvider({
    children,
}: {
    children?: ReactNode[] | ReactNode;
}) {
    const api = useApi();
    const [listeners, listenerMethods] = useListState<{
        id: string;
        event: string;
        callback: (data: any) => void;
    }>([]);

    const [_, setSocket] = useState<WebSocket | null>(null);

    useDeepCompareEffect(() => {
        function connect(session_id: string) {
            const sock = new WebSocket(
                `wss://${window.location.host}/api/events/${session_id}`
            );
            sock.onerror = () => setTimeout(() => connect(session_id));
            sock.onmessage = (ev) => {
                const data = JSON.parse(ev.data);
                if (data.event_type) {
                    listeners.map((v) => {
                        if (v.event === data.event_type) {
                            v.callback(data.data ?? null);
                        }
                    });
                }
            };
            setSocket(sock);
        }

        if (api.state === "ready") {
            connect(api.session.id);
        }

        return () => {
            setSocket(null);
        };
    }, [listeners, setSocket, api.state]);

    const registerListener = useCallback(
        (id: any, event: any, callback: any) =>
            listenerMethods.append({ id, event, callback }),
        []
    );

    const deregisterListener = useCallback(
        (id: any) => listenerMethods.filter((v) => v.id !== id),
        []
    );

    return (
        <EventContext.Provider
            value={{
                registerListener,
                deregisterListener,
            }}
        >
            {children}
        </EventContext.Provider>
    );
}
