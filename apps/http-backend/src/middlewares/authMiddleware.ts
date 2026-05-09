import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        if (decodedToken) {
            //@ts-ignore
            req.id = decodedToken.id;
            next();
        }
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}