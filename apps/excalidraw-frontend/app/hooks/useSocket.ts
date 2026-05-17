import { WS_BACKEND } from "@/config";
import { useEffect, useState } from "react";
export function useSocket(roomId: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_BACKEND}?token=${localStorage.getItem("token")}`);

        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }

        ws.onclose = () => {
            console.log("Connection closed");
        }
    }, [roomId])

    return socket;
}