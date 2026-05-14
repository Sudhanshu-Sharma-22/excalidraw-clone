"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";

interface ChatRoomProps {
    messages: { message: string }[],
    roomId: string
}

export function ChatRoomClient({
    messages,
    roomId
}: ChatRoomProps) {
    const [chats, setChats] = useState(messages);
    const { socket, loading } = useSocket();
    const [currentMessage, setCurrentMessage] = useState("");

    useEffect(() => {
        if (socket && !loading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: roomId
            }))
            const handleMessage = (event: MessageEvent) => {
                const parsedEvent = JSON.parse(event.data);
                if (parsedEvent.type === "send_message") {
                    setChats(c => [...c, { message: parsedEvent.message }]);
                }
            };

            socket.addEventListener("message", handleMessage);
            return () => {
                socket.removeEventListener("message", handleMessage);
                socket.send(JSON.stringify({
                    type: "leave_room",
                    roomId: roomId
                }));
            };
        }
    }, [socket, loading, roomId]);

    return <div>
        <div style={{ height: "400px", overflowY: "scroll", border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
            {chats.map((chat, index) => (
                <div key={index} style={{ marginBottom: "5px" }}>
                    {chat.message}
                </div>
            ))}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
            <input
                type="text"
                value={currentMessage}
                onChange={e => setCurrentMessage(e.target.value)}
                style={{ flex: 1, padding: "5px" }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        document.getElementById("send-button")?.click();
                    }
                }}
            />
            <button
                id="send-button"
                onClick={() => {
                    if (!currentMessage.trim()) return;
                    socket?.send(JSON.stringify({
                        type: "send_message",
                        roomId: roomId,
                        message: currentMessage
                    }))
                    setCurrentMessage("")
                }}
                style={{ padding: "5px 15px" }}
            >
                Send
            </button>
        </div>
    </div>
}