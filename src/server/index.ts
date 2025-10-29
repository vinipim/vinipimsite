import express from "express";

const app = express();
app.get("/health", (req, res) => {
  res.set("Content-Type", "application/json");
  res.status(200).json({ status: "ok" });
});

const port = Number(process.env.PORT);
if (!port) throw new Error("PORT not set");
app.listen(port, "0.0.0.0", () => console.log("listening", { port }));
