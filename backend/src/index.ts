import { Hono, Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'


const app = new Hono<{
  Bindings: {
    POOLING_URL: string,
 		JWT_SECRET: string,
  },
  Variables: {
    userId: string
  };
}>();

// To restrict a middleware to certain routes, we use "/blog/*"
app.use("/api/v1/blog/*", async function (c, next){
  //get header 
  // verify header 
  // if correct proceed the user 
  // if incorrect unauthorize it
  const header = c.req.header("authorization");
  if (!header) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
  // if the header contains token like this // bearer 8JHSDUW9IU8RHLSKHFSDHF23
  const token = header.split(' ')[1];
  const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	c.set('userId', payload.id);
	await next();
  // wrong //return next();
  // no need to return as this func dont need to return anything
})

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.POOLING_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
   const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password
    },
  });
  const jwt = await sign({id: user.id}, c.env.JWT_SECRET);
	return c.json({ jwt });
  
  } catch (error) {
    c.status(403);  
		return c.json({ error: "error while signing up" });  
  }
});


app.post("/api/v1/signin",async (c) => {
const prisma = new PrismaClient({
    datasourceUrl: c.env.POOLING_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
		where: {
			email: body.email,
      password: body.password
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  //no need to verify as we dont need to authorize the user
  //only authentication
	return c.json({ jwt });

});

app.post("/api/v1/blog", (c) => {
  return c.text("Hello Hono!");
});

app.put("/api/v1/blog", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/v1/blog/:id", (c) => {
  return c.text("Hello Hono!");
});

// app.get("/api/v1/blog/bulk", (c) => {
//   return c.text("Hello Hono!");
// });

export default app;
