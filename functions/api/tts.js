/** * EdgeOne Pages 边缘函数 - 豆包 TTS 代理 * 部署域名: speechsynthesis-zgjkgthi.edgeone.cool * * 功能: * GET /api/tts?eo_token=xxx&eo_time=xxx → Cookie 预热（返回 1x1 透明像素） * POST /api/tts → 正文 {"text":"..."} → 返回 {"code":3000,"data":"<base64 mp3>"} */

// ====== 配置 ======
const DOUBAO_APPID = '4856880348';
const DOUBAO_TOKEN = 'AKLTMWRlOGMwZDUxNDQxNDM5NmJmZDFkNTcyNDk0MGM2NmE';
const VOICE_CONFIG = {
  speaker: 'zh_female_shuangkuaisisi_moon_bigtts',
  cluster: 'volcano_tts',
  format: 'mp3',
  sample_rate: 24000
};

// EdgeOne Pages 的 eo_token 验证密钥（由平台自动注入环境变量）
// 如果你的项目已配置 eo_token 鉴权，EdgeOne 会在请求到达前验证，这里作为兜底
const EO_SECRET = null; // 如果需要手动验证，填写密钥

// ====== CORS 工具 ======
function setCorsHeaders(response, request) {
  // 动态匹配请求 Origin，支持 file:// null origin
  const origin = request.headers.get('Origin');
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
}

// ====== 1x1 透明 PNG（用于 Cookie 预热 GET 请求） ======
const PIXEL_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// ====== 豆包 TTS 调用 ======
async function callDoubaoTTS(text) {
  const resp = await fetch('https://openspeech.bytedance.com/api/v1/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer;${DOUBAO_TOKEN}`
    },
    body: JSON.stringify({
      app: { appid: DOUBAO_APPID, token: DOUBAO_TOKEN, cluster: VOICE_CONFIG.cluster },
      user: { uid: 'storygame' },
      audio: {
        voice_type: VOICE_CONFIG.speaker,
        encoding: VOICE_CONFIG.format,
        sample_rate: VOICE_CONFIG.sample_rate,
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0
      },
      request: { reqid: crypto.randomUUID(), text: text, text_type: 'plain', operation: 'query' }
    })
  });
  if (!resp.ok) throw new Error(`Doubao HTTP ${resp.status}`);
  const data = await resp.json();
  if (data.code !== 3000) throw new Error(data.message || `Doubao code ${data.code}`);
  return data.data; // base64 audio
}

// ====== 主入口 ======
async function handleRequest(request) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  // OPTIONS 预检
  if (method === 'OPTIONS') {
    const res = new Response(null, { status: 204 });
    setCorsHeaders(res, request);
    return res;
  }

  // GET: Cookie 预热（无实际鉴权，仅用于让浏览器建立 Cookie）
  if (method === 'GET') {
    const imgBin = Uint8Array.from(atob(PIXEL_B64), c => c.charCodeAt(0));
    const res = new Response(imgBin, {
      status: 200,
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }
    });
    // 设置一个短期 Cookie 标记，供后续 POST 验证
    res.headers.set('Set-Cookie', `tts_ready=1; Path=/; Max-Age=3600; SameSite=None; Secure`);
    setCorsHeaders(res, request);
    return res;
  }

  // POST: TTS 合成
  if (method === 'POST') {
    try {
      const body = await request.json();
      const text = (body.text || '').trim();
      if (!text || text.length > 500) {
        const res = new Response(JSON.stringify({ code: -1, message: 'text 为空或过长(≤500)' }), { status: 400 });
        setCorsHeaders(res, request);
        return res;
      }

      const audioB64 = await callDoubaoTTS(text);
      const res = new Response(JSON.stringify({ code: 3000, data: audioB64 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      setCorsHeaders(res, request);
      return res;
    } catch (e) {
      const res = new Response(JSON.stringify({ code: -1, message: e.message }), { status: 500 });
      setCorsHeaders(res, request);
      return res;
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}

// EdgeOne Pages 边缘函数入口
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
（内容由AI生成，仅供参考）
