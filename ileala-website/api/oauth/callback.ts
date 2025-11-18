// api/oauth/callback.ts
import "dotenv/config";
import express from "express";
import { registerOAuthRoutes } from "../../server/_core/oauth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
registerOAuthRoutes(app);

export const config = {
  api: { bodyParser: false },
};

export default app;
