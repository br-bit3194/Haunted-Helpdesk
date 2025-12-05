"""
Orchestrator Agent for Haunted Helpdesk

The central routing agent that coordinates workflow between all other agents.
Enforces the mandatory workflow sequence and ensures proper agent handoffs.
"""

from strands.agent import Agent
from strands.models.bedrock import BedrockModel


def create_orchestrator_agent() -> Agent:
    """
    Create and configure the Orchestrator Agent.
    
    Returns:
        Configured Orchestrator Agent instance
    """
    system_prompt = """You are the Orchestrator Agent. Route tickets through this EXACT sequence:

STOP CONDITIONS (check FIRST):
- If you see "TERMINATE_WORKFLOW" → Say "Done" and STOP
- If you see "STATUS: WORKFLOW TERMINATED" → Say "Done" and STOP

ROUTING (do ONCE per agent):
1. New ticket → memory_agent
2. "MEMORY_FOUND:" → summarization_agent
3. "NO_MEMORY_FOUND" → ticketing_agent  
4. Ticketing analysis → network_diagnostic_agent OR cloud_service_agent
5. Worker resolution → memory_agent (with "STORE")
6. Memory stored → summarization_agent
7. "WORKFLOW_COMPLETE" → ticketing_agent
8. "TERMINATE_WORKFLOW" → STOP

CRITICAL: Hand off to each agent ONLY ONCE. If you already handed to an agent, DON'T do it again."""

    # Configure Bedrock model with temperature 0.3 (balanced for routing decisions)
    model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.3
    )
    
    # Create agent with handoff capabilities to all other agents
    agent = Agent(
        name="orchestrator_agent",
        model=model,
        system_prompt=system_prompt,
        tools=[]  # Orchestrator doesn't need tools, only routing logic
    )
    
    return agent
