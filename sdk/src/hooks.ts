import { useState, useMemo, useContext, useEffect, use } from 'react';
import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionProps,
  FormatterProps,
  NameProps,
  PersonalityProps,
  ActionMessages,
  ActionMessage,
  ActionHistoryQuery,
  ChatArgs,
  TtsArgs,
  Tts,
  Chat,
} from './types';
import {
  AppContext,
  AgentContext,
  ConversationContext,
  ConversationsContext,
  GenerativeAgentContext,
} from './context';
import {
  // ConversationObject,
  CACHED_MESSAGES_LIMIT,
} from './classes/conversation-object';
import {
  loadMessagesFromDatabase,
} from './util/loadMessagesFromDatabase';
import {
  abortError,
  makePromise,
} from './util/util.mjs';

//

export const useAuthToken: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useAuthToken();
};

//

export const useCurrentAgent = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue;
};
export const useConversations = () => {
  const conversationsContext = useContext(ConversationsContext);
  return conversationsContext;
};
export const useCurrentGenerativeAgent = () => {
  const generativeAgentContextValue = useContext(GenerativeAgentContext);
  return generativeAgentContextValue;
};
export const useCurrentConversation = () => {
  const generativeAgentContextValue = useContext(GenerativeAgentContext);
  return generativeAgentContextValue.conversation;
};
/* export const useScene: () => SceneObject = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useScene();
};
export const useAgents: () => Array<AgentObject> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useAgents();
}; */

export const useActions: () => Array<ActionProps> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useActions();
};
export const useFormatters: () => Array<FormatterProps> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useFormatters();
};

export const useName: () => string = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useName();
};
export const usePersonality: () => string = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.usePersonality();
};

/* export const useActionHistory: (opts?: ActionHistoryQuery) => ActionMessages = (opts) => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useActionHistory(opts);
}; */
export const useCachedMessages = (opts?: ActionHistoryQuery) => {
  const agent = useCurrentAgent();
  const supabase = agent.useSupabase();
  const conversation = useCurrentConversation();

  if (!conversation.messageCache.loadPromise) {
    conversation.messageCache.loadPromise = (async () => {
      const messages = await loadMessagesFromDatabase({
        supabase,
        conversationId: agent.id,
        agentId: agent.id,
        limit: CACHED_MESSAGES_LIMIT,
      });
      conversation.messageCache.prependMessages(messages);
    })();
  }
  use(conversation.messageCache.loadPromise);
  if (conversation.messageCache.loaded) {
    return conversation.getCachedMessages(opts?.filter);
  } else {
    return [];
  }
};
export const useMessageFetch = (opts?: ActionHistoryQuery) => {
  const agent = useCurrentAgent();
  const supabase = agent.useSupabase();
  const conversation = useCurrentConversation();
  const optsString = JSON.stringify(opts);
  const messagesPromise = useMemo<any>(makePromise, [conversation, optsString]);
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    (async () => {
      try {
        const messages = await conversation.fetchMessages(opts?.filter, {
          supabase,
          signal,
        });
        messagesPromise.resolve(messages);
      } catch (err) {
        if (err === abortError) {
          // nothing
        } else {
          messagesPromise.reject(err);
        }
      }
    })();

    return () => {
      abortController.abort(abortError);
    };
  }, [conversation, optsString]);
  use(messagesPromise);
  return messagesPromise;
};

export const useTts: (opts?: TtsArgs) => Tts = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useTts(opts);
};
export const useChat: (opts?: ChatArgs) => Chat = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useChat(opts);
};
