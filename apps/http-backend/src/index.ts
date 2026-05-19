import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { createUserSchema, signInSchema, createRoomSchema } from "@repo/common/zodSchema";
import { prismaClient } from "@repo/db/client";
import * as bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    // res.send("signup endpoint")
    console.log(req.body);
    const parsedData = createUserSchema.safeParse(req.body);
    console.log(parsedData);
    if (parsedData.success) {
        const { username, password, name } = parsedData.data;
        try {
            const user = await prismaClient.user.create({
                data: {
                    email: username,
                    password: password,
                    name: name
                }
            })
            res.json({
                message: "you have successfully signed up"
            })
        } catch (err) {
            console.error("Signup error details:", err);
            res.status(500).json({
                message: "Error creating user"
            })
        }
    }
    else {
        res.json({
            message: "Incorrect inputs"
        })
    }
})

app.post("/signin", async (req, res) => {
    // res.send("signin endpoint")
    // const parsedData = signInSchema.safeParse(req.body);
    // if (!parsedData.success) {
    //     res.json({
    //         message: "Incorrect inputs"
    //     })
    //     return;
    // }

    const user = await prismaClient.user.findFirst({
        where: {
            email: req.body.username,
            password: req.body.password
        }
    })

    if (!user) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    const token = jwt.sign({
        userId: user?.id
        // }, JWT_SECRET as string, { expiresIn: "1h" });
    }, JWT_SECRET as string);
    res.json({
        token: token
    });

    // res.redirect("/dashboard");
})

app.post("/create-room", authMiddleware, async (req, res) => {
    //db call
    const parsedData = createRoomSchema.safeParse(req.body);
    console.log(parsedData);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore
    const userId = req.userId;

    try {

        if (typeof parsedData.data?.name != "string") {
            return res.json({
                message: "Incorrect inputs"
            })
        }

        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data?.name,
                adminId: userId
            }
        })

        res.json({
            roomID: room.id
        })

    } catch (err) {
        res.json({
            message: "Slug Name Already Exists"
        })
    }


})

app.get("/chats/:roomId", async (req, res) => {
    const slug = req.params.roomId;
    const room = await prismaClient.room.findFirst({
        where: { slug },
    });

    if (!room) {
        res.status(404).json({ messages: [] });
        return;
    }

    const messages = await prismaClient.chat.findMany({
        where: { roomId: room.id },
        orderBy: { id: "desc" },
        take: 1000,
    });

    res.json({ messages });
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug: slug
        }
    })

    res.json({
        room
    })
})

app.listen(3004);