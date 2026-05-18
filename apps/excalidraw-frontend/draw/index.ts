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
    x: number;
    y: number;
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
        const shape: Shapes = {
            type: "rect",
            x: startX,
            y: startY,
            width: width,
            height: height
        }

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
            ctx.strokeRect(startX, startY, width, height);
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