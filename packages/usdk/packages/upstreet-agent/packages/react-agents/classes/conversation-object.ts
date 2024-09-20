import {
  // AgentObject,
  ActiveAgentObject,
  ActionMessage,
  // ActionMessages,
  MessageFilter,
  PendingActionMessage,
  ActionMessageEventData,
  PlayableAudioStream,
  GetHashFn,
} from '../types'
import { SceneObject } from '../classes/scene-object';
import { Player } from './player';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

//

export const CACHED_MESSAGES_LIMIT = 50;

//

class MessageCache extends EventTarget {
  messages: ActionMessage[] = [];
  loaded: boolean = false;
  loadPromise: Promise<void> | null = null;

  tickUpdate() {
    this.dispatchEvent(new MessageEvent('update', {
      data: null,
    }));
  }
  pushMessage(message: ActionMessage) {
    this.messages.push(message);
    this.trim();
    this.tickUpdate();
  }
  prependMessages(messages: ActionMessage[]) {
    this.messages.unshift(...messages);
    this.trim();
    this.tickUpdate();
  }
  trim() {
    if (this.messages.length > CACHED_MESSAGES_LIMIT) {
      this.messages.splice(0, this.messages.length - CACHED_MESSAGES_LIMIT);
    }
  }
}

//

export class ConversationObject extends EventTarget {
  getHash: GetHashFn;
  scene: SceneObject | null = null;
  agent: ActiveAgentObject | null = null;
  agentsMap: Map<string, Player> = new Map();
  messageCache = new MessageCache();
  numTyping: number = 0;

  constructor({
    agent,
    getHash,
  }: {
    agent: ActiveAgentObject;
    getHash: GetHashFn;
  }) {
    super();

    this.agent = agent;
    this.getHash = getHash;
  }

  //

  async typing(fn: () => Promise<void>) {
    const start = () => {
      if (++this.numTyping === 1) {
        this.dispatchEvent(new MessageEvent('typingstart', {
          data: null,
        }));
      }
    };
    const end = () => {
      if (--this.numTyping === 0) {
        this.dispatchEvent(new MessageEvent('typingend', {
          data: null,
        }));
      }
    };
    start();
    try {
      return await fn();
    } finally {
      end();
    }
  }

  //

  getScene() {
    return this.scene;
  }
  setScene(scene: SceneObject | null) {
    this.scene = scene;
  }

  getAgent() {
    return this.agent;
  }
  // setAgent(agent: ActiveAgentObject) {
  //   this.agent = agent;
  // }

  getAgents() {
    return Array
      .from(this.agentsMap.values())
      // .map(player => player.getPlayerSpec());
  }
  addAgent(agentId: string, player: Player) {
    this.agentsMap.set(agentId, player);
  }
  removeAgent(agentId: string) {
    this.agentsMap.delete(agentId);
  }

  getKey() {
    return this.getHash();
  }

  #getAllMessages() {
    return this.messageCache.messages;
  }
  #getAllAgents() {
    const allAgents: object[] = [
      ...Array.from(this.agentsMap.values()).map(player => player.playerSpec),
    ];
    const agent = this.agent;
    allAgents.push(agent.agentJson);
    return allAgents;
  }
  getEmbeddingString() {
    const allMessages = this.#getAllMessages();
    const allAgents = this.#getAllAgents();

    return [
      allMessages.map(m => {
        return `${m.name}: ${m.method} ${JSON.stringify(m.args)}`;
      }),
      JSON.stringify(allAgents),
    ].join('\n');
  }

  getCachedMessages(filter?: MessageFilter) {
    const agent = filter?.agent;
    const idMatches = agent?.idMatches;
    const capabilityMatches = agent?.capabilityMatches;
    const query = filter?.query;
    const before = filter?.before;
    const after = filter?.after;
    const limit = filter?.limit;

    if (query) {
      throw new Error('query is not supported in cached messages');
    }

    const filterFns: ((m: ActionMessage) => boolean)[] = [];
    if (Array.isArray(idMatches)) {
      filterFns.push((m: ActionMessage) => {
        return idMatches.includes(m.userId);
      });
    }
    if (Array.isArray(capabilityMatches)) {
      // XXX implement this to detect e.g. voice capability
    }
    if (before instanceof Date) {
      filterFns.push((m: ActionMessage) => {
        return m.timestamp < before;
      });
    }
    if (after instanceof Date) {
      filterFns.push((m: ActionMessage) => {
        return m.timestamp > after;
      });
    }
    let messages = this.messageCache.messages.filter(m => filterFns.every(fn => fn(m)));
    if (typeof limit === 'number') {
      messages = messages.slice(-limit);
    }
    return messages;
  }
  /* async fetchMessages(filter: MessageFilter, {
    supabase,
    signal,
  }: {
    supabase: any;
    signal: AbortSignal;
  }) {
    const agent = filter?.agent;
    const idMatches = agent?.idMatches;
    const capabilityMatches = agent?.capabilityMatches;
    const query = filter?.query;
    const before = filter?.before;
    const after = filter?.after;
    const limit = filter?.limit;

    // XXX implement this to go to the database. support query via embedding.
    throw new Error('not implemented');

    return [] as ActionMessage[];
  } */

  // pull a logged message from the network
  async addLocalMessage(message: ActionMessage) {
    const {
      hidden,
    } = message;

    if (!hidden) {
      this.messageCache.pushMessage(message);
    }

    const { userId } = message;
    const player = this.agentsMap.get(userId) ?? null;
    const playerSpec = player?.getPlayerSpec() ?? null;
    if (!playerSpec) {
      console.log('got local message for unknown agent', {
        message,
        agentsMap: this.agentsMap,
      });
    }

    const e = new ExtendableMessageEvent<ActionMessageEventData>('localmessage', {
      data: {
        agent: playerSpec,
        message,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  }
  // push a message to the network
  async addLocalAndRemoteMessage(message: ActionMessage) {
    this.messageCache.pushMessage(message);

    const e = new ExtendableMessageEvent<ActionMessageEventData>('remotemessage', {
      data: {
        message,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  }

  addAudioStream(audioStream: PlayableAudioStream) {
    this.dispatchEvent(
      new MessageEvent('audiostream', {
        data: {
          audioStream,
        },
      }),
    );
  }
}
