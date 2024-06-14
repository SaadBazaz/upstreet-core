'use client'

import * as React from 'react'
import dedent from 'dedent'
import { NetworkRealms } from '@upstreet/multiplayer/public/network-realms.mjs';
import { multiplayerEndpointUrl } from '@/utils/const/endpoints';
import { set } from 'date-fns';

interface ActionsContext {
  isSearchOpen: boolean
  toggleSearch: () => void
  messages: object[]
  getRoom: () => string
  setRoom: (room: string) => void
}

const ActionsContext = React.createContext<ActionsContext | undefined>(
  undefined
)

export function useActions() {
  const context = React.useContext(ActionsContext)
  if (!context) {
    throw new Error('useActions must be used within a ActionsProvider')
  }
  return context
}

interface ActionsProviderProps {
  children: React.ReactNode
}

class Player {
  playerId: string;
  playerSpec: object;
  constructor(playerId = '', playerSpec: object = {}) {
    this.playerId = playerId;
    this.playerSpec = playerSpec;
  }
  setPlayerSpec(playerSpec: object) {
    this.playerSpec = playerSpec;
  }
}

class TypingMap extends EventTarget {
  #internalMap = new Map(); // playerId: string -> { userId: string, name: string, typing: boolean }
  getMap() {
    return this.#internalMap;
  }
  set(playerId: string, spec : object) {
    this.#internalMap.set(playerId, spec);
    this.dispatchEvent(new MessageEvent('typingchange', {
      data: spec,
    }));
  }
  clear() {
    for (const [playerId, spec] of this.#internalMap) {
      this.dispatchEvent(new MessageEvent('typingchange', {
        data: spec,
      }));
    }
    this.#internalMap.clear();
  }
}

const connectMultiplayer = (room: string, {
  userId,
  name,
}: {
  userId: string;
  name: string;
}) => {
  const realms = new NetworkRealms({
    endpointUrl: multiplayerEndpointUrl,
    playerId: userId,
    audioManager: null,
  });

  const playersMap = new Map();
  const typingMap = new TypingMap();

  const virtualWorld = realms.getVirtualWorld();
  const virtualPlayers = realms.getVirtualPlayers();
  // console.log('got initial players', virtualPlayers.getKeys());

  // console.log('waiting for initial connection...');

  let connected = false;
  const onConnect = async (e) => {
    // console.log('on connect...');
    e.waitUntil(
      (async () => {
        const realmKey = e.data.rootRealmKey;

        const existingAgentIds = Array.from(playersMap.keys());
        if (existingAgentIds.includes(userId)) {
          console.log('your character is already in the room! disconnecting.');
          process.exit(1);
        }

        {
          // Initialize network realms player.
          const localPlayer = new Player(userId, {
            id: userId,
            name,
          });
          const _pushInitialPlayer = () => {
            realms.localPlayer.initializePlayer(
              {
                realmKey,
              },
              {},
            );
            realms.localPlayer.setKeyValue(
              'playerSpec',
              localPlayer.playerSpec,
            );
          };
          _pushInitialPlayer();
        }

        connected = true;

        // log the initial room state
        // agentIds.push(userId);
        /* const agentJsons = await Promise.all(
          agentIds.map(async (agentId) => {
            // current player
            if (agentId === userId) {
              return {
                id: userId,
                name,
              };
            // development agent
            } else if (agentId === devAgentId) {
              return {
                id: devAgentId,
                name,
              };
            } else {
              const assetJson = await getAssetJson(supabase, agentId);
              return {
                id: agentId,
                name: assetJson.name,
              };
            }
          }),
        ); */

        const agentJsons = Array.from(playersMap.values()).map(
          (player) => player.playerSpec,
        );
        console.log(dedent`
          ${`You are ${JSON.stringify(name)} [${userId}]), chatting in ${room}.`}
          In the room (${room}):
          ${agentJsons
            .map((agent) => {
              return `* ${agent.name} [${agent.id}] ${agent.id === userId ? '(you)' : ''}`;
            })
            .join('\n')
          }
        `,
        );
      })(),
    );
  };
  realms.addEventListener('connect', onConnect);

  const _trackRemotePlayers = () => {
    virtualPlayers.addEventListener('join', (e) => {
      const { playerId, player } = e.data;
      if (connected) {
        console.log('remote player joined:', playerId);
      }

      const remotePlayer = new Player(playerId);
      playersMap.set(playerId, remotePlayer);

      // apply initial remote player state
      {
        const playerSpec = player.getKeyValue('playerSpec');
        if (playerSpec) {
          remotePlayer.setPlayerSpec(playerSpec);
        }
      }

      // Handle remote player state updates
      player.addEventListener('update', e => {
        const { key, val } = e.data;

        if (key === 'playerSpec') {
          remotePlayer.setPlayerSpec(val);
        }
      });
    });
    virtualPlayers.addEventListener('leave', e => {
      const { playerId } = e.data;
      if (connected) {
        console.log('remote player left:', playerId);
      }
      const remotePlayer = playersMap.get(playerId);
      if (remotePlayer) {
        playersMap.delete(playerId);
      } else {
        console.log('remote player not found', playerId);
        debugger;
      }
    });
  };
  _trackRemotePlayers();

  const _bindMultiplayerChat = () => {
    const onchat = (e) => {
      const { message } = e.data;
      // console.log('got message', { message });
      const { userId: messageUserId, name, method, args } = message;

      switch (method) {
        case 'say': {
          const { text } = args;
          if (messageUserId !== userId) {
            console.log(`${name}: ${text}`);
          }
          break;
        }
        case 'log': {
          // if (debug) {
            // console.log('got log message', JSON.stringify(args, null, 2));
            // const { userId, name, text } = args;
            // console.log(`\r${name}: ${text}`);
            // replServer.displayPrompt(true);
            const { text } = args;
            console.log(text);
            // console.log(eraseLine + JSON.stringify(args2, null, 2));
          // }
          break;
        }
        case 'typing': {
          const { typing } = args;
          typingMap.set(messageUserId, { userId: messageUserId, name, typing });
          break;
        }
        case 'nudge':
        case 'join':
        case 'leave': {
          // nothing
          break;
        }
        default: {
          // if (debug) {
            // console.log('got log message', JSON.stringify(args, null, 2));
            // const { userId, name, text } = args;
            // console.log(`\r${name}: ${text}`);
            // replServer.displayPrompt(true);
            console.log('unhandled method', JSON.stringify(message));
            // console.log(eraseLine + JSON.stringify(args2, null, 2));
          // }
          break;
        }
      }
    };
    realms.addEventListener('chat', onchat);
    const cleanup = () => {
      realms.removeEventListener('chat', onchat);
      typingMap.clear();
    };
    realms.addEventListener('disconnect', () => {
      cleanup();
    });
  };
  _bindMultiplayerChat();

  (async () => {
    // console.log('update realms keys 1');
    await realms.updateRealmsKeys({
      realmsKeys: [room],
      rootRealmKey: room,
    });
    // console.log('update realms keys 2');
  })();

  return realms;
};

export function ActionsProvider({ children }: ActionsProviderProps) {
  const [isSearchOpen, setSearchOpen] = React.useState<boolean>(false)
  const [messages, setMessages] = React.useState<object[]>([] as object[])
  
  const realmsSpec = React.useMemo(() => {
    let room = '';
    let realms: NetworkRealms | null = null;
    return {
      getRoom: () => room,
      // getRealms: () => realms,
      setRoom: (newRoom: string) => {
        if (room !== newRoom) {
          room = newRoom;
          if (realms) {
            realms.disconnect();
            realms = null;
          }

          setMessages([]);

          const userId = crypto.randomUUID();
          const name = 'Anonymous';
          realms = connectMultiplayer(room, {
            userId,
            name,
          });
          realms.addEventListener('chat', (e) => {
            const { message } = (e as any).data;
            setMessages((prev: object[]) => [...prev, message]);
          });
        }
      },
    };
  }, []);
  const { getRoom, setRoom } = realmsSpec;

  const toggleSearch = () => {
    setSearchOpen(value => !value)
  }

  return (
    <ActionsContext.Provider
      value={{ isSearchOpen, toggleSearch, messages, getRoom, setRoom }}
    >
      {children}
    </ActionsContext.Provider>
  )
}
