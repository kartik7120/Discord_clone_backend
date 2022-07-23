import express from "express";
const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})