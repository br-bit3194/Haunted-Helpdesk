# Design Document

## Overview

This design addresses the endless loop issue in the Haunted Helpdesk multi-agent workflow by implementing explicit termination signals, workflow state management, and loop detection mechanisms. The solution focuses on making workflow termination deterministic and preventing agents from continuing to hand off after the workflow should have ended.

The core approach is to:
1. Add explicit termination markers that agents recognize and respect
2. Implement workflow state tracking in the Orchestrator Agent
3. Centralize termination authority in the Ticketing Agent
4. Add loop detection at the Swarm level
5. Improve agent prompt clarity around handoff rules

## Architecture

### Current Architecture Issues

The current system has several architectural problems:

1. **Implicit Termination**: Agents rely on parsing response text for termination signals, which is error-prone
2. **Stateless Orchestrator**: The Orchestrator doesn't maintain workflow state, leading to repeated operations
3. **Distributed Termination Logic**: Multiple agents can attempt to terminate, causing confusion
4. **No Loop Detection**: The Swarm doesn't detect when agents are stuck in a loop
5. **Ambiguous Handoff Rules**: Agent prompts don't clearly specify when to hand off vs. terminate

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Endpoint                        │
│                   (process_ticket)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Swarm Orchestration                       │
│  - Loop Detection (repetitive handoff detection)            │
│  - Max Handoffs Enforcement (20 limit)                      │
│  - Timeout Management (10 min total, 2 min per agent)       │
│  - Termination Signal Recognition                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Orchestrator Agent (Entry Point)                │
│  - Workflow State Tracking                                   │
│  - Routing Logic Based on State                             │
│  - Termination Signal Detection                             │
│  - Handoff Decision Making                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌──────────┐
    │ Memory │    │ Ticketing│    │  Worker  │
    │ Agent  │    │  Agent   │    │  Agents  │
    └────────┘    └──────────┘    └──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Summarization   │
              │     Agent       │
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Ticketing Agent │
              │  (TERMINATE)    │
              └─────────────────┘
```

### Key Architectural Changes

1. **Workflow State Machine**: Orchestrator maintains explicit state throughout workflow
2. **Termination Authority**: Only Ticketing Agent can terminate workflow
3. **Signal-Based Communication**: Agents use explicit markers (TERMINATE_WORKFLOW, WORKFLOW_COMPLETE)
4. **Loop Detection**: Swarm monitors handoff patterns and terminates on loops
5. **One-Shot Handoffs**: Each agent hands off exactly once per workflow stage

## Components and Interfaces

### 1. Workflow State Manager (Orchestrator Agent Enhancement)

The Orchestrator Agent will maintain workflow state using a state machine pattern.

**States:**
- `INITIAL` - Workflow just started
- `MEMORY_CHECK_PENDING` - Waiting for memory check
- `MEMORY_FOUND` - Cached resolution found
- `MEMORY_NOT_FOUND` - No cached resolution
- `TICKET_ANALYSIS_PENDING` - Waiting for ticket analysis
- `TICKET_ANALYZED` - Ticket analyzed, ready for worker
- `WORKER_PROCESSING` - Worker agent diagnosing issue
- `RESOLUTION_OBTAINED` - Worker provided resolution
- `MEMORY_STORAGE_PENDING` - Storing resolution in memory
- `MEMORY_STORED` - Resolution stored
- `SUMMARY_PENDING` - Waiting for summary
- `SUMMARY_COMPLETE` - Summary ready
- `FINAL_UPDATE_PENDING` - Waiting for final ticket update
- `TERMINATED` - Workflow ended

**State Transitions:**
```
INITIAL → MEMORY_CHECK_PENDING (hand off to memory_agent)
MEMORY_CHECK_PENDING → MEMORY_FOUND (memory returns MEMORY_FOUND)
MEMORY_CHECK_PENDING → MEMORY_NOT_FOUND (memory returns NO_MEMORY_FOUND)
MEMORY_FOUND → SUMMARY_PENDING (hand off to summarization_agent)
MEMORY_NOT_FOUND → TICKET_ANALYSIS_PENDING (hand off to ticketing_agent)
TICKET_ANALYSIS_PENDING → TICKET_ANALYZED (ticketing returns analysis)
TICKET_ANALYZED → WORKER_PROCESSING (hand off to worker agent)
WORKER_PROCESSING → RESOLUTION_OBTAINED (worker returns resolution)
RESOLUTION_OBTAINED → MEMORY_STORAGE_PENDING (hand off to memory_agent with STORE)
MEMORY_STORAGE_PENDING → MEMORY_STORED (memory confirms storage)
MEMORY_STORED → SUMMARY_PENDING (hand off to summarization_agent)
SUMMARY_PENDING → SUMMARY_COMPLETE (summarization returns with WORKFLOW_COMPLETE)
SUMMARY_COMPLETE → FINAL_UPDATE_PENDING (hand off to ticketing_agent)
FINAL_UPDATE_PENDING → TERMINATED (ticketing returns with TERMINATE_WORKFLOW)
```

**Implementation Approach:**
Since the Strands framework doesn't support stateful agents directly, we'll implement state tracking through the agent's prompt and conversation history. The Orchestrator will:
1. Track state by analyzing conversation history
2. Include current state in its internal reasoning
3. Make routing decisions based on detected state
4. Refuse handoffs when in TERMINATED state

### 2. Termination Signal System

**Signal Markers:**
- `TERMINATE_WORKFLOW` - Indicates workflow should end immediately (used by Ticketing Agent)
- `WORKFLOW_COMPLETE` - Indicates task complete, ready for final step (used by Summarization Agent)
- `NO_MEMORY_FOUND` - Indicates no cached resolution (used by Memory Agent)
- `MEMORY_FOUND: [resolution]` - Indicates cached resolution found (used by Memory Agent)

**Detection Logic:**
Each agent will check for these markers in incoming messages and adjust behavior accordingly.

### 3. Loop Detection System

**Implementation in Swarm Configuration:**
The Swarm already has loop detection parameters:
- `repetitive_handoff_detection_window=4` - Window size for detecting loops
- `repetitive_handoff_min_unique_agents=2` - Minimum unique agents to avoid false positives

**Enhancement:**
We'll reduce the window size to 3 to catch loops faster:
```python
repetitive_handoff_detection_window=3
```

**Additional Safeguards:**
- Max handoffs: 20 (already configured)
- Execution timeout: 600 seconds (already configured)
- Node timeout: 120 seconds (already configured)

### 4. Agent Prompt Enhancements

Each agent's system prompt will be updated to:
1. Explicitly state when to hand off vs. terminate
2. Include termination signal markers in responses
3. Check for termination signals before acting
4. Refuse to act if workflow is already terminated

**Orchestrator Agent Changes:**
- Add state tracking instructions
- Add termination signal detection
- Add "do not hand off if TERMINATED" rule
- Add "hand off exactly once per state" rule

**Ticketing Agent Changes:**
- Add TERMINATE_WORKFLOW marker to termination responses
- Add explicit "do not hand off after terminating" rule
- Add check for existing termination in conversation history

**Memory Agent Changes:**
- Add "hand off to orchestrator exactly once" rule
- Add check to prevent duplicate operations

**Summarization Agent Changes:**
- Ensure WORKFLOW_COMPLETE marker is always included
- Add "hand off to orchestrator exactly once" rule

**Worker Agents Changes:**
- Add "hand off to orchestrator exactly once after resolution" rule

## Data Models

### Workflow State (Conceptual Model)

```python
class WorkflowState:
    """
    Conceptual model for workflow state tracking.
    Not implemented as a class, but tracked through conversation history.
    """
    current_state: str  # One of the states listed above
    ticket_id: str
    memory_result: Optional[str]  # "FOUND" or "NOT_FOUND"
    ticket_type: Optional[str]  # "network", "cloud", "other"
    resolution: Optional[str]
    summary: Optional[str]
    handoff_count: int
    handoff_sequence: List[str]  # List of agent names
```

### Termination Signal

```python
class TerminationSignal:
    """
    Conceptual model for termination signals in agent responses.
    """
    signal_type: str  # "TERMINATE_WORKFLOW" or "WORKFLOW_COMPLETE"
    agent_name: str
    message: str
    timestamp: str
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Workflow Termination Guarantee

*For any* ticket workflow, when the Ticketing Agent includes "TERMINATE_WORKFLOW" in its response, the workflow SHALL terminate within 2 seconds without any additional agent handoffs.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Single Termination Authority

*For any* workflow execution, only the Ticketing Agent SHALL have the authority to terminate the workflow, and any termination signal from other agents SHALL be ignored.

**Validates: Requirements 5.1, 5.2, 5.3, 5.5**

### Property 3: Loop Detection Threshold

*For any* workflow execution, if the same agent handoff pattern (A→B→A) repeats 3 times consecutively, the system SHALL terminate the workflow with a loop detection error.

**Validates: Requirements 3.1, 3.2, 3.4**

### Property 4: State Transition Validity

*For any* workflow state transition, the Orchestrator Agent SHALL only transition to states that are valid successors of the current state according to the state machine definition.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 5: Handoff Uniqueness Per Stage

*For any* workflow stage (memory check, ticket analysis, worker processing, etc.), each agent SHALL hand off to the next agent exactly once, preventing duplicate operations.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 6: Termination Signal Propagation

*For any* agent that receives a message containing "TERMINATE_WORKFLOW" or detects terminated state in conversation history, the agent SHALL not initiate any new handoffs.

**Validates: Requirements 2.2, 2.4, 4.6**

### Property 7: Max Handoffs Enforcement

*For any* workflow execution, when the total number of handoffs reaches 20, the system SHALL terminate the workflow with a max handoffs exceeded error.

**Validates: Requirements 3.3**

### Property 8: Timeout Enforcement

*For any* workflow execution, when the total execution time exceeds 10 minutes, the system SHALL terminate the workflow with a timeout error.

**Validates: Requirements 3.5**

### Property 9: Handoff Logging Completeness

*For any* workflow execution, the system SHALL log every agent handoff with source agent, target agent, and timestamp, and return the complete handoff sequence in the API response.

**Validates: Requirements 7.1, 7.2, 7.5**

### Property 10: Independent Workflow Termination

*For any* two workflows processing different tickets concurrently, the termination of one workflow SHALL not affect the execution state of the other workflow.

**Validates: Requirements 1.5**

## Error Handling

### Loop Detection Errors

**Scenario**: Repetitive handoff pattern detected

**Handling**:
1. Swarm detects loop based on `repetitive_handoff_detection_window`
2. Workflow terminates immediately
3. Ticket status updated to "error"
4. Error message includes detected loop pattern
5. Handoff sequence logged for debugging

**Error Response**:
```json
{
  "error": "Loop detected",
  "loop_pattern": ["orchestrator_agent", "ticketing_agent", "orchestrator_agent"],
  "handoff_count": 15,
  "ticket_id": "xxx"
}
```

### Max Handoffs Exceeded

**Scenario**: Workflow exceeds 20 handoffs

**Handling**:
1. Swarm enforces max_handoffs limit
2. Workflow terminates immediately
3. Ticket status updated to "error"
4. Error message includes handoff count and sequence

**Error Response**:
```json
{
  "error": "Max handoffs exceeded",
  "handoff_count": 20,
  "handoff_sequence": ["orchestrator_agent", "memory_agent", ...],
  "ticket_id": "xxx"
}
```

### Execution Timeout

**Scenario**: Workflow exceeds 10 minute timeout

**Handling**:
1. Swarm enforces execution_timeout
2. Workflow terminates immediately
3. Ticket status updated to "error"
4. Error message includes execution time

**Error Response**:
```json
{
  "error": "Execution timeout",
  "execution_time": 600.5,
  "last_agent": "cloud_service_agent",
  "ticket_id": "xxx"
}
```

### Agent Timeout

**Scenario**: Individual agent exceeds 2 minute timeout

**Handling**:
1. Swarm enforces node_timeout
2. Agent execution interrupted
3. Workflow continues with error message
4. If critical agent times out, workflow may terminate

**Error Response**:
```json
{
  "error": "Agent timeout",
  "agent_name": "network_diagnostic_agent",
  "timeout_duration": 120,
  "ticket_id": "xxx"
}
```

### Termination After Termination

**Scenario**: Agent attempts to hand off after workflow terminated

**Handling**:
1. Orchestrator detects TERMINATED state
2. Handoff request ignored
3. Warning logged
4. Workflow remains terminated

**Log Message**:
```
WARNING: Agent 'orchestrator_agent' attempted handoff after workflow termination. Ignoring.
```

## Testing Strategy

### Unit Testing

Unit tests will verify individual components:

1. **State Detection Tests**: Verify Orchestrator correctly identifies workflow state from conversation history
2. **Signal Detection Tests**: Verify agents correctly detect termination signals in messages
3. **Handoff Logic Tests**: Verify each agent hands off to correct next agent based on state
4. **Error Handling Tests**: Verify proper error responses for timeouts and loops

### Property-Based Testing

Property-based tests will verify universal properties across many inputs:

1. **Workflow Termination Property**: Generate random ticket workflows and verify they all terminate
2. **Loop Detection Property**: Generate workflows with intentional loops and verify detection
3. **State Transition Property**: Generate random state sequences and verify only valid transitions occur
4. **Handoff Uniqueness Property**: Generate workflows and verify no duplicate handoffs per stage

### Integration Testing

Integration tests will verify end-to-end workflow:

1. **Happy Path Test**: Submit ticket, verify complete workflow with proper termination
2. **Cached Resolution Test**: Submit duplicate ticket, verify memory path terminates correctly
3. **Loop Scenario Test**: Force loop condition, verify detection and termination
4. **Timeout Test**: Force slow agent, verify timeout handling
5. **Concurrent Workflows Test**: Submit multiple tickets, verify independent termination

### Testing Framework

- **Unit Tests**: pytest
- **Property-Based Tests**: Hypothesis (Python PBT library)
- **Integration Tests**: pytest with FastAPI TestClient
- **Mocking**: unittest.mock for AWS services

### Test Configuration

- Property tests will run minimum 100 iterations
- Each property test will be tagged with format: `# Feature: timeout-sync-fix, Property X: [property text]`
- Integration tests will use test DynamoDB table
- Mock Bedrock responses for deterministic testing

## Implementation Notes

### Orchestrator State Tracking

Since Strands agents don't have built-in state management, the Orchestrator will track state through:
1. Analyzing conversation history for state indicators
2. Including state reasoning in its responses
3. Using state to make routing decisions

The prompt will include explicit instructions like:
```
Before making any routing decision, determine the current workflow state by analyzing:
1. Have I checked memory yet? If not, state is MEMORY_CHECK_PENDING
2. Did memory return FOUND or NOT_FOUND? This determines next state
3. Has ticketing analyzed the ticket? Check for "Ticket Analysis Complete"
4. Has worker provided resolution? Check for resolution details
5. Has memory stored the resolution? Check for storage confirmation
6. Has summarization completed? Check for WORKFLOW_COMPLETE marker
7. Has ticketing terminated? Check for TERMINATE_WORKFLOW marker

Current State: [state based on above analysis]
Next Action: [action based on current state]
```

### Termination Signal Implementation

Agents will include termination signals in their responses:

**Ticketing Agent (Scenario 1 & 3)**:
```
Ticket marked as RESOLVED.

Resolution: [resolution text]

TERMINATE_WORKFLOW
```

**Summarization Agent**:
```
[Summary paragraphs]

WORKFLOW_COMPLETE: Summary created successfully. Please update the ticket with this summary.
```

### Loop Detection Configuration

Update `backend/Helpdesk_swarm.py`:
```python
swarm = Swarm(
    nodes=[...],
    entry_point=orchestrator,
    max_handoffs=20,
    max_iterations=25,
    execution_timeout=600.0,
    node_timeout=120.0,
    repetitive_handoff_detection_window=3,  # Changed from 4 to 3
    repetitive_handoff_min_unique_agents=2
)
```

### Logging Enhancement

Add structured logging throughout workflow:
```python
import logging

logger = logging.getLogger("haunted_helpdesk.workflow")

# Log workflow start
logger.info(f"Workflow started: ticket_id={ticket_id}, entry_agent=orchestrator_agent")

# Log handoffs
logger.info(f"Handoff: {source_agent} → {target_agent}, reason={reason}")

# Log termination
logger.info(f"Workflow terminated: ticket_id={ticket_id}, reason={reason}, duration={duration}s")

# Log loops
logger.warning(f"Loop detected: pattern={pattern}, handoff_count={count}")
```

## Deployment Considerations

### Backward Compatibility

These changes are backward compatible:
- Existing tickets will process normally
- No database schema changes required
- API responses maintain same structure
- Frontend requires no changes

### Performance Impact

Expected performance improvements:
- Faster termination (no extra handoffs)
- Reduced API latency (workflows end sooner)
- Lower AWS Bedrock costs (fewer LLM calls)
- Better resource utilization (no stuck workflows)

### Monitoring

Add CloudWatch metrics:
- Workflow termination rate
- Average handoff count per workflow
- Loop detection frequency
- Timeout occurrence rate
- Average workflow duration

### Rollback Plan

If issues occur:
1. Revert agent prompt changes
2. Restore original swarm configuration
3. Monitor for loop recurrence
4. Investigate root cause before re-deploying

## Future Enhancements

1. **Persistent State Storage**: Store workflow state in DynamoDB for recovery after crashes
2. **Circuit Breaker**: Temporarily disable problematic agents if they cause repeated loops
3. **Adaptive Timeouts**: Adjust timeouts based on ticket complexity
4. **Workflow Visualization**: Real-time dashboard showing agent handoffs
5. **A/B Testing**: Compare loop rates between different prompt versions
