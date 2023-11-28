import express from "express";

const start = () => {
  const app = express();
  app.get("/whoami", (_, response) => response.status(401).send());
  return app;
};
export default start;
