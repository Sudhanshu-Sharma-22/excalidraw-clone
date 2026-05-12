import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket, req) => {
    const url = req.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token");
    if (!token) {
        return;
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET as string);
        if (!decodedToken) {
            socket.close();
            return;
        }
    } catch (err) {
        return;
    }

    console.log("A user has connected");
    socket.on("message", (event) => {
        const parsedMessage = JSON.parse(event.toString());
        if (parsedMessage.type === "join") {

        }
    });
});