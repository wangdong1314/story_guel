export async function onRequest(context) {

  const { request } = context;

  const origin = request.headers.get('Origin') || '*';

  if (request.method === 'OPTIONS' || request.method === 'GET') {

    return new Response(null, {

      headers: {

        'Access-Control-Allow-Origin': origin,

        'Access-Control-Allow-Credentials': 'true',

        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',

        'Access-Control-Allow-Headers': 'Content-Type'

      }

    });

  }

  const { text } = await request.json();

  const resp = await fetch('https://openspeech.bytedance.com/api/v1/tts', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'X-Api-App-Id': '4856880348',

      'X-Api-Access-Key': 'rQKDqQhHgdXeHJFhvi5ubCFvaIFyf_3n',

      'X-Api-Resource-Id': 'seed-tts-2.0',

      'X-Api-Request-Id': Date.now() + '_' + Math.random().toString(36).slice(2, 10)

    },

    body: JSON.stringify({

      audio: { voice_type: 'zh_female_shuangkuaisixue_moon_bigtts', encoding: 'mp3' },

      request: { text, text_type: 'plain', operation: 'query' }

    })

  });

  const data = await resp.text();

  return new Response(data, {

    headers: {

      'Content-Type': 'application/json',

      'Access-Control-Allow-Origin': origin,

      'Access-Control-Allow-Credentials': 'true'

    }

  });

    }
