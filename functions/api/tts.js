export default async function onRequest(context) {

  const { request } = context;

  const origin = request.headers.get('Origin') || '*';

  const corsHeaders = {

    'Access-Control-Allow-Origin': origin,

    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',

    'Access-Control-Allow-Headers': 'Content-Type',

    'Access-Control-Allow-Credentials': 'true'

  };

  if (request.method === 'OPTIONS') {

    return new Response(null, { status: 204, headers: corsHeaders });

  }

  if (request.method === 'POST' && new URL(request.url).pathname === '/api/tts') {

    try {

      const { text } = await request.json();

      if (!text) throw new Error('text is required');

      const body = JSON.stringify({

        app: { appid: '4856880348', token: 'AKLTMWRlOGMwZDUxNDQxNDM5NmJmZDFkNTcyNDk0MGM2NmE', cluster: 'volcano_tts' },

        user: { uid: 'story_game' },

        audio: { voice_type: 'zh_female_shuangkuaisisi_moon_bigtts', encoding: 'mp3', rate: 24000, speed_ratio: 1.0, volume_ratio: 1.0, pitch_ratio: 1.0 },

        request: { reqid: Date.now() + '_' + Math.random().toString(36).slice(2, 10), text, text_type: 'plain', operation: 'query' }

      });

      const ttsResp = await fetch('https://openspeech.bytedance.com/api/v1/tts', {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': 'Bearer;AKLTMWRlOGMwZDUxNDQxNDM5NmJmZDFkNTcyNDk0MGM2NmE'

        },

        body

      });

      const data = await ttsResp.json();

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (e) {

      return new Response(JSON.stringify({ code: -1, message: e.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    }

  }

  if (request.method === 'GET') {

    return new Response(JSON.stringify({ code: 0, message: 'TTS service running' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });

}
