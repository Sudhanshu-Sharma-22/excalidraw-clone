import axios from "axios"
import { BACKEND_URL } from "../../config"
import ChatRoom from "../../components/ChatRoom";



async function getRoomId(slug: string) {
    const res = await axios.get(`${BACKEND_URL}/room/${slug}`)
    return res.data.room?.id;
}

export default async function ChatPage({
    params
}: {
    params: {
        slug: string
    }
}) {

    const slug = (await params).slug;
    const roomId = await getRoomId(slug);

    return <ChatRoom roomId={roomId} />
}