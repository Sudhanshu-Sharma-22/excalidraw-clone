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
        const parsedMessage = JSON.parse(event.toString());
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
            const roomId = parsedMessage.roomId;

            // i can use bullmq for better latency but for now i am just starting the app first to see if its working or not
            await prismaClient.chat.create({
                data: {
                    message: parsedMessage.message,
                    userId: userId,
                    roomId: roomId
                }
            })

            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    user.socket.send(JSON.stringify({
                        type: "send_message",
                        message: parsedMessage.message,
                        roomId: roomId,
                        userId: userId
                    }))
                }
            })
        }
    });
});