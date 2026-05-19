import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shapes = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
}

function getCanvasPoint(canvas: HTMLCanvasElement, e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

function parseShapeFromMessage(message: string): Shapes | null {
    try {
        const parsed = JSON.parse(message);
        const shape = parsed.shape;
        if (shape?.type === "rect") {
            return shape;
        }
        else if (shape?.type === "circle") {
            return shape;
        }
    } catch {
        return null;
    }
    return null;
}

export async function initCanvas(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shapes[] = await getExistingShapes(roomId);

    if (!ctx) {
        return;
    }

    socket.onmessage = (e) => {
        const parsed = JSON.parse(e.data);
        if (parsed.type === "send_message") {
            const shape = parseShapeFromMessage(parsed.message);
            if (!shape) return;
            existingShapes.push(shape);
            renderShapes(existingShapes, ctx, canvas);
        }
    }

    renderShapes(existingShapes, ctx, canvas);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        const point = getCanvasPoint(canvas, e);
        startX = point.x;
        startY = point.y;
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const point = getCanvasPoint(canvas, e);
        const width = point.x - startX;
        const height = point.y - startY;
        //@ts-ignore
        const iconSelected = window.iconSelected;
        let shape: Shapes | null = null;
        if (iconSelected === "rect") {
            shape = {
                type: "rect",
                x: startX,
                y: startY,
                width: width,
                height: height
            }
        }
        else if (iconSelected === "circle") {
            shape = {
                type: "circle",
                centerX: startX + width / 2,
                centerY: startY + height / 2,
                radius: Math.max(Math.abs(width), Math.abs(height)) / 2
            }
        }
        if (!shape) return;
        existingShapes.push(shape);

        renderShapes(existingShapes, ctx, canvas);

        socket.send(JSON.stringify({
            type: "send_message",
            message: JSON.stringify({ shape }),
            roomId
        }))

    })

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const point = getCanvasPoint(canvas, e);
            const width = point.x - startX;
            const height = point.y - startY;
            renderShapes(existingShapes, ctx, canvas);
            ctx.strokeStyle = "#3b82f6";
            //@ts-ignore
            const iconSelected = window.iconSelected;
            if (iconSelected === "rect") {
                ctx.strokeRect(startX, startY, width, height);
            }
            else if (iconSelected === "circle") {
                ctx.beginPath();
                const centerX = startX + width / 2;
                const centerY = startY + height / 2;
                const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    })
}

function renderShapes(existingShapes: Shapes[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    for (const shape of existingShapes) {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

async function getExistingShapes(roomId: string) {
    try {
        const response = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
        const data = response.data.messages || [];

        return [...data]
            .reverse()
            .map((x: { message: string }) => parseShapeFromMessage(x.message))
            .filter((shape: Shapes | null): shape is Shapes => shape !== null);
    } catch (err) {
        console.error("Failed to load existing shapes:", err);
        return [];
    }
}