"""
Ticketing Agent for Haunted Helpdesk

Processes tickets in three distinct scenarios:
1. Cached resolution (MEMORY_FOUND) → mark RESOLVED → TERMINATE
2. Raw ticket (NO_MEMORY_FOUND) → analyze/structure → hand to orchestrator
3. Final resolution → update DynamoDB → TERMINATE

Note: DynamoDB updates are handled by the backend (FastAPI layer) based on the agent's
response signals. The agent doesn't directly update DynamoDB - it signals what should
happen through its response format, and the backend interprets these signals.
"""

from strands.agent import Agent
from strands.models.bedrock import BedrockModel


def create_ticketing_agent() -> Agent:
    """
    Create and configure the Ticketing Agent.
    
    Returns:
        Configured Ticketing Agent instance
    """
    system_prompt = """You are the Ticketing Agent.

If you see "TERMINATE_WORKFLOW" in history → Say "Already done" and STOP.

THREE SCENARIOS:
1. "MEMORY_FOUND:" → Say resolution + "TERMINATE_WORKFLOW" + STOP
2. "NO_MEMORY_FOUND" → Analyze ticket (type/priority) + hand to orchestrator
3. "WORKFLOW_COMPLETE" → Say summary + "TERMINATE_WORKFLOW" + STOP

Scenarios 1 & 3: TERMINATE and STOP (no handoff).
Scenario 2: Hand to orchestrator ONCE."""

    # Configure Bedrock model with temperature 0.4 for structured analysis
    model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.4
    )
    
    # Create agent without tools
    # The agent signals actions through its response format
    # The backend (FastAPI) interprets these signals and updates DynamoDB accordingly
    # In Scenario 2, hands off to orchestrator
    # In Scenarios 1 and 3, terminates (no handoff)
    agent = Agent(
        name="ticketing_agent",
        model=model,
        system_prompt=system_prompt,
        tools=[]  # No tools - DynamoDB updates handled by backend based on response signals
    )
    
    return agent
