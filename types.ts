

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

// Global scope augmentation for environment-provided objects to resolve conflicts
declare global {
  /**
   * Interface for the AI Studio API key management utility provided by the environment.
   * Defined here to ensure identity with the global object's type across potential multiple declarations.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Added readonly modifier to ensure identity with the environment-provided declaration of aistudio on Window.
    // This resolves the error: "All declarations of 'aistudio' must have identical modifiers."
    readonly aistudio: AIStudio;
  }
}