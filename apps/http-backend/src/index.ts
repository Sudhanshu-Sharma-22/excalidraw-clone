import express from "express";
import z from "zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middlewares/authMiddleware";
import { createUserSchema } from "@repo/common/zodSchema";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    // res.send("signup endpoint")
    const parsedData = createUserSchema.safeParse(req.body);
    if (parsedData.success) {
        const { username, password } = parsedData.data;
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
        res.json({
            token: token
        })
    }
    else {
        res.json({
            message: "Incorrect inputs"
        })
    }
})

app.get("/signin", authMiddleware, async (req, res) => {
    // res.send("signin endpoint")
    res.redirect("/dashboard");
})

app.post("/create-room", authMiddleware, async (req, res) => {
    //db call
    res.json({
        roomID: "123456"
    })
})

app.listen(3003);