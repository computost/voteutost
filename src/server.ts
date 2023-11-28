import express from "express";

const app = express();
app.get("/hello", (_, response) => response.send("Hello, World!"));
export default app;
