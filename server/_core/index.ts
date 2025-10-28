import express, { Request, Response } from "express";

const app = express();

app.get("/health", (_req: Request, res: Response) => {
  res.set("Content-Type", "application/json");
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, "0.0.0.0", () => {
  console.log("PORT ENV:", process.env.PORT);
  console.log(`Server listening on ${port}`);
});
