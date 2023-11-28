import express from "express";

const start = () => {
  const app = express();
  app.get("/hello", (_, response) => response.send("Hello, World!"));
  return app;
};
export default start;
