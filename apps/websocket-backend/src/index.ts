import WebSocket from "ws";
import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

const wss = new WebSocket.Server({ port: 8080 });

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
        const decodedToken = jwt.verify(token, JWT_SECRET);
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