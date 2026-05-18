import { initCanvas } from "@/draw";
import { useWindowDimensions } from "@/app/hooks/useWindowDimensions";
import { useEffect, useRef, useState } from "react";
import { IconsButton } from "./IconsButton";


type iconShapes = "circle" | "rect" | "line" | "eraser" | "pointer"

export default function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { width, height } = useWindowDimensions();
    const [iconSelected, setIconSelected] = useState<iconShapes>("rect");

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;

            initCanvas(canvas, roomId, socket!)
        }

    }, [roomId, socket]);

    return (
        <div>
            <canvas ref={canvasRef} width={width} height={height} />
            <IconBar iconSelected={iconSelected} setIconSelected={setIconSelected} />
        </div>
    )
}

function IconBar({ iconSelected, setIconSelected }: {
    iconSelected: iconShapes,
    setIconSelected: (s: iconShapes) => void
}) {
    return <div className="flex flex-row gap-2 absolute bottom-0 right-0 m-2">
        <IconsButton icon="Rectangle" onClick={() => {
            setIconSelected("rect");
        }} color="bg-blue-500" activated={iconSelected === "rect"}></IconsButton>
        <IconsButton icon="Circle" onClick={() => {
            setIconSelected("circle");
        }} color="bg-green-500" activated={iconSelected === "circle"}></IconsButton>
        <IconsButton icon="Line" onClick={() => {
            setIconSelected("line")
        }} color="bg-red-500" activated={iconSelected === "line"}></IconsButton>
        <IconsButton icon="Eraser" onClick={() => {
            setIconSelected("eraser")
        }} color="bg-yellow-500" activated={iconSelected === "eraser"}></IconsButton>
        <IconsButton icon="Pointer" onClick={() => {
            setIconSelected("pointer")
        }} color="bg-purple-500" activated={iconSelected === "pointer"}></IconsButton>
    </div>
}