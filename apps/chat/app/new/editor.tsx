'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import path from 'path';
import Link from 'next/link';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { deployEndpointUrl, r2EndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';
import {
  createAgentGuid,
} from 'usdk/sdk/src/util/guid-util.mjs';
import {
  getAgentToken,
} from 'usdk/sdk/src/util/jwt-utils.mjs';
import {
  generateMnemonic,
} from 'usdk/util/ethereum-utils.mjs';
import {
  Chat,
} from '@/components/chat/chat';
import { cn } from '@/lib/utils';
import { ensureAgentJsonDefaults } from 'usdk/sdk/src/agent-defaults.mjs';
import { AgentInterview, applyFeaturesToAgentJSX } from 'usdk/sdk/src/util/agent-interview.mjs';
import { 
  defaultVoices,
} from 'usdk/sdk/src/agent-defaults.mjs';
import { makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { env } from '@/lib/env'

import * as esbuild from 'esbuild-wasm';
const ensureEsbuild = (() => {
  let esBuildPromise: Promise<void> | null = null;
  return () => {
    if (!esBuildPromise) {
      esBuildPromise = (async () => {
        try {
          const u = new URL('esbuild-wasm/esbuild.wasm', import.meta.url);
          await esbuild.initialize({
            worker: true,
            wasmURL: u.href,
          });
        } catch (err) {
          console.warn('failed to initialize esbuild', err);
        }
      })();
    }
    return esBuildPromise;
  };
})();

const importPlaceholder = `  // ...`;
const featurePlaceholder = `      {/* ... */}`;
const defaultSourceCode = `\
import React from 'react';
import {
  Agent,
${importPlaceholder}
} from 'react-agents';

//

export default function MyAgent() {
  return (
    <Agent>
${featurePlaceholder}
    </Agent>
  );
}
`;
const makeSourceCode = (featuresObject: FeaturesObject) => {
  const importIndentString = Array(2 + 1).join(' ');
  const featureIndentString = Array(3 * 2 + 1).join(' ');

  const featureImports = [
    featuresObject.tts ? `TTS` : null,
  ].filter(Boolean).map(l => `${importIndentString}${l},`).join('\n');
  const featureComponents = [
    featuresObject.tts ? `<TTS voiceEndpoint=${JSON.stringify(featuresObject.tts.voiceEndpoint)} />` : null,
  ].filter(Boolean).map(l => `${featureIndentString}${l}`).join('\n');
  if (featureImports || featureComponents) {
    return defaultSourceCode
      .replace(importPlaceholder, featureImports)
      .replace(featurePlaceholder, featureComponents);
  } else {
    return defaultSourceCode;
  }
};
const defaultFiles = [
  {
    path: '/example.ts',
    content: `\
      export const example = 'This is an example module';
    `,
  },
];
const buildAgentSrc = async (sourceCode: string, {
  files = defaultFiles,
} = {}) => {
  await ensureEsbuild();

  /* const sourceCode = `\
    import React from 'react';
    import {
      Agent,
    } from 'react-agents';
    import { example } from './example.ts';

    console.log({
      React,
      Agent,
      example,
      // error: new Error().stack,
    });

    //

    export default function MyAgent() {
      return (
        <Agent>
        </Agent>
      );
    };
  `; */
  const fileMap = new Map(files.map(file => [file.path, file.content]));
  const filesNamespace = 'files';
  const globalImportMap = new Map(Array.from(Object.entries({
    'react': 'React',
    'zod': 'zod',
    'react-agents': 'ReactAgents',
  })));
  const globalNamespace = 'globals';

  const result = await esbuild.build({
    stdin: {
      contents: sourceCode,
      resolveDir: '/', // Optional: helps with resolving imports
      sourcefile: 'app.tsx', // Optional: helps with error messages
      loader: 'tsx', // Set the appropriate loader based on the source type
    },
    bundle: true,
    outdir: 'dist',
    format: 'esm',
    plugins: [
      {
        name: 'globals-plugin',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const p = args.path;
            const globalName = globalImportMap.get(p);
            // console.log('got resolve', {args, p, globalName});
            if (globalName) {
              return { path: p, namespace: globalNamespace };
            }
            return null; // Continue with the default resolution
          });
          build.onLoad({ filter: /.*/, namespace: globalNamespace }, (args) => {
            const p = args.path;
            const globalName = globalImportMap.get(p);
            // console.log('got load', {args, p, globalName});
            if (globalName) {
              return {
                // globalImports is initialized by the worker wrapper
                contents: `module.exports = globalImports[${JSON.stringify(globalName)}];`,
                loader: 'js',
              };
            }
            return null; // Continue with the default loading
          });
        },
      },
      {
        name: 'files-plugin',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const p = path.resolve(args.resolveDir, args.path);
            // console.log('got resolve', {args, p});
            if (fileMap.has(p)) {
              return { path: p, namespace: filesNamespace };
            }
            return null; // Continue with the default resolution
          });
          build.onLoad({ filter: /.*/, namespace: filesNamespace }, (args) => {
            // console.log('got load', args);
            const p = args.path;
            const contents = fileMap.get(p);
            if (contents) {
              return { contents, loader: 'tsx' };
            }
            return null; // Continue with the default loading
          });
        },
      },
    ],
  });
  const {
    errors = [],
    outputFiles = [],
  } = result;
  if (errors.length === 0) {
    const outputFile = outputFiles[0];
    // console.log('got output file', outputFile);
    const { contents } = outputFile;
    const textDecoder = new TextDecoder();
    const text = textDecoder.decode(contents);
    // console.log('got contents');
    // console.log(text);
    return text;
  } else {
    console.warn('build errors: ', errors);
    throw new Error('Failed to build: ' + JSON.stringify(errors));
  }
};

type FetchOpts = {
  method?: string;
  headers?: object | Headers;
  body?: string | ArrayBuffer;
};
type FetchableWorker = Worker & {
  fetch: (url: string, opts: FetchOpts) => Promise<Response>;
};

type ChatMessage = {
  role: string;
  content: string;
};

type FeaturesFlags = {
  tts: boolean;
};
type FeaturesObject = {
  tts: {
    voiceEndpoint: string;
  } | null;
};
type AgentEditorProps = {
  user: any;
};

export default function AgentEditor({
  user,
}: AgentEditorProps) {
  // state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [visualDescription, setVisualDescription] = useState('');

  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [room, setRoom] = useState('');
  const [starting, setStarting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [worker, setWorker] = useState<FetchableWorker | null>(null);

  const [builderPrompt, setBuilderPrompt] = useState('');
  // const [agentPrompt, setAgentPrompt] = useState('');

  const [voices, setVoices] = useState(() => defaultVoices.slice());
  const [voiceEndpoint, setVoiceEndpoint] = useState<string>(voices[0].voiceEndpoint);

  const agentInterviewPromiseRef = useRef<Promise<AgentInterview> | null>(null);
  const [builderMessages, setBuilderMessages] = useState<ChatMessage[]>([]);

  const builderForm = useRef<HTMLFormElement>(null);
  // const agentForm = useRef<HTMLFormElement>(null);
  const editorForm = useRef<HTMLFormElement>(null);

  const [features, setFeatures] = useState<FeaturesFlags>({
    tts: false,
  });
  const getSourceCodeOpts = (): FeaturesObject => ({
    tts: features.tts ? {
      voiceEndpoint,
    } : null,
  });
  const [sourceCode, setSourceCode] = useState(() => makeSourceCode(getSourceCodeOpts()));

  const monaco = useMonaco();

  // effects
  // sync previewBlob -> previewUrl
  useEffect(() => {
    if (previewBlob) {
      const url = URL.createObjectURL(previewBlob);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl('');
    }
  }, [previewBlob]);
  // load voices
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async () => {
      const jwt = await getJWT();
      const supabase = makeAnonymousClient(env, jwt);
      const result = await supabase
        .from('assets')
        .select('*')
        .eq( 'user_id', user.id )
        .eq( 'type', 'voice' );
      if (signal.aborted) return;

      const { error, data } = result;
      if (!error) {
        // console.log('got voices data 1', data);
        const userVoices = await Promise.all(data.map(async voice => {
          const res = await fetch(voice.start_url);
          const j = await res.json();
          return j;
        }));
        if (signal.aborted) return;

        // console.log('got voices data 2', userVoices);
        setVoices(voices => {
          return [
            ...userVoices,
            ...voices,
          ];
        });
      } else {
        console.warn('error loading voices', error);
      }
    })();
  }, []);
  // sync source code to editor
  useEffect(() => {
    if (monaco) {
      const model = getEditorModel(monaco);
      if (model) {
        const editorValue = getEditorValue(monaco);
        if (editorValue !== sourceCode) {
          model.setValue(sourceCode);
        }
      }
    }
  }, [monaco, sourceCode]);
  // sync features to source code
  useEffect(() => {
    setSourceCode(makeSourceCode(getSourceCodeOpts()));
  }, [features, voiceEndpoint]);

  // helpers
  const getCloudPreviewUrl = async () => {
    if (previewBlob) {
      const jwt = await getJWT();
      const guid = crypto.randomUUID();
      const keyPath = ['assets', guid, 'avatar.jpg'].join('/');
      const u = `${r2EndpointUrl}/${keyPath}`;
      const res = await fetch(u, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
        body: previewBlob,
      });
      if (res.ok) {
        const j = await res.json();
        return j;
      } else {
        const text = await res.text();
        throw new Error(`could not upload avatar file: ${text}`);
      }
    } else {
      return null;
    }
  };
  const getEditorModel = (m = monaco) => m?.editor.getModels()[0] ?? null;
  const getEditorValue = (m = monaco) => getEditorModel(m)?.getValue() ?? '';
  async function startAgent({
    sourceCode = getEditorValue(),
  }: {
    sourceCode?: string;
  } = {}) {
    stopAgent();

    setStarting(true);

    console.log('building agent src...', { monaco, sourceCode });
    const agentSrc = await buildAgentSrc(sourceCode);
    console.log('built agent src:', { agentSrc });

    console.log('getting agent id...');
    const jwt = await getJWT();
    const id: string = await createAgentGuid({
      jwt,
    });
    console.log('got agent id:', id);

    console.log('getting agent token...');
    const agentToken = await getAgentToken(jwt, id);
    console.log('got agent token:', agentToken);

    console.log('uploading agent preview...', { previewBlob });
    const previewUrl = await getCloudPreviewUrl();
    console.log('got agent preview url:', { previewUrl });

    const agentJson = {
      id,
      name: name || undefined,
      bio: bio || undefined,
      visualDescription,
      previewUrl,
    };
    ensureAgentJsonDefaults(agentJson);
    const mnemonic = generateMnemonic();
    const env = {
      AGENT_JSON: JSON.stringify(agentJson),
      AGENT_TOKEN: agentToken,
      WALLET_MNEMONIC: mnemonic,
      SUPABASE_URL: "https://friddlbqibjnxjoxeocc.supabase.co",
      SUPABASE_PUBLIC_API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWRkbGJxaWJqbnhqb3hlb2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM2NjE3NDIsImV4cCI6MjAxOTIzNzc0Mn0.jnvk5X27yFTcJ6jsCkuXOog1ZN825md4clvWuGQ8DMI",
      WORKER_ENV: 'development', // 'production',
    };
    console.log('starting worker with env:', env);

    // initialize the agent worker
    const newWorker = new Worker(new URL('usdk/sdk/worker.tsx', import.meta.url)) as FetchableWorker;
    newWorker.postMessage({
      method: 'initDurableObject',
      args: {
        env,
        agentSrc,
      },
    });
    newWorker.addEventListener('error', e => {
      console.warn('got error', e);
    });
    // augment the agent worker
    newWorker.fetch = async (url: string, opts: FetchOpts) => {
      const requestId = crypto.randomUUID();
      const {
        method, headers, body,
      } = opts;
      newWorker.postMessage({
        method: 'request',
        args: {
          id: requestId,
          url,
          method,
          headers,
          body,
        },
      }, []);
      const res = await new Promise<Response>((accept, reject) => {
        const onmessage = (e: MessageEvent) => {
          // console.log('got worker message data', e.data);
          try {
            const { method } = e.data;
            switch (method) {
              case 'response': {
                const { args } = e.data;
                const {
                  id: responseId,
                } = args;
                if (responseId === requestId) {
                  cleanup();

                  const {
                    error, status, headers, body,
                  } = args;
                  if (!error) {
                    const res = new Response(body, {
                      status,
                      headers,
                    });
                    accept(res);
                  } else {
                    reject(new Error(error));
                  }
                }
                break;
              }
              default: {
                console.warn('unhandled worker message method', e.data);
                break;
              }
            }
          } catch (err) {
            console.error('failed to handle worker message', err);
            reject(err);
          }
        };
        newWorker.addEventListener('message', onmessage);

        const cleanup = () => {
          newWorker.removeEventListener('message', onmessage);
        };
      });
      return res;
    };
    setWorker(newWorker);

    const newRoom = `rooms:${id}:browser`;
    setRoom(newRoom);
    setConnecting(true);

    // call the join request on the agent
    const agentHost = `${location.protocol}//${location.host}`;
    const joinReq = await newWorker.fetch(`${agentHost}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room: newRoom,
        only: true,
      }),
    });
    if (joinReq.ok) {
      const j = await joinReq.json();
      console.log('agent join response json', j);
    } else {
      const text = await joinReq.text();
      console.error('agent failed to join room', joinReq.status, text);
    }

    setStarting(false);
  }
  const stopAgent = () => {
    if (worker) {
      worker.terminate();
      setWorker(null);
    }
    if (room) {
      setRoom('');
    }
  };
  const toggleAgent = async () => {
    if (!worker) {
      await startAgent();
    } else {
      stopAgent();
    }
  };
  const ensureAgentInterview = () => {
    if (!agentInterviewPromiseRef.current) {
      agentInterviewPromiseRef.current = (async () => {
        const jwt = await getJWT();

        const agentJson = {};
        const agentInterview = new AgentInterview({
          agentJson,
          mode: 'manual',
          jwt,
        });
        agentInterview.addEventListener('input', (e: any) => {
          const {
            question,
          } = e.data;
          setBuilderMessages((builderMessages) => [
            ...builderMessages,
            {
              role: 'assistant',
              content: question,
            },
          ]);
        });
        agentInterview.addEventListener('output', (e: any) => {
          const {
            text,
          } = e.data;
          setBuilderMessages((builderMessages) => [
            ...builderMessages,
            {
              role: 'assistant',
              content: text,
            },
          ]);
        });
        agentInterview.addEventListener('change', (e: any) => {
          console.log('got update object', e.data);
          const {
            updateObject,
            agentJson,
          } = e.data;
          setName(agentJson.name);
          setBio(agentJson.bio);
          setVisualDescription(agentJson.visualDescription);
        });
        agentInterview.addEventListener('preview', (e: any) => {
          const {
            result,
            signal,
          } = e.data;
          console.log('got preview data', e.data);
          setPreviewBlob(result);
        });
        agentInterview.addEventListener('finish', (e: any) => {
          // clean up
          agentInterviewPromiseRef.current = null;
        });
        return agentInterview;
      })();
    }
    return agentInterviewPromiseRef.current;
  };
  const builderSubmit = () => {
    builderForm.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  // render
  return (
    <div className="flex flex-1">
      {/* builder */}
      <div className="flex flex-col flex-1 max-h-[calc(100vh_-_64px)]">
        <div className="flex flex-col flex-1 bg-primary/10 overflow-scroll">
          {builderMessages.map((message, index) => (
            <div key={index} className={cn("p-2", message.role === 'assistant' ? 'bg-primary/10' : '')}>
              {message.content}
            </div>
          ))}
        </div>
        <form
          className="flex"
          onSubmit={async e => {
            e.preventDefault();
            e.stopPropagation();

            if (builderPrompt) {
              const agentInterview = await ensureAgentInterview();
              agentInterview.write(builderPrompt);

              setBuilderMessages((builderMessages) => [
                ...builderMessages,
                {
                  role: 'user',
                  content: builderPrompt,
                },
              ]);
              setBuilderPrompt('');
            }
          }}
          ref={builderForm}
        >
          <input
            type="text"
            className="flex-1 px-4"
            value={builderPrompt}
            onKeyDown={e => {
              switch (e.key) {
                case 'Enter': {
                  e.preventDefault();
                  e.stopPropagation();

                  builderSubmit();
                  break;
                }
              }
            }}
            onChange={e => setBuilderPrompt(e.target.value)}
          />
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              agentInterviewPromiseRef.current = null;
              setBuilderMessages([]);
            }}
          >Clear</Button>
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              builderSubmit();
            }}
          >Send</Button>
        </form>
      </div>
      <Chat
        room={room}
        onConnect={(connected) => {
          if (connected) {
            setConnecting(false);
          }
        }}
      />
      {/* editor */}
      <form className="relative flex flex-col flex-1" ref={editorForm} onSubmit={e => {
        e.preventDefault();

        // check if the form is validated
        const valid = builderForm.current?.checkValidity();
        if (valid) {
          (async () => {
            setDeploying(true);

            // get the value from monaco editor
            const value = getEditorValue();
            console.log('deploy 1', {
              name,
              bio,
              visualDescription,
              previewBlob,
              value,
            });

            try {
              const jwt = await getJWT();
              const [
                id,
                previewUrl,
              ] = await Promise.all([
                createAgentGuid({
                  jwt,
                }),
                getCloudPreviewUrl(),
              ]);
              const agentJson = {
                id,
                name,
                bio,
                visualDescription,
                previewUrl,
              };
              console.log('deploy 2', {
                agentJson,
              });

              const res = await fetch(`${deployEndpointUrl}/agent`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/javascript',
                  Authorization: `Bearer ${jwt}`,
                  'Agent-Json': JSON.stringify(agentJson),
                },
                body: value,
              });
              if (res.ok) {
                const j = await res.json();
                console.log('deploy 3', j);
                const agentJsonOutputString = j.vars.AGENT_JSON;
                const agentJsonOutput = JSON.parse(agentJsonOutputString);
                const guid = agentJsonOutput.id;
                location.href = `/agents/${guid}`;
              } else {
                console.error('failed to deploy agent', res);
              }
            } finally {
              setDeploying(false);
            }
          })();
        }
      }}>
        <div className="flex w-100 my-4">
          {previewUrl ? <Link
            href={previewUrl}
            target="_blank"
          >
            <img
              src={previewUrl}
              className='w-20 h-20 mr-2 bg-primary/10 rounded'
            />
          </Link> : <div
            className='w-20 h-20 mr-2 bg-primary/10 rounded'
          />}
          <div
            className="flex flex-col flex-1 mr-2"
          >
            <input type="text" className="px-2" value={name} placeholder="Name" onChange={e => {
              setName(e.target.value);
            }} />
            <input type="text" className="px-2" value={bio} placeholder="Bio" onChange={e => {
              setBio(e.target.value);
            }} />
            <input type="text" className="px-2" value={visualDescription} placeholder="Visual description" onChange={e => {
              setVisualDescription(e.target.value);
            }} />
          </div>
          <div
            className="flex flex-col w-20"
          >
            <Button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                toggleAgent();
              }}
            >{(() => {
              if (starting) {
                return 'Starting...';
              } else if (connecting) {
                return 'Connecting...';
              } else if (worker) {
                return 'Stop';
              } else {
                return 'Start';
              }
            })()}</Button>
            <Button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                editorForm.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }}
              disabled={deploying}
            >{!deploying ? `Deploy` : 'Deploying...'}</Button>
          </div>
        </div>
        <div className="flex flex-col w-100">
          <div>Features</div>
          <div className="flex">
            <label className="flex">
              <input type="checkbox" checked={features.tts} onChange={e => {
                setFeatures({
                  ...features,
                  tts: e.target.checked,
                });
              }} />
              <div className="px-2">TTS</div>
            </label>
            <select value={voiceEndpoint} onChange={e => {
              setVoiceEndpoint(e.target.value);
            }} disabled={!features.tts}>
              {voices.map(voice => {
                return (
                  <option key={voice.voiceEndpoint} value={voice.voiceEndpoint}>{voice.name}</option>
                );
              })}
            </select>
          </div>
        </div>
        <Editor
          theme="vs-dark"
          defaultLanguage="javascript"
          defaultValue={sourceCode}
          options={{
            readOnly: deploying,
          }}
          onMount={(editor, monaco) => {
            (editor as any)._domElement.parentNode.style.flex = 1;

            const model = editor.getModel();
            if (model) {
              model.onDidChangeContent(e => {
                const s = getEditorValue(monaco);
                setSourceCode(s);
              });
            } else {
              console.warn('no model', editor);
            }

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              // // Add your save logic here
              // alert('Ctrl+S pressed');
              startAgent({
                sourceCode: getEditorValue(monaco),
              });
            });
          }}
        />
      </form>
      
    </div>
  );
};
