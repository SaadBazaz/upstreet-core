import { aiProxyHost } from './endpoints.mjs';
import { blobToDataUrl } from './base64.mjs';

export const describe = async (blob, query = `What's in this image?`, {
  jwt,
}) => {
  const dataUrl = await blobToDataUrl(blob);
  const messages = [
    {
      role: 'user',
      content: [
        {
          "type": "text",
          "text": query,
        },
        {
          "type": "image_url",
          "image_url": {
            // "url": `data:image/webp;base64,${base64}`,
            "url": dataUrl,
          }
        }
      ],
    },
  ];
  const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      // 'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      model: 'gpt-4o',
      messages,

      // stream,
    }),
    // signal,
  });
  if (res.ok) {
    const j = await res.json();
    return j.choices[0].message.content;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};