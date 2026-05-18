import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    userId: string,
    socket: WebSocket,
    rooms: string[]
}

const users: User[] = [];

async function resolveRoomId(roomIdOrSlug: string | number): Promise<number | null> {
    const asNumber = Number(roomIdOrSlug);
    if (!Number.isNaN(asNumber) && String(roomIdOrSlug) === String(asNumber)) {
        return asNumber;
    }
    const room = await prismaClient.room.findFirst({
        where: { slug: String(roomIdOrSlug) },
    });
    return room?.id ?? null;
}

function checkUser(token: string): string | null {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET as string);
        if (!decodedToken || typeof decodedToken === "string") {
            return null;
        }
        return decodedToken.userId;
    } catch (err) {
        console.log(err);
        return null;
    }
}

wss.on("connection", (socket, req) => {
    const url = req.url;
    if (!url) {
        return null;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token");
    if (!token) {
        socket.close();
        return null;
    }

    const userId = checkUser(token);

    if (!userId) {
        socket.close();
        return null;
    }

    users.push({
        socket,
        userId,
        rooms: []
    })

    socket.on("message", async (event) => {
        try {
            let parsedMessage;
            if (typeof event !== "string") {
                parsedMessage = JSON.parse(event.toString());
            } else {
                parsedMessage = JSON.parse(event);
            }

            if (parsedMessage.type === "join_room") {
                const user = users.find(u => u.socket === socket);
                user?.rooms.push(parsedMessage.roomId);
            }
            else if (parsedMessage.type === "leave_room") {
                const user = users.find(u => u.socket === socket);
                if (!user) {
                    return;
                }
                user.rooms = user?.rooms.filter(room => room !== parsedMessage.roomId);
            }
            else if (parsedMessage.type === "send_message") {
                const roomIdOrSlug = parsedMessage.roomId;
                const numericRoomId = await resolveRoomId(roomIdOrSlug);

                if (numericRoomId === null) {
                    console.error(`Room not found: ${roomIdOrSlug}`);
                    return;
                }

                await prismaClient.chat.create({
                    data: {
                        message: parsedMessage.message,
                        userId: userId,
                        roomId: numericRoomId,
                    },
                });

                users.forEach(user => {
                    if (user.rooms.includes(roomIdOrSlug)) {
                        user.socket.send(JSON.stringify({
                            type: "send_message",
                            message: parsedMessage.message,
                            roomId: roomIdOrSlug,
                            userId: userId,
                        }));
                    }
                });
            }
        } catch (err) {
            console.error("WebSocket message handler error:", err);
        }
    });

    socket.on("close", () => {
        const index = users.findIndex(u => u.socket === socket);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});