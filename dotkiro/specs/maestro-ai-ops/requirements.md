# Requirements Document

## Introduction

Haunted Helpdesk is an AI-powered multi-agent IT operations platform that automates incident resolution using intelligent agent workflows with persistent memory capabilities. The system leverages AWS Bedrock (Claude 3.5 Sonnet), the Strands multi-agent framework, DynamoDB for ticket storage, and a Next.js frontend with a Halloween-themed interface. The platform orchestrates six specialized agents (Orchestrator, Memory, Ticketing, Network Diagnostic, Cloud Service, and Summarization) that work together to resolve IT incidents efficiently by learning from past resolutions.

## Glossary

- **Haunted Helpdesk System**: The complete AI-powered multi-agent IT operations platform
- **Strands Framework**: The multi-agent orchestration framework used for agent coordination
- **Swarm**: A collection of agents working together with defined handoff rules
- **Agent**: An autonomous AI entity with specific tools and responsibilities
- **Orchestrator Agent**: The routing agent that coordinates workflow between other agents
- **Memory Agent**: The agent responsible for storing and retrieving past resolutions
- **Ticketing Agent**: The agent that processes, structures, and updates ticket status
- **Network Diagnostic Agent**: The agent that performs network troubleshooting
- **Cloud Service Agent**: The agent that handles AWS/cloud operations
- **Summarization Agent**: The agent that creates concise resolution summaries
- **Ticket**: A structured IT incident or issue requiring resolution
- **Resolution**: The solution or fix applied to resolve a ticket
- **Memory Store**: JSON file storage system for past resolutions
- **Handoff**: The transfer of control from one agent to another in the workflow
- **AWS Bedrock**: Amazon's managed service for foundation models
- **Claude 3.5 Sonnet**: The specific LLM model used (us.anthropic.claude-3-5-sonnet-20241022-v2:0)
- **DynamoDB**: AWS NoSQL database service for ticket persistence
- **Multimodal Input**: Combined text and image inputs for ticket creation
- **FastAPI Backend**: Python web framework serving the API
- **Next.js Frontend**: React-based web framework for the user interface
- **Property-Based Test**: A test that verifies properties hold across generated inputs

## Requirements

### Requirement 1

**User Story:** As an IT operations team member, I want to submit incident tickets with text descriptions and error screenshots, so that the system can analyze and resolve issues automatically.

#### Acceptance Criteria

1. WHEN a user submits a ticket with text description THEN the Haunted Helpdesk System SHALL create a structured ticket with unique identifier
2. WHEN a user uploads error screenshots with a ticket THEN the Haunted Helpdesk System SHALL analyze images using multimodal capabilities and extract error information
3. WHEN a ticket is created THEN the Haunted Helpdesk System SHALL persist the ticket to DynamoDB immediately
4. WHEN image analysis completes THEN the Haunted Helpdesk System SHALL combine text description and image analysis into unified ticket content
5. WHEN a user submits an empty ticket THEN the Haunted Helpdesk System SHALL reject the submission and return validation error

### Requirement 2

**User Story:** As the system orchestrator, I want to route tickets through a defined workflow sequence, so that each ticket is processed consistently and efficiently.

#### Acceptance Criteria

1. WHEN the Orchestrator Agent receives a new ticket THEN the Orchestrator Agent SHALL hand off to Memory Agent with full ticket content
2. WHEN Memory Agent returns "MEMORY_FOUND" response THEN the Orchestrator Agent SHALL hand off to Summarization Agent before Ticketing Agent
3. WHEN Memory Agent returns "NO_MEMORY_FOUND" response THEN the Orchestrator Agent SHALL hand off to Ticketing Agent for analysis
4. WHEN Ticketing Agent completes analysis THEN the Orchestrator Agent SHALL route to appropriate worker agent based on ticket type
5. WHEN worker agent provides new resolution THEN the Orchestrator Agent SHALL hand off to Memory Agent with explicit storage request
6. WHEN Summarization Agent returns "WORKFLOW_COMPLETE" marker THEN the Orchestrator Agent SHALL hand off to Ticketing Agent for final update
7. WHEN Ticketing Agent terminates workflow THEN the Orchestrator Agent SHALL not restart the workflow

### Requirement 3

**User Story:** As the memory system, I want to store and retrieve past resolutions using keyword matching, so that similar issues can be resolved instantly without re-diagnosis.

#### Acceptance Criteria

1. WHEN Memory Agent receives a ticket query THEN the Memory Agent SHALL search JSON memory store using keyword matching
2. WHEN Memory Agent finds matching resolution THEN the Memory Agent SHALL return "MEMORY_FOUND: [resolution]" format
3. WHEN Memory Agent finds no matching resolution THEN the Memory Agent SHALL return "NO_MEMORY_FOUND" response
4. WHEN Memory Agent receives explicit storage request THEN the Memory Agent SHALL store resolution with query, resolution text, and timestamp
5. WHEN Memory Agent stores a resolution THEN the Memory Agent SHALL persist to memories/Haunted Helpdesk_memories.json file
6. WHEN Memory Agent completes any operation THEN the Memory Agent SHALL hand back to Orchestrator Agent

### Requirement 4

**User Story:** As the ticketing processor, I want to handle tickets in three distinct scenarios, so that cached resolutions, new tickets, and final updates are processed appropriately.

#### Acceptance Criteria

1. WHEN Ticketing Agent receives cached resolution with "MEMORY_FOUND" THEN the Ticketing Agent SHALL mark ticket as RESOLVED and TERMINATE workflow
2. WHEN Ticketing Agent receives raw ticket with "NO_MEMORY_FOUND" THEN the Ticketing Agent SHALL analyze, structure, identify type and priority, then hand to Orchestrator Agent
3. WHEN Ticketing Agent receives final resolution THEN the Ticketing Agent SHALL update ticket status to RESOLVED in DynamoDB and TERMINATE workflow
4. WHEN Ticketing Agent updates ticket status THEN the Ticketing Agent SHALL include complete resolution summary
5. WHEN Ticketing Agent terminates THEN the Ticketing Agent SHALL not perform additional handoffs

### Requirement 5

**User Story:** As a network diagnostic specialist, I want to perform automated network troubleshooting, so that connectivity and DNS issues can be diagnosed without manual intervention.

#### Acceptance Criteria

1. WHEN Network Diagnostic Agent receives network-related ticket THEN the Network Diagnostic Agent SHALL execute appropriate diagnostic tools
2. WHEN Network Diagnostic Agent performs diagnostics THEN the Network Diagnostic Agent SHALL use ping_host, traceroute_host, or check_dns_resolution tools
3. WHEN Network Diagnostic Agent completes diagnostics THEN the Network Diagnostic Agent SHALL provide root cause analysis based on tool results
4. WHEN Network Diagnostic Agent formats results THEN the Network Diagnostic Agent SHALL structure output for Summarization Agent consumption
5. WHEN Network Diagnostic Agent completes analysis THEN the Network Diagnostic Agent SHALL hand off to Summarization Agent

### Requirement 6

**User Story:** As a cloud service specialist, I want to diagnose and resolve AWS cloud issues, so that S3 bucket and cloud service problems can be addressed automatically.

#### Acceptance Criteria

1. WHEN Cloud Service Agent receives AWS-related ticket THEN the Cloud Service Agent SHALL execute appropriate AWS diagnostic tools
2. WHEN Cloud Service Agent performs diagnostics THEN the Cloud Service Agent SHALL use list_all_buckets, get_bucket_location, or check_bucket_exists tools
3. WHEN Cloud Service Agent completes diagnostics THEN the Cloud Service Agent SHALL provide resolution steps based on findings
4. WHEN Cloud Service Agent formats resolution THEN the Cloud Service Agent SHALL include complete resolution details
5. WHEN Cloud Service Agent completes analysis THEN the Cloud Service Agent SHALL hand off to Orchestrator Agent with complete resolution

### Requirement 7

**User Story:** As a documentation specialist, I want to create concise summaries of resolutions, so that ticket outcomes are clearly communicated and stored.

#### Acceptance Criteria

1. WHEN Summarization Agent receives resolution content THEN the Summarization Agent SHALL create summary of two to three paragraphs
2. WHEN Summarization Agent creates summary THEN the Summarization Agent SHALL extract original issue, steps taken, final resolution, and technical details
3. WHEN Summarization Agent completes summary THEN the Summarization Agent SHALL append "WORKFLOW_COMPLETE: Summary created successfully" marker
4. WHEN Summarization Agent generates output THEN the Summarization Agent SHALL use temperature of 0.2 for deterministic results
5. WHEN Summarization Agent finishes THEN the Summarization Agent SHALL hand off to Orchestrator Agent

### Requirement 8

**User Story:** As a system administrator, I want to manage tickets through a REST API, so that external systems and the frontend can interact with the platform.

#### Acceptance Criteria

1. WHEN API receives GET request to /health endpoint THEN the Haunted Helpdesk System SHALL return health status including AWS service availability
2. WHEN API receives POST request to /api/tickets THEN the Haunted Helpdesk System SHALL create new ticket and return ticket identifier
3. WHEN API receives GET request to /api/tickets THEN the Haunted Helpdesk System SHALL return list of all tickets from DynamoDB
4. WHEN API receives GET request to /api/tickets/{ticket_id} THEN the Haunted Helpdesk System SHALL return specific ticket details
5. WHEN API receives POST request to /api/process-ticket/{ticket_id} THEN the Haunted Helpdesk System SHALL initiate workflow processing for that ticket
6. WHEN API receives POST request to /api/submit-ticket with multipart form data THEN the Haunted Helpdesk System SHALL process text and file attachments
7. WHEN API processes requests THEN the Haunted Helpdesk System SHALL enable CORS for localhost:3000 and localhost:8000

### Requirement 9

**User Story:** As a frontend user, I want to interact with a Halloween-themed interface, so that ticket submission and monitoring is engaging and visually distinctive.

#### Acceptance Criteria

1. WHEN user visits landing page THEN the Haunted Helpdesk System SHALL display haunted mansion entrance with floating ghosts, bats, and fog effects
2. WHEN user navigates to demo page THEN the Haunted Helpdesk System SHALL display Crypt Control Center with agent visualization
3. WHEN user submits ticket through form THEN the Haunted Helpdesk System SHALL display ticket submission interface with severity and realm selection
4. WHEN workflow processes ticket THEN the Haunted Helpdesk System SHALL visualize active agent in pentagram circle layout
5. WHEN agents perform handoffs THEN the Haunted Helpdesk System SHALL update séance log with timestamped entries
6. WHEN user views ticket list THEN the Haunted Helpdesk System SHALL display tickets as tombstones with status indicators

### Requirement 10

**User Story:** As a system architect, I want each agent represented as a unique supernatural character, so that the multi-agent system is visually intuitive and memorable.

#### Acceptance Criteria

1. WHEN Orchestrator Agent is active THEN the Haunted Helpdesk System SHALL display Ghost character with ethereal glow and conductor's baton
2. WHEN Memory Agent is active THEN the Haunted Helpdesk System SHALL display Skeleton character with glowing memory orbs and scroll
3. WHEN Ticketing Agent is active THEN the Haunted Helpdesk System SHALL display Vampire character with cape and golden ticket
4. WHEN Network Diagnostic Agent is active THEN the Haunted Helpdesk System SHALL display Witch character with network crystal ball
5. WHEN Cloud Service Agent is active THEN the Haunted Helpdesk System SHALL display Grim Reaper character with cloud-shaped scythe
6. WHEN Summarization Agent is active THEN the Haunted Helpdesk System SHALL display Mummy character wrapped in scrolls with TL;DR text

### Requirement 11

**User Story:** As a developer, I want the system to handle AWS credential expiration gracefully, so that users are prompted to refresh credentials rather than encountering cryptic errors.

#### Acceptance Criteria

1. WHEN Cloud Service Agent encounters ExpiredToken error THEN the Haunted Helpdesk System SHALL prompt user to refresh AWS credentials
2. WHEN user confirms credential refresh THEN the Haunted Helpdesk System SHALL retry the cloud operation
3. WHEN AWS operations fail THEN the Haunted Helpdesk System SHALL return descriptive error messages without exposing sensitive details
4. WHEN DynamoDB operations fail THEN the Haunted Helpdesk System SHALL handle errors gracefully and return appropriate status codes
5. WHEN Bedrock API is unavailable THEN the Haunted Helpdesk System SHALL return service unavailable message

### Requirement 12

**User Story:** As a quality assurance engineer, I want comprehensive test coverage including property-based tests, so that the system's correctness can be verified across diverse inputs.

#### Acceptance Criteria

1. WHEN testing agent handoff logic THEN the Haunted Helpdesk System SHALL verify correct routing for all ticket types
2. WHEN testing memory retrieval THEN the Haunted Helpdesk System SHALL verify keyword matching returns correct resolutions
3. WHEN testing ticket serialization THEN the Haunted Helpdesk System SHALL verify round-trip consistency between creation and retrieval
4. WHEN testing workflow termination THEN the Haunted Helpdesk System SHALL verify no agent restarts workflow after Ticketing Agent terminates
5. WHEN testing multimodal input THEN the Haunted Helpdesk System SHALL verify combined text and image analysis produces unified content
