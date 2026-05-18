"use client";

import { useSocket } from "@/app/hooks/useSocket";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {

    const socket = useSocket(roomId);

    if (!socket) {
        return <div>Connecting to server...</div>
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    )
}