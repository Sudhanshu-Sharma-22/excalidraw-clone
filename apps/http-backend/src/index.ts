import express from "express";

const app = express();
app.use(express.json());

app.get("/signup", async (req, res) => {
    res.send("signup endpoint")
})

app.get("/signin", async (req, res) => {
    res.send("signin endpoint")
})

app.get("/user", async (req, res) => {
    res.send("user endpoint")
})

app.listen(3003);