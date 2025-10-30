import express, { Request, Response } from "express";
import path from "path";

const app = express();

const distDir = path.resolve(__dirname, "..");

app.use(express.static(distDir));

app.get("/health", (_req: Request, res: Response) => {
  res.set("Content-Type", "application/json");
  res.status(200).json({ status: "ok" });
});

app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, "0.0.0.0", () => {
  console.log("PORT ENV:", process.env.PORT);
  console.log(`Server listening on ${port}`);
});
