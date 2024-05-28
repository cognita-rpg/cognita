import { useContext, useEffect, useId } from "react";
import { EventsProvider } from "./EventsProvider";
import { Event, EventContext } from "./types";

export function useEvent<TData = any>(
    type: string,
    callback: (data: TData | null) => void
) {
    const id = useId();
    const context = useContext(EventContext);

    useEffect(() => {
        context.registerListener(id, type, callback);
        return () => context.deregisterListener(id);
    }, [
        id,
        type,
        callback,
        context.deregisterListener,
        context.registerListener,
    ]);
}

export { EventsProvider };
export type { Event };
