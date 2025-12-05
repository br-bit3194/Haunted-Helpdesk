# Design Document

## Overview

Haunted Helpdesk is a sophisticated multi-agent IT operations platform that automates incident resolution through intelligent agent collaboration. The system architecture consists of three primary layers:

1. **Frontend Layer**: Next.js 16 application with React 19, featuring a Halloween-themed UI with supernatural agent representations
2. **Backend Layer**: FastAPI application orchestrating the Strands multi-agent framework with AWS Bedrock integration
3. **Data Layer**: AWS DynamoDB for ticket persistence and JSON file storage for resolution memory

The core innovation is the swarm-based workflow where six specialized agents collaborate through structured handoffs, with persistent memory enabling instant resolution of previously encountered issues.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Landing Page │  │ Demo/Control │  │ Agent Visual │      │
│  │ (Haunted)    │  │ Center       │  │ Components   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/REST
┌─────────────────────────────┴───────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Endpoints Layer                      │   │
│  │  /health  /api/tickets  /api/process-ticket          │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────┴─────────────────────────────────┐   │
│  │         Haunted Helpdesk Swarm (Strands Framework)            │   │
│  │                                                       │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐      │   │
│  │  │Orchestr. │───▶│  Memory  │───▶│Ticketing │      │   │
│  │  │  Agent   │    │  Agent   │    │  Agent   │      │   │
│  │  └──────────┘    └──────────┘    └──────────┘      │   │
│  │       │               │                │            │   │
│  │       ▼               ▼                ▼            │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐     │   │
│  │  │ Network  │    │  Cloud   │    │Summariz. │     │   │
│  │  │Diagnostic│    │ Service  │    │  Agent   │     │   │
│  │  └──────────┘    └──────────┘    └──────────┘     │   │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                            │
┌───────▼────────┐                        ┌─────────▼────────┐
│  AWS Bedrock   │                        │   Data Layer     │
│ Claude 3.5     │                        │ ┌──────────────┐ │
│ Sonnet         │                        │ │  DynamoDB    │ │
└────────────────┘                        │ │ (Tickets)    │ │
                                          │ └──────────────┘ │
                                          │ ┌──────────────┐ │
                                          │ │ JSON Memory  │ │
                                          │ │ (Resolutions)│ │
                                          │ └──────────────┘ │
                                          └──────────────────┘
```

### Workflow Sequence

The system follows a strict workflow sequence to ensure consistent processing:

```
1. User submits ticket → FastAPI endpoint
2. Multimodal processing (text + images)
3. Ticket stored in DynamoDB
4. Orchestrator Agent receives ticket
5. Memory Agent checks for similar past issues
   ├─ If MEMORY_FOUND:
   │  ├─ Summarization Agent creates summary
   │  └─ Ticketing Agent updates & TERMINATES
   └─ If NO_MEMORY_FOUND:
      ├─ Ticketing Agent analyzes & structures
      ├─ Orchestrator routes to worker (Network/Cloud)
      ├─ Worker agent provides resolution
      ├─ Memory Agent stores new resolution
      ├─ Summarization Agent creates summary
      └─ Ticketing Agent updates & TERMINATES
```

### Technology Stack

**Backend:**
- Python 3.9+
- FastAPI 0.68.0
- Strands multi-agent framework (>=0.1.0)
- Boto3 for AWS services
- Uvicorn ASGI server

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Radix UI components
- Framer Motion for animations
- Axios for HTTP requests

**AI/ML:**
- AWS Bedrock (Claude 3.5 Sonnet: us.anthropic.claude-3-5-sonnet-20241022-v2:0)
- Strands image_reader tool for multimodal analysis

**Data Storage:**
- AWS DynamoDB (Haunted HelpdeskTickets table)
- JSON file storage (memories/Haunted Helpdesk_memories.json)

## Components and Interfaces

### Backend Components

#### 1. FastAPI Application (`backend/main.py`)

**Responsibilities:**
- Expose REST API endpoints
- Handle CORS for frontend communication
- Manage file uploads and multipart form data
- Coordinate between API layer and agent swarm
- Serialize swarm results to JSON

**Key Endpoints:**

```python
GET  /health                      # Health check with AWS status
POST /api/tickets                 # Create new ticket
GET  /api/tickets                 # List all tickets
GET  /api/tickets/{ticket_id}     # Get specific ticket
POST /api/process-ticket/{ticket_id}  # Process ticket through workflow
POST /api/submit-ticket           # Submit with form data + files
```

**Interface:**

```python
class TicketCreate(BaseModel):
    title: str
    description: str
    severity: str  # low, medium, high, critical
    category: str  # network, cloud, other

class TicketResponse(BaseModel):
    ticket_id: str
    title: str
    description: str
    severity: str
    category: str
    status: str  # pending, processing, resolved
    created_at: str
    updated_at: str
    resolution: Optional[str]
```

#### 2. Haunted Helpdesk Swarm (`backend/Haunted Helpdesk_swarm.py`)

**Responsibilities:**
- Initialize all six agents
- Configure swarm parameters (max handoffs, timeouts)
- Manage agent lifecycle
- Detect repetitive handoffs

**Configuration:**

```python
swarm = Swarm(
    agents=[orchestrator, memory, ticketing, network_diagnostic, 
            cloud_service, summarization],
    max_handoffs=20,
    max_iterations=25,
    execution_timeout=600.0,
    node_timeout=120.0,
    repetitive_handoff_detection_window=4,
    repetitive_handoff_min_unique_agents=2
)
```

#### 3. Agent Implementations

##### Orchestrator Agent (`agents/orchestrator_agent.py`)

**Responsibilities:**
- Route tickets through workflow
- Enforce workflow sequence
- Detect workflow completion signals
- Prevent workflow restarts

**System Prompt Key Rules:**
- ALWAYS start by handing to memory_agent
- If "MEMORY_FOUND": summarization_agent → ticketing_agent
- If "NO_MEMORY_FOUND": ticketing_agent → worker agent → memory_agent (with "STORE" request) → summarization_agent → ticketing_agent
- Never restart after ticketing_agent terminates

**Model Configuration:**
- Temperature: 0.3 (balanced creativity and consistency)

##### Memory Agent (`agents/memory_agent.py`)

**Responsibilities:**
- Store resolutions in JSON file
- Retrieve resolutions using keyword matching
- Maintain memory file integrity
- Return standardized response formats

**Tools:**

```python
@tool
def retrieve_memory(query: str) -> str:
    """Search memory store for matching resolut
ions"""
    # Load memories from JSON
    # Perform keyword matching
    # Return "MEMORY_FOUND: [resolution]" or "NO_MEMORY_FOUND"

@tool
def store_memory(query: str, resolution: str) -> str:
    """Store new resolution in memory"""
    # Create memory entry with id, query, resolution, timestamp
    # Append to JSON file
    # Return confirmation

@tool
def list_memories() -> str:
    """List all stored memories"""
    # Load and return all memory entries
```

**Response Format:**
- Found: `"MEMORY_FOUND: [resolution text]"`
- Not found: `"NO_MEMORY_FOUND"`

##### Ticketing Agent (`agents/ticketing_agent.py`)

**Responsibilities:**
- Handle three distinct scenarios
- Structure and analyze tickets
- Update ticket status in DynamoDB
- Terminate workflow appropriately

**Scenarios:**

1. **Cached Resolution**: Receive "MEMORY_FOUND" → mark RESOLVED → TERMINATE
2. **New Ticket**: Receive raw ticket → analyze/structure → hand to orchestrator
3. **Final Update**: Receive resolution → update DynamoDB → TERMINATE

**Model Configuration:**
- Temperature: 0.4 (structured analysis)

##### Network Diagnostic Agent (`agents/network_diagnostic_agent.py`)

**Responsibilities:**
- Perform network diagnostics
- Analyze connectivity issues
- Provide root cause analysis
- Format results for summarization

**Tools:**

```python
@tool
def ping_host(hostname: str, count: int = 4) -> str:
    """Test network connectivity using ping"""
    # Execute ping command
    # Return results with return code

@tool
def traceroute_host(hostname: str) -> str:
    """Trace network route to host"""
    # Execute traceroute command
    # Return hop-by-hop results

@tool
def check_dns_resolution(hostname: str) -> str:
    """Check DNS resolution"""
    # Execute nslookup command
    # Return DNS records
```

**Model Configuration:**
- Temperature: 0.3 (technical accuracy)

##### Cloud Service Agent (`agents/cloud_service_agent.py`)

**Responsibilities:**
- Diagnose AWS/cloud issues
- Execute S3 operations
- Provide resolution steps
- Handle AWS credential errors

**Tools:**

```python
@tool
def list_all_buckets() -> dict:
    """List all S3 buckets"""
    # Use boto3 to list buckets
    # Return {'success': bool, 'buckets': list, 'count': int}

@tool
def get_bucket_location(bucket_name: str) -> dict:
    """Get bucket region"""
    # Use boto3 to get location
    # Return {'success': bool, 'bucket': str, 'region': str}

@tool
def check_bucket_exists(bucket_name: str) -> dict:
    """Check if bucket exists and is accessible"""
    # Use boto3 head_bucket
    # Handle 404 (not found) and 403 (access denied)
    # Return {'success': bool, 'exists': bool, 'accessible': bool}
```

**Error Handling:**
- Detect ExpiredToken errors
- Prompt user to refresh credentials
- Return descriptive error messages

**Model Configuration:**
- Temperature: 0.3 (technical accuracy)

##### Summarization Agent (`agents/summarization_agent.py`)

**Responsibilities:**
- Create concise 2-3 paragraph summaries
- Extract key information
- Signal workflow completion
- Ensure deterministic output

**Summary Structure:**
- Original issue description
- Steps taken during diagnosis
- Final resolution
- Technical details

**Completion Signal:**
- MUST end with: `"WORKFLOW_COMPLETE: Summary created successfully. Please update the ticket with this summary."`

**Model Configuration:**
- Temperature: 0.2 (deterministic summaries)

#### 4. DynamoDB Manager (`backend/dynamodb_utils.py`)

**Responsibilities:**
- CRUD operations for tickets
- Handle DynamoDB serialization
- Manage table connections
- Error handling for AWS operations

**Interface:**

```python
class DynamoDBManager:
    def create_ticket(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]
    def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]
    def list_tickets(self) -> List[Dict[str, Any]]
    def update_ticket(self, ticket_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]
```

#### 5. Multimodal Input Processor (`backend/multimodal_input.py`)

**Responsibilities:**
- Process combined text and image inputs
- Analyze error screenshots
- Extract structured error information
- Combine analyses into unified ticket

**Image Analysis Agent:**
- Uses Strands image_reader tool
- Extracts: problem description, error details, affected system, severity, technical context
- Temperature: 0.1 (precise extraction)

**Output Format:**

```
**Text Description:**
[user provided text]

**Image Analysis 1:**
- **Problem Description**: [summary]
- **Error Details**: [exact errors]
- **Affected System/Service**: [system]
- **Severity Assessment**: [level]
- **Technical Context**: [details]
- **Recommended Actions**: [suggestions]
```

### Frontend Components

#### 1. Landing Page (`src/app/page.tsx`)

**Responsibilities:**
- Display haunted mansion entrance
- Showcase supernatural powers
- Introduce agent coven
- Provide navigation to demo

**Visual Effects:**
- Floating ghosts (5 instances)
- Flying bats (8 instances)
- Spider webs (top corners)
- Fog overlay
- Blood moon background

**Sections:**
- Hero with animated title
- Feature cards (AI Possession, Spectral Swarm, Eternal Memory)
- Agent showcase with character descriptions

#### 2. Demo/Control Center (`src/app/demo/page.tsx`)

**Responsibilities:**
- Ticket submission form
- Agent workflow visualization
- Real-time séance log
- Ticket graveyard (list view)

**Ticket Form Fields:**
- Curse Title (text input)
- Dark Details (textarea)
- Severity (select: Minor Haunting, Poltergeist, Full Possession, Apocalyptic)
- Realm (select: Network, Cloud, Other)
- File upload (drag & drop)

**Agent Visualization:**
- Pentagram circle layout
- Six agent positions
- Active agent highlighting
- Center processing indicator

**Séance Log:**
- Timestamped entries
- Agent icons
- Scrollable history

**Ticket Graveyard:**
- Tombstone cards
- Status indicators (pending, processing, resolved)
- Severity icons
- Hover actions

#### 3. Agent Character Components

Each agent has a unique SVG-based character:

- **Ghost Orchestrator**: Ethereal body, glowing green eyes, conductor's baton, float animation
- **Skeleton Memory**: Skull with memory orbs, scroll, rattle animation
- **Vampire Ticketing**: Cape, fangs, golden ticket, bite animation
- **Witch Network**: Pointed hat, crystal ball with network nodes, cackle animation
- **Grim Reaper Cloud**: Hooded robe, cloud-shaped scythe, AWS logo, hover-menace animation
- **Mummy Summarization**: Bandage wrapping, glowing eyes, TL;DR scroll, unwrap animation

#### 4. Atmospheric Effects

**FloatingGhosts**: Animated ghosts floating upward across screen
**Bats**: Random flight patterns in upper portion
**SpiderWeb**: Corner decorations with spider
**Fog**: Bottom gradient overlay
**CandleFlicker**: Animated candle with glow effect

#### 5. API Client (`src/lib/api-client.ts`)

**Responsibilities:**
- HTTP request handling
- Error message translation (spooky themed)
- Type-safe API calls

**Error Messages:**
- Network: "The spirits are restless... network connection failed 👻"
- Timeout: "The séance timed out... the spirits have gone silent ⏰"
- Server: "Something wicked happened on the server side 🎃"
- Unknown: "An unknown curse has befallen us... ☠️"

## Data Models

### Ticket Model

```python
{
    "ticket_id": str,           # UUID format
    "title": str,               # Brief description
    "description": str,         # Full details (may include image analysis)
    "severity": str,            # low, medium, high, critical
    "category": str,            # network, cloud, other
    "status": str,              # pending, processing, resolved
    "created_at": str,          # ISO 8601 timestamp
    "updated_at": str,          # ISO 8601 timestamp
    "resolution": Optional[str], # Summary of resolution
    "workflow_log": List[str]   # Agent handoff history
}
```

### Memory Entry Model

```python
{
    "id": str,                  # UUID format
    "query": str,               # Original issue description
    "resolution": str,          # Solution text
    "timestamp": str,           # ISO 8601 timestamp
    "keywords": List[str]       # Extracted keywords for matching
}
```

### Agent Message Model

```python
{
    "role": str,                # "user" or "assistant"
    "content": str,             # Message content
    "agent_name": str,          # Source agent identifier
    "timestamp": str,           # ISO 8601 timestamp
    "handoff_target": Optional[str]  # Next agent if handoff
}
```

### Swarm Result Model

```python
{
    "final_response": str,      # Last agent's response
    "conversation_history": List[dict],  # All messages
    "handoff_sequence": List[str],       # Agent names in order
    "execution_time": float,    # Seconds
    "terminated_by": str,       # Agent that terminated
    "status": str               # success, error, timeout
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Ticket creation produces unique identifiers

*For any* valid ticket submission with text description, the system should create a structured ticket with a unique identifier that differs from all previously created ticket identifiers.
**Validates: Requirements 1.1**

### Property 2: Image analysis produces structured output

*For any* uploaded error screenshot, the multimodal analysis should produce output containing all required fields: problem description, error details, affected system, severity assessment, technical context, and recommended actions.
**Validates: Requirements 1.2**

### Property 3: Ticket persistence round-trip

*For any* created ticket, retrieving it from DynamoDB immediately after creation should return a ticket with identical content (ticket_id, title, description, severity, category).
**Validates: Requirements 1.3**

### Property 4: Multimodal content combination

*For any* ticket submission with both text description and image analysis, the unified ticket content should contain both the original text and the extracted image analysis information.
**Validates: Requirements 1.4**

### Property 5: Empty ticket rejection

*For any* ticket submission where the description is empty or contains only whitespace characters, the system should reject the submission and return a validation error.
**Validates: Requirements 1.5**

### Property 6: First handoff to Memory Agent

*For any* new ticket received by the Orchestrator Agent, the first handoff in the workflow should always be to the Memory Agent with the complete ticket content.
**Validates: Requirements 2.1**

### Property 7: MEMORY_FOUND routing sequence

*For any* workflow where Memory Agent returns "MEMORY_FOUND", the handoff sequence should be: Memory Agent → Summarization Agent → Ticketing Agent (no other agents in between).
**Validates: Requirements 2.2**

### Property 8: NO_MEMORY_FOUND routing

*For any* workflow where Memory Agent returns "NO_MEMORY_FOUND", the next handoff after Memory Agent should be to the Ticketing Agent.
**Validates: Requirements 2.3**

### Property 9: Worker agent routing by ticket type

*For any* ticket analyzed by Ticketing Agent, if the ticket type is "network" then the next worker agent should be Network Diagnostic Agent, and if the type is "cloud" then the next worker agent should be Cloud Service Agent.
**Validates: Requirements 2.4**

### Property 10: Memory storage request format

*For any* workflow where a worker agent provides a new resolution, the handoff to Memory Agent should include the keyword "STORE" in the message content.
**Validates: Requirements 2.5**

### Property 11: WORKFLOW_COMPLETE triggers final handoff

*For any* workflow where Summarization Agent returns a message containing "WORKFLOW_COMPLETE", the next handoff should be to the Ticketing Agent.
**Validates: Requirements 2.6**

### Property 12: No workflow restart after termination

*For any* workflow where Ticketing Agent terminates, the total number of handoffs should not increase after the termination event.
**Validates: Requirements 2.7**

### Property 13: Memory search execution

*For any* query string provided to Memory Agent, the agent should execute a search operation and return either a "MEMORY_FOUND" or "NO_MEMORY_FOUND" response.
**Validates: Requirements 3.1**

### Property 14: MEMORY_FOUND response format

*For any* Memory Agent response where a matching resolution exists, the response string should start with the prefix "MEMORY_FOUND:" followed by resolution text.
**Validates: Requirements 3.2**

### Property 15: NO_MEMORY_FOUND response format

*For any* Memory Agent response where no matching resolution exists, the response should be exactly the string "NO_MEMORY_FOUND".
**Validates: Requirements 3.3**

### Property 16: Memory storage round-trip

*For any* resolution stored by Memory Agent with a query and resolution text, retrieving memories immediately after storage should return an entry containing the same query, resolution text, and a valid timestamp.
**Validates: Requirements 3.4**

### Property 17: Memory file persistence

*For any* resolution stored by Memory Agent, the memories/Haunted Helpdesk_memories.json file should contain an entry with the stored resolution after the storage operation completes.
**Validates: Requirements 3.5**

### Property 18: Memory Agent always returns to Orchestrator

*For any* Memory Agent operation (retrieve, store, or list), the next agent in the handoff sequence should be the Orchestrator Agent.
**Validates: Requirements 3.6**

### Property 19: Cached resolution workflow termination

*For any* Ticketing Agent invocation with input containing "MEMORY_FOUND", the ticket status should be set to "RESOLVED" and the workflow should terminate (no subsequent handoffs).
**Validates: Requirements 4.1**

### Property 20: Raw ticket analysis output

*For any* Ticketing Agent invocation with raw ticket and "NO_MEMORY_FOUND", the output should include identified ticket type, priority level, and a handoff to the Orchestrator Agent.
**Validates: Requirements 4.2**

### Property 21: Final resolution persistence

*For any* Ticketing Agent invocation with final resolution, the ticket in DynamoDB should be updated to status "RESOLVED" and the workflow should terminate.
**Validates: Requirements 4.3**

### Property 22: Resolution summary completeness

*For any* Ticketing Agent status update operation, the ticket's resolution field should be non-empty and contain summary text.
**Validates: Requirements 4.4**

### Property 23: Ticketing Agent termination finality

*For any* workflow where Ticketing Agent performs a termination, no additional handoffs should occur after that termination point.
**Validates: Requirements 4.5**

### Property 24: Network diagnostic tool execution

*For any* network-related ticket processed by Network Diagnostic Agent, at least one of the following tools should be called: ping_host, traceroute_host, or check_dns_resolution.
**Validates: Requirements 5.1, 5.2**

### Property 25: Network diagnostic output references tools

*For any* Network Diagnostic Agent analysis output, the root cause analysis text should reference or include results from the diagnostic tools that were executed.
**Validates: Requirements 5.3**

### Property 26: Network diagnostic structured output

*For any* Network Diagnostic Agent output, the formatted results should be parseable and contain diagnostic results and analysis sections.
**Validates: Requirements 5.4**

### Property 27: Network Agent hands to Summarization

*For any* Network Diagnostic Agent completion, the next agent in the handoff sequence should be the Summarization Agent.
**Validates: Requirements 5.5**

### Property 28: Cloud diagnostic tool execution

*For any* AWS-related ticket processed by Cloud Service Agent, at least one of the following tools should be called: list_all_buckets, get_bucket_location, or check_bucket_exists.
**Validates: Requirements 6.1, 6.2**

### Property 29: Cloud resolution contains steps

*For any* Cloud Service Agent resolution output, the text should contain actionable resolution steps (identifiable by imperative verbs or numbered steps).
**Validates: Requirements 6.3**

### Property 30: Cloud resolution completeness

*For any* Cloud Service Agent resolution, the output should contain what was checked, what was found, and what action to take.
**Validates: Requirements 6.4**

### Property 31: Cloud Agent hands to Orchestrator

*For any* Cloud Service Agent completion, the next agent in the handoff sequence should be the Orchestrator Agent and the message should contain resolution text.
**Validates: Requirements 6.5**

### Property 32: Summary paragraph count

*For any* Summarization Agent output, counting paragraph breaks should yield between 2 and 3 paragraphs (inclusive).
**Validates: Requirements 7.1**

### Property 33: Summary contains required elements

*For any* Summarization Agent output, the summary text should contain all four required elements: original issue description, steps taken, final resolution, and technical details.
**Validates: Requirements 7.2**

### Property 34: Summary completion marker

*For any* Summarization Agent output, the response string should end with the exact text "WORKFLOW_COMPLETE: Summary created successfully. Please update the ticket with this summary."
**Validates: Requirements 7.3**

### Property 35: Summarization Agent hands to Orchestrator

*For any* Summarization Agent completion, the next agent in the handoff sequence should be the Orchestrator Agent.
**Validates: Requirements 7.5**

### Property 36: Ticket creation returns identifier

*For any* valid ticket data posted to /api/tickets, the response should contain a ticket_id field with a non-empty string value.
**Validates: Requirements 8.2**

### Property 37: Ticket list returns array

*For any* GET request to /api/tickets, the response should be a JSON array (possibly empty) where each element is a ticket object.
**Validates: Requirements 8.3**

### Property 38: Ticket retrieval by ID

*For any* existing ticket_id, a GET request to /api/tickets/{ticket_id} should return that ticket's data; for any non-existent ticket_id, the response should be an error status (404).
**Validates: Requirements 8.4**

### Property 39: Ticket processing initiates workflow

*For any* valid ticket_id, a POST request to /api/process-ticket/{ticket_id} should initiate workflow processing and return a result object containing workflow information.
**Validates: Requirements 8.5**

### Property 40: Multipart form processing

*For any* POST request to /api/submit-ticket with multipart form data containing both text fields and file attachments, the created ticket should include content from both sources.
**Validates: Requirements 8.6**

### Property 41: Active agent visualization

*For any* agent marked as active in the workflow state, the UI should apply the active styling/animation to that agent's character component.
**Validates: Requirements 9.4**

### Property 42: Handoff log entries

*For any* agent handoff event in the workflow, a new entry should appear in the séance log containing the agent identifier and a timestamp.
**Validates: Requirements 9.5**

### Property 43: Ticket status indicators

*For any* ticket displayed in the ticket list, the ticket card should include a visual status indicator showing whether the ticket is pending, processing, or resolved.
**Validates: Requirements 9.6**

### Property 44: ExpiredToken error messaging

*For any* AWS operation that fails with an ExpiredToken error, the error message returned to the user should mention credential refresh or credential expiration.
**Validates: Requirements 11.1**

### Property 45: AWS error message safety

*For any* AWS operation error, the error message should not contain AWS access keys, secret keys, or session tokens (sensitive credential information).
**Validates: Requirements 11.3**

### Property 46: DynamoDB error status codes

*For any* DynamoDB operation that fails, the HTTP response status code should be in the error range (400-599), not a success code (200-299).
**Validates: Requirements 11.4**

## Error Handling

### Backend Error Handling

**AWS Service Errors:**
- **ExpiredToken**: Detect and return user-friendly message prompting credential refresh
- **AccessDenied**: Return permission error without exposing IAM details
- **ServiceUnavailable**: Return retry-able error with backoff suggestion
- **ThrottlingException**: Implement exponential backoff and retry logic

**DynamoDB Errors:**
- **ResourceNotFoundException**: Return 404 with clear message
- **ProvisionedThroughputExceededException**: Return 429 with retry-after header
- **ValidationException**: Return 400 with field-specific error details
- **ConditionalCheckFailedException**: Return 409 conflict status

**Bedrock Errors:**
- **ModelNotFound**: Return 503 with model configuration error
- **ThrottlingException**: Implement retry with exponential backoff
- **ValidationException**: Return 400 with prompt validation details
- **ServiceQuotaExceededException**: Return 429 with quota information

**Agent Workflow Errors:**
- **MaxHandoffsExceeded**: Terminate workflow and return partial results with error
- **NodeTimeout**: Log timeout, return partial results, mark ticket as needs-review
- **RepetitiveHandoffDetected**: Break loop, return error, log for debugging
- **TerminationFailure**: Force terminate, log error, return best-effort results

**File Upload Errors:**
- **FileTooLarge**: Return 413 with size limit information
- **UnsupportedFileType**: Return 415 with supported types list
- **CorruptedFile**: Return 400 with file validation error
- **StorageFailure**: Return 500 with retry suggestion

### Frontend Error Handling

**Network Errors:**
- Display spooky-themed error message
- Provide retry button
- Log error details to console
- Show connection status indicator

**API Errors:**
- Parse error response and display user-friendly message
- Highlight form fields with validation errors
- Provide contextual help text
- Enable error recovery actions

**State Management Errors:**
- Graceful degradation of UI features
- Fallback to cached data when available
- Clear error boundaries to prevent full app crash
- Automatic state recovery attempts

**Rendering Errors:**
- Error boundaries around complex components
- Fallback UI for failed components
- Console logging for debugging
- User notification of degraded functionality

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Agent system prompt validation
- Tool function execution (ping, traceroute, DNS, S3 operations)
- DynamoDB CRUD operations
- Multimodal input processing
- Memory storage and retrieval functions
- API endpoint request/response handling
- Error handling for each error type

**Frontend Unit Tests:**
- Component rendering (agent characters, effects)
- Form validation logic
- API client request formatting
- Error message transformation
- State management reducers
- Utility functions

### Property-Based Testing

**Framework**: Use `hypothesis` for Python backend testing and `fast-check` for TypeScript frontend testing.

**Configuration**: Each property-based test should run a minimum of 100 iterations to ensure adequate coverage of the input space.

**Test Tagging**: Each property-based test must include a comment tag in this exact format:
```python
# Feature: Haunted Helpdesk-ai-ops, Property X: [property description]
```

**Backend Property Tests:**

1. **Property 1 Test**: Generate random ticket descriptions, verify unique IDs
   - Generator: Random strings (10-500 chars), various characters
   - Assertion: All generated ticket IDs are unique

2. **Property 3 Test**: Create tickets with random data, retrieve and compare
   - Generator: Random ticket objects with valid fields
   - Assertion: Retrieved ticket matches created ticket

3. **Property 5 Test**: Generate empty/whitespace strings, verify rejection
   - Generator: Empty strings, whitespace-only strings, various whitespace chars
   - Assertion: All rejected with validation error

4. **Property 6 Test**: Generate random tickets, verify first handoff
   - Generator: Random ticket objects
   - Assertion: First handoff target is "memory_agent"

5. **Property 16 Test**: Store random resolutions, retrieve and verify
   - Generator: Random query/resolution pairs
   - Assertion: Retrieved memory contains same query and resolution

6. **Property 36 Test**: Post random valid ticket data, verify ID in response
   - Generator: Random valid ticket objects
   - Assertion: Response contains non-empty ticket_id

**Frontend Property Tests:**

1. **Property 41 Test**: Set random agents as active, verify styling applied
   - Generator: Random agent names from valid set
   - Assertion: Active class/animation applied to correct component

2. **Property 42 Test**: Generate random handoff events, verify log entries
   - Generator: Random agent names and timestamps
   - Assertion: Log contains entry for each handoff

3. **Property 43 Test**: Generate random ticket statuses, verify indicators
   - Generator: Random tickets with various statuses
   - Assertion: Each ticket card has correct status indicator

### Integration Testing

**Workflow Integration Tests:**
- End-to-end ticket submission through resolution
- Memory cache hit scenario (submit duplicate ticket)
- Memory cache miss scenario (submit new ticket)
- Network diagnostic workflow
- Cloud service diagnostic workflow
- Error recovery workflows

**API Integration Tests:**
- Full CRUD operations on tickets
- Multipart form submission with files
- Concurrent ticket processing
- Health check with AWS services
- CORS header validation

**Database Integration Tests:**
- DynamoDB connection and operations
- Memory file read/write operations
- Concurrent access handling
- Data consistency verification

### End-to-End Testing

**User Scenarios:**
1. New user submits network issue → system resolves → memory stores
2. User submits same network issue → instant resolution from memory
3. User submits S3 bucket issue → cloud agent diagnoses → resolution provided
4. User uploads error screenshot → image analyzed → combined with text
5. AWS credentials expire → user prompted → credentials refreshed → retry succeeds

**UI/UX Testing:**
- Landing page loads with all effects
- Demo page displays all agent characters
- Ticket submission form validation
- Real-time workflow visualization
- Séance log updates during processing
- Ticket graveyard displays and updates

### Performance Testing

**Load Testing:**
- Concurrent ticket submissions (10, 50, 100 users)
- Memory retrieval performance with large memory files (100, 1000, 10000 entries)
- DynamoDB query performance
- Agent workflow execution time

**Stress Testing:**
- Maximum handoffs before timeout
- Large file uploads
- Long-running diagnostic operations
- Memory file size limits

### Security Testing

**Input Validation:**
- SQL injection attempts (though using DynamoDB)
- XSS attempts in ticket descriptions
- Path traversal in file uploads
- Oversized payloads

**Authentication/Authorization:**
- AWS credential validation
- API endpoint access control
- CORS policy enforcement

**Data Protection:**
- Sensitive data not logged
- AWS credentials not exposed in errors
- Ticket data isolation

## Deployment Considerations

### AWS Infrastructure

**Required AWS Services:**
- AWS Bedrock (Claude 3.5 Sonnet access)
- DynamoDB (Haunted HelpdeskTickets table)
- IAM roles and policies
- (Optional) S3 for file storage
- (Optional) CloudWatch for logging

**IAM Permissions Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/us.anthropic.claude-3-5-sonnet-20241022-v2:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Haunted HelpdeskTickets"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation",
        "s3:HeadBucket"
      ],
      "Resource": "*"
    }
  ]
}
```

### Environment Configuration

**Backend Environment Variables:**
```bash
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
DYNAMODB_TABLE_NAME=Haunted HelpdeskTickets
MEMORY_FILE_PATH=memories/Haunted Helpdesk_memories.json
UPLOAD_DIR=uploads/
MAX_FILE_SIZE_MB=10
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

**Frontend Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```

### Deployment Steps

1. **AWS Setup:**
   - Request Bedrock model access
   - Create DynamoDB table with partition key `ticket_id`
   - Configure IAM roles and policies
   - Set up AWS credentials

2. **Backend Deployment:**
   - Install Python dependencies
   - Create memories directory
   - Create uploads directory
   - Configure environment variables
   - Start Uvicorn server

3. **Frontend Deployment:**
   - Install Node.js dependencies
   - Configure API URL
   - Build Next.js application
   - Start Next.js server or deploy to Vercel

4. **Verification:**
   - Test /health endpoint
   - Submit test ticket
   - Verify DynamoDB storage
   - Test memory persistence
   - Validate workflow execution

### Monitoring and Logging

**Backend Logging:**
- Agent handoff events
- Tool execution results
- AWS API calls and responses
- Error occurrences with stack traces
- Workflow execution times

**Frontend Logging:**
- API request/response cycles
- User interactions
- Error boundaries triggered
- Performance metrics

**Metrics to Track:**
- Ticket resolution time
- Memory cache hit rate
- Agent handoff counts
- API response times
- Error rates by type
- Workflow success rate

### Scalability Considerations

**Backend Scaling:**
- Horizontal scaling with multiple FastAPI instances
- Load balancer for request distribution
- DynamoDB on-demand billing for automatic scaling
- Memory file sharding for large datasets

**Frontend Scaling:**
- CDN for static assets
- Server-side rendering for initial load
- Client-side caching
- Lazy loading of components

**Cost Optimization:**
- DynamoDB on-demand vs provisioned capacity analysis
- Bedrock token usage monitoring
- S3 lifecycle policies for old uploads
- CloudWatch log retention policies
