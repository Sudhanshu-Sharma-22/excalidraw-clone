import { initCanvas } from "@/draw";
import { useEffect } from "react";
import { useRef } from "react";
import { useSocket } from "@/app/hooks/useSocket";


export default function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;

            initCanvas(canvas, roomId, socket!)
        }

    }, [canvasRef]);

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600} />
        </div>
    )
}