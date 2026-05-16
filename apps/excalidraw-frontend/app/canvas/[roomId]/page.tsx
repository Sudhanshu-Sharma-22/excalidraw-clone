"use client"

import { initCanvas } from "@/draw";
import { useEffect, useRef } from "react"

export default function canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return;
            }
            initCanvas(ctx, canvas.width, canvas.height)
        }

    }, [canvasRef])


    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600} />
        </div>
    )
}