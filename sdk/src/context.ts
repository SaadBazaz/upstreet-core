import { createContext } from 'react';
import {
  AppContextValue,
  // AgentContextValue,
  ActiveAgentObject,
  Conversation,
  ConfigurationContextValue,
} from './types';

export const AppContext = createContext<AppContextValue | null>(null);
export const EpochContext = createContext<number>(0);
export const AgentContext = createContext<ActiveAgentObject | null>(null);
export const ConversationContext = createContext<Conversation | null>(null);
export const ConversationsContext = createContext<Conversation[]>([]);
export const ConfigurationContext = createContext<ConfigurationContextValue>({
  get: (key: string) => null,
  set: (key: string, value: any) => {},
});
