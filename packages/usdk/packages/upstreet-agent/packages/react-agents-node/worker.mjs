import fs from 'fs';
import toml from '@iarna/toml';
// import './util/worker-globals.mjs';
import * as codecs from 'codecs/ws-codec-runtime-worker.mjs';
// import { AgentMain } from 'react-agents/entry.ts';
import { createServer as createViteServer } from 'vite';

// helpers

// const nativeImport = new Function('specifier', 'return import(specifier)');
const headersToObject = (headers) => {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
};

// initialize the dev server
const viteServerPromise = createViteServer({
  server: { 
    middlewareMode: true
  },
  appType: 'custom',
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  optimizeDeps: {
    entries: [
      './agent.tsx',
      './packages/upstreet-agent/packages/react-agents/entry.ts',
    ],
  },
  watch: {
    include: [
      'wrangler.toml',
    ],
  },
});
//
const getEnv = async () => {
  // load the wrangler.toml
  const wranglerTomlPath = './wrangler.toml';
  const wranglerTomlString = fs.readFileSync(wranglerTomlPath, 'utf8');
  const wranglerToml = toml.parse(wranglerTomlString);

  const agentJsonString = wranglerToml.vars.AGENT_JSON;
  if (!agentJsonString) {
    throw new Error('missing AGENT_JSON in wrangler.toml');
  }
  const agentJson = JSON.parse(agentJsonString);

  const apiKey = wranglerToml.vars.AGENT_TOKEN;
  if (!apiKey) {
    throw new Error('missing AGENT_TOKEN in wrangler.toml');
  }

  const mnemonic = wranglerToml.vars.WALLET_MNEMONIC;
  if (!mnemonic) {
    throw new Error('missing WALLET_MNEMONIC in wrangler.toml');
  }

  const {
    SUPABASE_URL,
    SUPABASE_PUBLIC_API_KEY,
  } = wranglerToml.vars;
  if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) {
    throw new Error('missing SUPABASE_URL or SUPABASE_PUBLIC_API_KEY in wrangler.toml');
  }

  // send init message
  const env = {
    AGENT_JSON: JSON.stringify(agentJson),
    AGENT_TOKEN: apiKey,
    WALLET_MNEMONIC: mnemonic,
    SUPABASE_URL,
    SUPABASE_PUBLIC_API_KEY,
    WORKER_ENV: 'development', // 'production',
  };
  return env;
};
const getAgentMain = async () => {
  const viteServer = await viteServerPromise;
  // console.log('get agent module 1');
  const agentModule = await viteServer.ssrLoadModule('/packages/upstreet-agent/packages/react-agents/entry.ts');
  // console.log('get agent module 2', agentModule);
  return agentModule.AgentMain;
};
const getUserRender = async () => {
  const viteServer = await viteServerPromise;
  const agentModule = await viteServer.ssrLoadModule('/agent.tsx');
  return agentModule.default;
};
//
let agentMainPromise = null;
const reloadAgentMain = () => {
  agentMainPromise = (async () => {
    const [
      AgentMain,
      env,
      userRender,
    ] = await Promise.all([
      getAgentMain(),
      getEnv(),
      getUserRender(),
    ]);

    let alarmTimestamp = null;
    const state = {
      userRender,
      codecs,
      storage: {
        async getAlarm() {
          return alarmTimestamp;
        },
        setAlarm(timestamp) {
          alarmTimestamp = timestamp;
        },
      },
    };
    const agentMain = new AgentMain(state, env);
    return agentMain;
  })();
};
reloadAgentMain();
//
const listenForChanges = async () => {
  const viteServer = await viteServerPromise;
  viteServer.watcher.on('change', () => {
    reloadAgentMain();
  });
};
listenForChanges();

process.on('message', async (eventData) => {
  console.log('got event', eventData);

  const method = eventData?.method;
  switch (method) {
    case 'request': {
      (async () => {
        if (!agentMainPromise) {
          throw new Error('agent worker: DurableObject not initialized');
        }
        const agentMain = await agentMainPromise;

        const { args } = eventData;
        const {
          id,
          method,
          headers,
          body,
        } = args;
        if (!id) {
          throw new Error('request message missing id: ' + JSON.stringify(args));
        }

        let resultArrayBuffer = null;
        let resultStatus = null;
        let resultHeaders = null;
        let error = null;
        try {
          const request = new Request(args.url, {
            method,
            headers,
            body,
          });

          const res = await agentMain.fetch(request);
          // console.log('got durable object response', res.ok, res.status, res.headers);
          if (res.ok) {
            resultArrayBuffer = await res.arrayBuffer();
            resultStatus = res.status;
            resultHeaders = headersToObject(res.headers);
          } else {
            throw new Error('Failed to fetch: ' + res.status);
          }
        } catch (err) {
          console.error('Failed to fetch', err);
          error = err;
        }

        globalThis.postMessage({
          method: 'response',
          args: {
            id,
            status: resultStatus,
            body: resultArrayBuffer,
            headers: resultHeaders,
            error,
          },
        });
      })();
      break;
    }
    default: {
      console.error('unknown method', method);
      break;
    }
  }
});