import { createApp } from "../server/app";

let app: Awaited<ReturnType<typeof createApp>>["app"] | null = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    const { app: expressApp } = await createApp();
    app = expressApp;
  }
  return app(req, res);
}
