// TypeScript equivalents of the Python types in agent.py

export type StdioConnection = {
  command: string;
  args: string[];
  transport: "stdio";
};

export type SSEConnection = {
  url: string;
  transport: "sse";
};

// A service connection can be either StdioConnection or SSEConnection
export type ServiceConnection = StdioConnection | SSEConnection;

// MCPConfig maps service names to their connection configs
export type MCPConfig = {
  [serviceName: string]: ServiceConnection;
};

// AgentState adds mcp_config to CopilotKitState
export interface AgentState {
  mcp_config?: MCPConfig;
} 