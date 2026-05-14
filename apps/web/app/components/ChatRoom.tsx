import axios from "axios"
import { BACKEND_URL } from "../config"
import { ChatRoomClient } from "./ChatRoomClient";


export default async function ChatRoom({ roomId }: {
    roomId: string
}) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = res.data.messages;
    return <ChatRoomClient messages={messages} roomId={roomId} />
}