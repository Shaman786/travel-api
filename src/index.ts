import { Hono } from 'hono'

const app = new Hono()

const db =  drizzle(process.env.DATABASE_URL)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
