// src/search/vector.ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectToDB } from '../../config/weaviate.js'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()


// Middleware
app.use('*', logger())
app.use('*', cors())
app.use('*', prettyJSON())

app.get('/', async (c) => {
  const client = await connectToDB();
  const searchTerm = c.req.query("searchTerm");

  const emailCollection = client.collections.get("Emails")

  if (searchTerm) {
    try {
      const response = await emailCollection.query.nearText(searchTerm, {
        limit: 5
      })
      const fmtResponses = response.objects.map((element) => {
        return element.properties.subject
      })

      return c.json(fmtResponses)
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        return c.json({
          error: error.message,
        })
      }
    }
  }
  return c.json({
    error: "Please add a query parameter to your request",
  })
})

export default app
