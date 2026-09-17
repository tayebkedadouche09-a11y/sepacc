import type { RequestHandler } from "express";
import { createApp } from "../server/_core/index";

let handlerPromise: Promise<RequestHandler> | null = null;

async function getHandler(): Promise<RequestHandler> {
  if (!handlerPromise) {
    handlerPromise = createApp({ development: false }).then(({ app }) => app as RequestHandler);
  }
  return handlerPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getHandler();
  return app(req, res);
}
