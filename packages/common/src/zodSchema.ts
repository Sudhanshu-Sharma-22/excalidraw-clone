import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string().min(4).max(255),
    password: z.string().min(6),
    name: z.string().min(1).max(100).optional()
});

export const signInSchema = z.object({
    username: z.string().min(4).max(255),
    password: z.string().min(6)
});

export const createRoomSchema = z.object({
    name: z.string().min(1).max(100)
})