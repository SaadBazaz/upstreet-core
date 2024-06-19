import { createClient } from '@supabase/supabase-js';
import jwt from '@tsndr/cloudflare-worker-jwt';
// import { isStringSignatureValid } from './signature-utils.mjs';
import { aiHost } from '@/utils/const/endpoints';

Error.stackTraceLimit = 300;

// uses the service api key
export const makeClient = (env, jwt) => {
  if (!env) {
    throw new Error('cannot make client for blank env');
  }
  if (!env.NEXT_SUPABASE_SERVICE_API_KEY) {
    throw new Error('no service api key');
  }

  const o = {
    auth: {
      // autoRefreshToken: false, // All my Supabase access is from server, so no need to refresh the token
      // detectSessionInUrl: false, // We are not using OAuth, so we don't need this. Also, we are manually "detecting" the session in the server-side code
      persistSession: false, // All our access is from server, so no need to persist the session to browser's local storage
    },
  };
  if (jwt) {
    (o as any).global = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_SUPABASE_SERVICE_API_KEY, o);
};
// uses the public api key
export const makeAnonymousClient = (env, jwt) => {
  if (!env) {
    throw new Error('cannot make anonymous client for blank env');
  }
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('no anon key');
  }

  const o = {
    auth: {
      // autoRefreshToken: false, // All my Supabase access is from server, so no need to refresh the token
      // detectSessionInUrl: false, // We are not using OAuth, so we don't need this. Also, we are manually "detecting" the session in the server-side code
      persistSession: false, // All our access is from server, so no need to persist the session to browser's local storage
    },
  };
  if (jwt) {
    (o as any).global = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, o);
};

export const getTokenFromRequest = (request) => {
  let authHeader;
  if (request.headers.get) {
    authHeader = request.headers.get('authorization');
  } else {
    authHeader = request.headers['authorization'];
  }

  const match = authHeader?.match(/^Bearer\s+(.*)$/i);
  if (match) {
    return match[1];
  } else {
    return '';
  }
};
export const getClientFromToken = async (env, token) => {
  if (!env.SUPABASE_SERVICE_API_KEY) {
    throw new Error('no service api key');
  }
  if (!env) {
    throw new Error('cannot get client for blank env');
  }
  if (!token) {
    throw new Error('cannot get client for blank token');
  }

  let userId;
  let supabase;
  let match;
  const serviceKeyPrefix = `${env.SUPABASE_SERVICE_API_KEY}:`;
  if ( // serviceKey:guid format
    token.startsWith(serviceKeyPrefix) &&
    token.length > serviceKeyPrefix.length
  ) {
    userId = token.slice(serviceKeyPrefix.length);
    supabase = makeClient(env);
  /* } else if (
    (match = token.match(/^signature_([^_]+?)_([^_]+?)_([^_]+?)_([^_]+?)$/))
  ) {
    // signature format
    const guid = match[1];
    const dateString = match[2];
    const nonce = match[3];
    const signatureString = match[4];
    const s = `${guid}_${dateString}_${nonce}`;

    const valid = await isStringSignatureValid(
      s,
      env.SUPABASE_SERVICE_API_KEY,
      signatureString,
    );
    if (valid) {
      userId = guid;
      supabase = makeClient(env);
    } else {
      throw new Error('signature is not valid: ' + token);
    } */
  } else { // jwt format
    const out = jwt.decode(token);
    userId = out?.payload?.id ?? out?.payload?.sub ?? null;
    supabase = makeAnonymousClient(env, token);

    if (!userId) {
      const out2 = await supabase.auth.getUser();
      userId = out2?.data?.user?.id ?? null;
    }
  }
  if (!userId) {
    throw new Error('could not get user id from token');
  }

  return {
    userId,
    supabase,
  };
};

export const getUserIdForJwt = async (jwt) => {
  const res = await fetch(`${aiHost}/checkLogin`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j.userId;
  } else {
    const text = await res.text();
    console.warn(text);
    return null;
  }
};
export const getUserForJwt = async (jwt) => {
  const res = await fetch(`${aiHost}/checkUser`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j.data;
  } else {
    const text = await res.text();
    console.warn(text);
    return null;
  }
};