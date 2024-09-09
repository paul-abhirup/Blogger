import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { cors } from "hono/cors";

// The // @ts-ignore comment enables the TypeScript compiler to ignore the line below it.

const app = new Hono();

app.use("/*", cors());

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
