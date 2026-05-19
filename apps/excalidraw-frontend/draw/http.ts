import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { Shapes } from "./shapesTypes";


export async function getExistingShapes(roomId: string) {
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

export function parseShapeFromMessage(message: string): Shapes | null {
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