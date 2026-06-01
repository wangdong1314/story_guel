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

  const reqid = Date.now() + '_' + Math.random().toString(36).slice(2, 10);

  const resp = await fetch('https://openspeech.bytedance.com/api/v1/tts', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'Authorization': 'Bearer;rQKDqQhHgdXeHJFhvi5ubCFvaIFyf_3n',

      'X-Api-Resource-Id': 'volc.tts.default'

    },

    body: JSON.stringify({

      app: { appid: '4856880348', token: 'rQKDqQhHgdXeHJFhvi5ubCFvaIFyf_3n', cluster: 'volcano_tts' },

      user: { uid: 'story_game' },

      audio: { voice_type: 'zh_female_shuangkuaisisi_moon_bigtts', encoding: 'mp3' },

      request: { reqid, text, text_type: 'plain', operation: 'query' }

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
