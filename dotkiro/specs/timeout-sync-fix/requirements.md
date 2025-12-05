# Requirements Document

## Introduction

The Haunted Helpdesk multi-agent system experiences endless loops where the backend agent workflow fails to terminate properly. Agents continue handing off to each other indefinitely, causing timeouts and resource exhaustion. This feature addresses the root causes of these loops by implementing explicit termination signals, loop detection, and workflow state management.

## Glossary

- **Agent**: An AI component in the multi-agent system that performs a specific task (e.g., Orchestrator, Memory, Ticketing)
- **Handoff**: The process of one agent passing control to another agent in the workflow
- **Workflow**: The complete sequence of agent interactions from ticket submission to resolution
- **Termination Signal**: An explicit marker that indicates the workflow should end
- **Loop Detection**: A mechanism to identify when agents are repeatedly handing off to each other without progress
- **Swarm**: The collection of all agents working together to process tickets
- **Orchestrator Agent**: The central routing agent that coordinates workflow between other agents
- **Ticketing Agent**: The agent responsible for ticket analysis and workflow termination
- **Memory Agent**: The agent that stores and retrieves past resolutions

## Requirements

### Requirement 1

**User Story:** As a system operator, I want the agent workflow to terminate properly after completing ticket processing, so that resources are not wasted on endless loops.

#### Acceptance Criteria

1. WHEN the Ticketing Agent completes final ticket updates THEN the system SHALL terminate the workflow immediately without additional handoffs
2. WHEN the workflow reaches the termination state THEN the system SHALL prevent any agent from initiating new handoffs
3. WHEN an agent attempts to hand off after workflow termination THEN the system SHALL ignore the handoff request and maintain terminated state
4. WHEN the workflow terminates THEN the system SHALL return the final result to the API caller within 2 seconds
5. WHEN multiple tickets are processed sequentially THEN the system SHALL ensure each workflow terminates independently without interference

### Requirement 2

**User Story:** As a developer, I want explicit termination signals in agent responses, so that the workflow state is unambiguous and easy to debug.

#### Acceptance Criteria

1. WHEN the Ticketing Agent marks a ticket as resolved THEN the agent SHALL include "TERMINATE_WORKFLOW" marker in its response
2. WHEN the Orchestrator Agent receives a "TERMINATE_WORKFLOW" marker THEN the agent SHALL not perform any handoffs
3. WHEN the Summarization Agent completes a summary THEN the agent SHALL include "WORKFLOW_COMPLETE" marker in its response
4. WHEN any agent detects a termination marker in the conversation history THEN the agent SHALL not initiate new handoffs
5. WHEN the workflow state is terminated THEN the system SHALL log the termination reason and final agent

### Requirement 3

**User Story:** As a system operator, I want loop detection to prevent infinite agent handoffs, so that workflows fail fast instead of consuming resources indefinitely.

#### Acceptance Criteria

1. WHEN the same agent handoff pattern repeats 3 times consecutively THEN the system SHALL terminate the workflow with a loop detection error
2. WHEN the Orchestrator Agent hands off to the same agent twice in a row THEN the system SHALL log a warning
3. WHEN the workflow exceeds 20 total handoffs THEN the system SHALL terminate with a max handoffs exceeded error
4. WHEN a loop is detected THEN the system SHALL update the ticket status to "error" with loop detection details
5. WHEN the workflow execution time exceeds 10 minutes THEN the system SHALL terminate with a timeout error

### Requirement 4

**User Story:** As a developer, I want the Orchestrator Agent to track workflow state explicitly, so that routing decisions are based on clear state rather than message parsing.

#### Acceptance Criteria

1. WHEN the workflow starts THEN the Orchestrator Agent SHALL initialize workflow state with "memory_check_pending" status
2. WHEN the Memory Agent returns a result THEN the Orchestrator Agent SHALL update state to "memory_checked" with the result type
3. WHEN the Ticketing Agent completes analysis THEN the Orchestrator Agent SHALL update state to "ticket_analyzed"
4. WHEN a worker agent provides resolution THEN the Orchestrator Agent SHALL update state to "resolution_obtained"
5. WHEN the Summarization Agent completes THEN the Orchestrator Agent SHALL update state to "summary_complete"
6. WHEN the workflow state is "terminated" THEN the Orchestrator Agent SHALL refuse all handoff requests

### Requirement 5

**User Story:** As a system operator, I want the Ticketing Agent to be the sole termination authority, so that workflow termination is centralized and predictable.

#### Acceptance Criteria

1. WHEN the Ticketing Agent receives a cached resolution THEN the agent SHALL terminate the workflow without handing off to other agents
2. WHEN the Ticketing Agent receives a final summary THEN the agent SHALL terminate the workflow without handing off to other agents
3. WHEN the Ticketing Agent terminates the workflow THEN the agent SHALL not accept any subsequent handoffs
4. WHEN any agent other than Ticketing Agent attempts to terminate THEN the system SHALL log a warning and continue the workflow
5. WHEN the Ticketing Agent response contains "TERMINATE_WORKFLOW" THEN the Swarm SHALL stop all agent execution immediately

### Requirement 6

**User Story:** As a developer, I want clear handoff rules in agent prompts, so that agents know exactly when to hand off and when to terminate.

#### Acceptance Criteria

1. WHEN an agent completes its task THEN the agent SHALL explicitly state whether it is handing off or terminating
2. WHEN the Orchestrator Agent receives "WORKFLOW_COMPLETE" marker THEN the agent SHALL hand off to Ticketing Agent exactly once
3. WHEN the Memory Agent completes a retrieval or storage operation THEN the agent SHALL hand off to Orchestrator Agent exactly once
4. WHEN the Summarization Agent completes a summary THEN the agent SHALL hand off to Orchestrator Agent exactly once
5. WHEN any agent detects it has already completed its task in the current workflow THEN the agent SHALL not repeat the task

### Requirement 7

**User Story:** As a system operator, I want workflow execution logs that show the complete handoff sequence, so that I can debug loop issues effectively.

#### Acceptance Criteria

1. WHEN a workflow starts THEN the system SHALL log the initial agent and ticket ID
2. WHEN an agent handoff occurs THEN the system SHALL log the source agent, target agent, and handoff reason
3. WHEN the workflow terminates THEN the system SHALL log the termination reason, final agent, and total execution time
4. WHEN a loop is detected THEN the system SHALL log the repeating handoff pattern
5. WHEN the workflow completes THEN the system SHALL return a handoff sequence array in the API response
