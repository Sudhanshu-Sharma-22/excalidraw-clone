
import Canvas from "@/app/components/RoomCanvas";
import axios from "axios";

export default async function CanvasPage({ params }: {
    params: Promise<{ roomId: string }>
}) {
    const { roomId } = await params;
    const response = await axios.get(`http://localhost:3004/room/${roomId}`);
    const room = response.data.room;
    console.log(room)

    return (
        <div>
            <Canvas roomId={roomId} />
        </div>
    )

}