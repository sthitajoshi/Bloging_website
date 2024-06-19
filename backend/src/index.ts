import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign , verify } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();
  
app.use('/api/v1/blog/*', async (c, next) => {
  const Header = c.req.header("authorization")||"";
  const token = Header.split("")[1]

  //@ts-ignore
  const response = await verify(Header, c.env.JWT_SECRET)
  if(response.id){
    await next()
  }else {
    c.status(403)
    return c.json({error: "unauthorized"})
  }
})
  
app.post('/api/user/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

    const body = await c.req.json();

    const user = await prisma.user.create({
    data :{
      email: body.email,
      password: body.password,
    },
    })
    //@ts-ignore
    const token = sign({id :user.id},c.env.JWT_SECRET)

  return c.json({
    jwt : token
  })
});


app.post('/api/v1/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}
   //@ts-ignore
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})


app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog/bulk', (c) => {
  return c.text('Hello Hono!')
})

export default app
