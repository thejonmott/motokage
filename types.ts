
export enum TabType {
  STRATEGY = 'STRATEGY',
  DOCUMENTATION = 'DOCUMENTATION',
  ORIGIN = 'ORIGIN',
  MOSAIC = 'MOSAIC',
  DNA = 'DNA',
  MANDATES = 'MANDATES',
  SELF = 'SELF',
  DASHBOARD = 'DASHBOARD'
}

export type MemoryCategory = 'axiom' | 'chronos' | 'echo' | 'logos' | 'ethos';
export type SensitivityLevel = 'PRIVATE' | 'PUBLIC';
export type AccessLevel = 'CORE' | 'AMBASSADOR';

export interface MemoryShard {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  active: boolean;
  sensitivity: SensitivityLevel;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  sensors: string[];
  tools: string[];
  status: 'idle' | 'executing' | 'waiting';
}

export interface Mandate {
  id: string;
  title: string;
  objective: string;
  priority: 'CRITICAL' | 'STRATEGIC' | 'OPERATIONAL';
  status: 'active' | 'pending' | 'completed';
  agents: Agent[];
}

export interface OriginFact {
  id: string;
  year: string;
  event: string;
  significance: string;
}

export interface Persona {
  name: string;
  profession: string;
  tone: string;
  coreValues: string[];
  bio: string;
  reasoningLogic: string;
  memoryShards: MemoryShard[];
  mandates: Mandate[];
  originFacts: OriginFact[];
  accessLevel: AccessLevel;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Fixed error: All declarations of 'aistudio' must have identical modifiers.
// Subsequent property declarations must have the same type.
// The environment requires aistudio to be defined as the AIStudio interface.
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Global window extension for AI Studio environments
declare global {
  interface Window {
    aistudio: AIStudio;
  }
}
