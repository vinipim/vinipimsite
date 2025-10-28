import express from "express";

const app = express();
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/", (_req, res) => res.status(200).send("OK"));

const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, "0.0.0.0", () => {
  console.log("PORT ENV:", process.env.PORT);
  console.log(`Server listening on ${port}`);
});
