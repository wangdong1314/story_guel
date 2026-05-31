import { Hono } from 'hono'

const app = new Hono()

app.post('/api/tts', async (c) => {

  const body = await c.req.text()

  const resp = await fetch('https://openspeech.bytedance.com/api/v1/tts', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'Authorization': 'Bearer;AKLTMWRlOGMwZDUxNDQxNDM5NmJmZDFkNTcyNDk0MGM2NmE'

    },

    body

  })

  const data = await resp.text()

  return new Response(data, {

    headers: {

      'Content-Type': 'application/json',

      'Access-Control-Allow-Origin': '*'

    }

  })

})

app.options('/api/tts', (c) => {

  return new Response(null, {

    headers: {

      'Access-Control-Allow-Origin': '*',

      'Access-Control-Allow-Methods': 'POST, OPTIONS',

      'Access-Control-Allow-Headers': 'Content-Type'

    }

  })

})

export default app
