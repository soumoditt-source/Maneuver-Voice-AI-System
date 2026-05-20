export type AgentState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'ended';

export type VisualState = 'none' | 'services_slide' | 'service_detail' | 'process_diagram' | 'clients_slide' | 'about_us';

export interface RPCEvent {
  event: string;
  data: Record<string, unknown>;
}

export interface LeadData {
  name: string | null;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  problem: string | null;
  timeline: string | null;
  budget: string | null;
  authority: string | null;
  next_action: string | null;
  sentiment: string | null;
}

export interface ServiceCard {
  id: number;
  name: string;
  icon: string;
  desc: string;
  color: string;
  features: string[];
}

export interface ProcessStep {
  step: number;
  title: string;
  desc: string;
  duration: string;
}

export interface TranscriptTurn {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}
