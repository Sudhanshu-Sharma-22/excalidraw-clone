import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shapes = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function initCanvas(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shapes[] = await getExistingShapes(roomId);

    if (!ctx) {
        return;
    }

    socket.onmessage = (e) => {
        const { type, data } = JSON.parse(e.data);
        if (type === "chat") {
            existingShapes.push(data);
            renderShapes(existingShapes, ctx, canvas);
        }
    }

    renderShapes(existingShapes, ctx, canvas);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
        // console.log(startX, startY)
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        const shape: Shapes = {
            type: "rect",
            x: startX,
            y: startY,
            width: width,
            height: height
        }

        existingShapes.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId
        }))

    })

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            renderShapes(existingShapes, ctx, canvas);
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(startX, startY, width, height);
        }
    })
}

function renderShapes(existingShapes: Shapes[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    existingShapes.map((shape => {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
    }))
}

async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const data = response.data.messages || [];

    const Shape = data.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message);
        return messageData;
    })
    return Shape;
}