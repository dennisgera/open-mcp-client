# sample_agent/agent.py
import json
from datetime import datetime
from typing import Literal, cast
from dotenv import load_dotenv

from langchain_core.messages import AIMessage, SystemMessage, HumanMessage, ToolMessage
from langgraph.graph import StateGraph
from langgraph.types import Command, interrupt
from langchain_core.runnables import RunnableConfig
from copilotkit.langchain import copilotkit_customize_config
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

# # Define a factory function that will create and return the graph
# def create_mcp_graph():
#     """
#     Create a LangGraph agent with MCP tools.
#     This function creates a fresh connection to the MCP server and returns a graph.
#     """
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
    
#     # Path to your math server
    
#     # Create the model
#     model = ChatOpenAI(model="gpt-4o")
    
#     # Set up and run the async operations to get MCP tools
#     async def setup_mcp_tools():
#         server_params = StdioServerParameters(
#             command="python",
#             args=[MATH_SERVER_PATH],
#         )
        
#         async with stdio_client(server_params) as (read, write):
#             async with ClientSession(read, write) as session:
#                 # Initialize the connection
#                 await session.initialize()
                
#                 # Get tools
#                 tools = await load_mcp_tools(session)
#                 model = model.bind_tools(tools)
                
#         # Create the graph with tools
#         return create_react_agent(model, tools)
    
#     # Create a new event loop to run the async function
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     try:
#         graph_with_tools = loop.run_until_complete(setup_mcp_tools())
#         return graph_with_tools
#     finally:
#         loop.close()

# # Create the graph by calling the factory function
# # This runs at import time and creates a graph with MCP tools
# graph = create_mcp_graph()

"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

from typing_extensions import Literal
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from langchain_core.runnables import RunnableConfig
from langchain.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from langgraph.prebuilt import ToolNode
from copilotkit import CopilotKitState

MATH_SERVER_PATH = "./math_server.py" 

class AgentState(CopilotKitState):
    """
    Here we define the state of the agent

    In this instance, we're inheriting from CopilotKitState, which will bring in
    the CopilotKitState fields. We're also adding a custom field, `language`,
    which will be used to set the language of the agent.
    """
    language: Literal["english", "spanish"] = "english"
    # your_custom_agent_state: str = ""

@tool
def get_weather(location: str):
    """
    Get the weather for a given location.
    """
    return f"The weather for {location} is 70 degrees."

# @tool
# def your_tool_here(your_arg: str):
#     """Your tool description here."""
#     print(f"Your tool logic here")
#     return "Your tool response here."

tools = [
    get_weather
    # your_tool_here
]

async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["tool_node", "__end__"]]:
    """
    Standard chat node based on the ReAct design pattern. It handles:
    - The model to use (and binds in CopilotKit actions and the tools defined above)
    - The system prompt
    - Getting a response from the model
    - Handling tool calls

    For more about the ReAct design pattern, see: 
    https://www.perplexity.ai/search/react-agents-NcXLQhreS0WDzpVaS4m9Cg
    """
    
    # 1. Define the model
    model = ChatOpenAI(model="gpt-4o")

    # Set up and run the async operations to get MCP tools
    mcp_tools = []  # Define outside to store tools
    server_params = StdioServerParameters(
        command="python",
        args=[MATH_SERVER_PATH],
    )
        
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            # Get tools and store them in our outer variable
            mcp_tools = await load_mcp_tools(session)

    # 2. Bind all tools at once after async context is complete
    model_with_tools = model.bind_tools(
        [
            *state["copilotkit"]["actions"],
            *mcp_tools,  # Add MCP tools here
            # your_tool_here
        ],
        parallel_tool_calls=False,
    )

    # 3. Define the system message by which the chat model will be run
    system_message = SystemMessage(
        content=f"You are a helpful assistant. Talk in {state.get('language', 'english')}."
    )

    # 4. Run the model to generate a response
    response = await model_with_tools.ainvoke([
        system_message,
        *state["messages"],
    ], config)

    # 5. Check for tool calls in the response and handle them. We ignore
    #    CopilotKit actions, as they are handled by CopilotKit.
    if isinstance(response, AIMessage) and response.tool_calls:
        actions = state["copilotkit"]["actions"]

        # 5.1 Check for any non-copilotkit actions in the response and
        #     if there are none, go to the tool node.
        if not any(
            action.get("name") == response.tool_calls[0].get("name")
            for action in actions
        ):
            return Command(goto="tool_node", update={"messages": response})

    # 6. We've handled all tool calls, so we can end the graph.
    return Command(
        goto=END,
        update={
            "messages": response
        }
    )

async def tool_node(state: AgentState, config: RunnableConfig) -> Command[Literal["chat_node"]]:
    # Get the current running event loop
    loop = asyncio.get_running_loop()

    mcp_tools = []  # Define outside to store tools
    server_params = StdioServerParameters(
        command="python",
        args=[MATH_SERVER_PATH],
    )    

    # Run the async operations in the current loop
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_tools = await load_mcp_tools(session)

            # ------------------------------
            # THIS IS WHERE THE TOOL GETS EXECUTED
            msgs = []
            tool_state = {}
            for tool_call in state["messages"][-1].tool_calls:
                tool = [tool for tool in mcp_tools if tool.name == tool_call["name"]][0]
                tool_msg = await tool.ainvoke(tool_call["args"]) # THIS LINE IS WHAT BREAKS, IT IS NOT IN THE CURRENT RUN LOOP
                msgs.append(ToolMessage(content=tool_msg, name=tool_call["name"], tool_call_id=tool_call["id"]))
            # ------------------------------

    return tool_state

 

# Define the workflow graph
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.add_node("tool_node", tool_node)
workflow.add_edge("tool_node", "chat_node")
workflow.set_entry_point("chat_node")

# Compile the workflow graph
graph = workflow.compile(MemorySaver())
