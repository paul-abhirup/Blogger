import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@paulthedev/blogger-common";

export const blogRouter = new Hono<{
  Bindings: {
    POOLING_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// To restrict a middleware to certain routes, we use "/blog/*"
blogRouter.use("/*", async function (c, next) {
  // issue is in // authHeader: string | undefined
  //so instead of // const authHeader = c.req.header("authorization");
  const authHeader = c.req.header("authorization") || "";
  try {
    // if the header contains token like this // bearer 8JHSDUW9IU8RHLSKHFSDHF23
    const token = authHeader.split(" ")[1];
    const payload = (await verify(token, c.env.JWT_SECRET)) || "";
    if (!payload) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    c.set("userId", payload.id as string);
    await next();
    // wrong //return next();  // no need to return as this func dont need to return anything
  } catch (error) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
});

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.POOLING_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const authorId = c.get("userId");

  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: authorId,
    },
  });
  return c.json({
    id: blog.id,
  });
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.POOLING_URL,
  }).$extends(withAccelerate());

  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const blog = await prisma.blog.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({
    id: blog.id,
  });
});

blogRouter.get("/id/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.POOLING_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: id,
      },
    });
    return c.json({
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      msg: "error while fetching the posts",
    });
  }
});

//todo: add pagination
//todo: shows user specific posts
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.POOLING_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.blog.findMany();

  return c.json({
    blogs,
  });
});
