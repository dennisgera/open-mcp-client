"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import httpx
from typing_extensions import Literal, TypedDict, Dict, List, Union, Optional, Any
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from copilotkit import CopilotKitState
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from copilotkit.langgraph import copilotkit_exit


# Define the connection type structures
class StdioConnection(TypedDict):
    command: str
    args: List[str]
    transport: Literal["stdio"]


class SSEConnection(TypedDict):
    url: str
    transport: Literal["sse"]
    auth: Optional[Dict[str, str]]
    headers: Optional[Dict[str, Any]]


# Type for MCP configuration
MCPConfig = Dict[str, Union[StdioConnection, SSEConnection]]


class AgentState(CopilotKitState):
    """
    Here we define the state of the agent

    In this instance, we're inheriting from CopilotKitState, which will bring in
    the CopilotKitState fields. We're also adding a custom field, `mcp_config`,
    which will be used to configure MCP services for the agent.
    """

    # Define mcp_config as an optional field without skipping validation
    mcp_config: Optional[MCPConfig]


# Default MCP configuration to use when no configuration is provided in the state
# Uses relative paths to match frontend config
DEFAULT_MCP_CONFIG: MCPConfig = {
    "math": {
        "command": "python",
        "args": ["math_server.py"],
        "transport": "stdio",
    },
}


async def get_bearer_token(base_url: str, username: str, password: str) -> str:
    """Get a bearer token from the server using basic auth."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/token",
            data={"username": username, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5,
        )
        response.raise_for_status()
        return response.json()["access_token"]


async def prepare_mcp_connections(config: MCPConfig) -> MCPConfig:
    """Injects Bearer token headers into SSE connections with basic auth."""
    new_config: MCPConfig = {}

    for name, conn in config.items():
        if conn["transport"] == "sse":
            auth = conn.get("auth", {})
            if auth.get("type") == "basic":
                base_url = conn["url"].rsplit("/", 1)[0]
                token = await get_bearer_token(
                    base_url, auth["username"], auth["password"]
                )

                # Add Authorization header to the SSE connection
                new_config[name] = {
                    "transport": "sse",
                    "url": conn["url"],
                    "headers": {
                        "Authorization": f"Bearer {token}",
                        **(conn.get("headers") or {}),
                    },
                }
            else:
                new_config[name] = conn
        else:
            new_config[name] = conn

    return new_config


async def chat_node(
    state: AgentState, config: RunnableConfig
) -> Command[Literal["__end__"]]:
    """
    This is a simplified agent that uses the ReAct agent as a subgraph.
    It handles both chat responses and tool execution in one node.
    """
    # Get MCP configuration from state, or use the default config if not provided
    mcp_config = state.get("mcp_config", DEFAULT_MCP_CONFIG)
    preprocessed_config = await prepare_mcp_connections(mcp_config)

    print(f"mcp_config: {mcp_config}, default: {DEFAULT_MCP_CONFIG}")

    # Set up the MCP client and tools using the configuration from state
    async with MultiServerMCPClient(preprocessed_config) as mcp_client:
        # Get the tools
        mcp_tools = mcp_client.get_tools()

        # Create the react agent
        model = ChatOpenAI(model="gpt-4o")
        react_agent = create_react_agent(model, mcp_tools)

        # Prepare messages for the react agent
        agent_input = {"messages": state["messages"]}

        # Run the react agent subgraph with our input
        agent_response = await react_agent.ainvoke(agent_input)

        # Update the state with the new messages
        updated_messages = state["messages"] + agent_response.get("messages", [])
        await copilotkit_exit(config)
        # End the graph with the updated messages
        return Command(
            goto=END,
            update={"messages": updated_messages},
        )


# Define the workflow graph with only a chat node
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("chat_node")

# Compile the workflow graph
# graph = workflow.compile(MemorySaver()) # can't use a custom checkpointer in langgraph dev
graph = workflow.compile()
