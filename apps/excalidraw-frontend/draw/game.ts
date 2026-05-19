import { iconShapes } from "@/app/components/Canvas";
import { getExistingShapes, parseShapeFromMessage } from "./http";
import { Shapes } from "./shapesTypes";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shapes[];
    private roomId: string;
    private socket: WebSocket;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private iconSelected = "rect";


    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.initialize();
        this.initializeHandlers();
        this.initializeMouseHandlers();
    }

    setIconSelected(icon: iconShapes) {
        this.iconSelected = icon;
    }

    async initialize() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.renderShapes();
    }

    initializeHandlers() {
        this.socket.onmessage = (e) => {
            const parsed = JSON.parse(e.data);
            if (parsed.type === "send_message") {
                const shape = parseShapeFromMessage(parsed.message);
                if (!shape) return;
                this.existingShapes.push(shape);
                this.renderShapes();
            }
        }
    }

    renderShapes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2;
        for (const shape of this.existingShapes) {
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
            else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        const point = this.getCanvasPoint(e);
        this.startX = point.x;
        this.startY = point.y;
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const point = this.getCanvasPoint(e);
        const width = point.x - this.startX;
        const height = point.y - this.startY;
        const iconSelected = this.iconSelected;
        let shape: Shapes | null = null;
        if (iconSelected === "rect") {
            // console.log("inside rect")
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width: width,
                height: height
            }
        }
        else if (iconSelected === "circle") {
            // console.log("inside circle")
            shape = {
                type: "circle",
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                radius: Math.max(Math.abs(width), Math.abs(height)) / 2
            }
        }
        if (!shape) return;
        this.existingShapes.push(shape);

        this.renderShapes();

        this.socket.send(JSON.stringify({
            type: "send_message",
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        }))

    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const point = this.getCanvasPoint(e);
            const width = point.x - this.startX;
            const height = point.y - this.startY;
            this.renderShapes();
            this.ctx.strokeStyle = "#3b82f6";
            //@ts-ignore
            const iconSelected = this.iconSelected;
            if (iconSelected === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            }
            else if (iconSelected === "circle") {
                this.ctx.beginPath();
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    initializeMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler.bind(this))

        this.canvas.addEventListener("mouseup", this.mouseUpHandler.bind(this))

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler.bind(this))
    }

    getCanvasPoint(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler.bind(this))

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler.bind(this))

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler.bind(this))
    }
}