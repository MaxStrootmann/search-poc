import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

import hybrid from './search/hybrid.js'
import vector from './search/vector.js'
import generate from './search/generate.js'

const app = new Hono()
app.use(prettyJSON())

// root route 
app.route('/search/hybrid', hybrid)
app.route('/search/vector', vector)
app.route('/search/generate', generate)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
