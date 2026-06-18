import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (request, response) => {
  void request;

  response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
