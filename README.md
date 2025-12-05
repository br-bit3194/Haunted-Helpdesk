# 🎃 Haunted Helpdesk - Multi-Agent IT Operations Platform

**Where IT Nightmares Come to Die**

Haunted Helpdesk is an AI-powered multi-agent IT operations platform that automates incident resolution using intelligent agent workflows with persistent memory capabilities. The system leverages AWS Bedrock (Claude 3.5 Sonnet), the Strands multi-agent framework, DynamoDB for ticket storage, and a Next.js frontend with a Halloween-themed interface.

## 🦇 Architecture Overview

Haunted Helpdesk uses a multi-agent architecture powered by the Strands framework and AWS Bedrock. The platform orchestrates six specialized agents that work together to resolve IT incidents through structured handoffs and persistent memory.

### Agent Coven

- **👻 Ghost Orchestrator**: Routes tickets through the workflow, enforces sequence rules, detects completion signals
- **💀 Skeleton Memory**: Stores and retrieves past resolutions using keyword matching, maintains JSON memory store
- **🧛 Vampire Ticketing**: Processes tickets in three scenarios (cached, new, final), updates DynamoDB, terminates workflow
- **🧙 Witch Network**: Performs network diagnostics using ping, traceroute, and DNS tools
- **☠️ Grim Reaper Cloud**: Handles AWS/cloud operations, diagnoses S3 buckets, manages credential errors
- **🧟 Mummy Summarization**: Creates concise 2-3 paragraph summaries with completion markers

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)                      │
│  • Halloween-themed UI with supernatural characters          │
│  • Real-time workflow visualization                          │
│  • Ticket submission with multimodal support                 │
│  • Séance log for agent handoff tracking                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (HTTP/JSON)
┌─────────────────────────┴───────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  • API endpoints for ticket CRUD and processing              │
│  • Multimodal input processing (text + images)               │
│  • File upload handling                                      │
│  • CORS middleware for frontend communication                │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│              Haunted Helpdesk Swarm (Strands Framework)               │
│  • Agent orchestration with handoff rules                    │
│  • Workflow execution with timeouts and limits               │
│  • Repetitive handoff detection                              │
│  • Conversation history tracking                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                    │
┌───────▼────────┐                ┌─────────▼────────┐
│  AWS Bedrock   │                │   Data Layer     │
│  Claude 3.5    │                │  • DynamoDB      │
│  Sonnet        │                │  • JSON Memory   │
│  (LLM)         │                │  • File Storage  │
└────────────────┘                └──────────────────┘
```

### Key Features

- **Persistent Memory**: Learns from past resolutions to provide instant fixes for recurring issues
- **Multimodal Analysis**: Processes error screenshots alongside text descriptions
- **Intelligent Routing**: Automatically routes tickets to appropriate specialist agents
- **Workflow Visualization**: Real-time display of agent handoffs and processing status
- **Graceful Error Handling**: Detects and handles AWS credential expiration, service errors, and timeouts
- **Halloween Theme**: Engaging supernatural interface makes IT operations fun

## 🚀 Quick Start

Get Haunted Helpdesk running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Haunted Helpdesk

# 2. Set up AWS credentials (ensure you have Bedrock access and DynamoDB table)
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-1

# 3. Start the backend
pip install -r requirements.txt
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your AWS credentials
uvicorn main:app --reload &
cd ..

# 4. Start the frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev &
cd ..

# 5. Open your browser
open http://localhost:3000
```

## 📋 Prerequisites

### Required Software
- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn package manager
- AWS Account with appropriate permissions

### AWS Services Required
- **AWS Bedrock**: Access to Claude 3.5 Sonnet model
- **AWS DynamoDB**: Table for ticket persistence
- **AWS IAM**: Appropriate permissions for Bedrock and DynamoDB

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

#### AWS Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | Yes | - |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | Yes | - |
| `AWS_SESSION_TOKEN` | Session token for temporary credentials | No | - |
| `AWS_DEFAULT_REGION` | AWS region for services | Yes | us-east-1 |

#### AWS Bedrock Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BEDROCK_MODEL_ID` | Claude 3.5 Sonnet model ID | Yes | us.anthropic.claude-3-5-sonnet-20241022-v2:0 |

#### DynamoDB Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DYNAMODB_TABLE_NAME` | Name of the tickets table | Yes | Haunted HelpdeskTickets |

#### API Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_HOST` | Host to bind the API server | No | 0.0.0.0 |
| `API_PORT` | Port for the API server | No | 8000 |
| `CORS_ORIGINS` | Comma-separated allowed origins | No | http://localhost:3000,http://localhost:8000 |

#### File Upload Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `UPLOAD_DIR` | Directory for uploaded files | No | backend/uploads |
| `MAX_UPLOAD_SIZE_MB` | Maximum upload size in MB | No | 10 |

#### Memory Storage Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MEMORY_DIR` | Directory for memory storage | No | backend/memories |
| `MEMORY_FILE` | Memory JSON file name | No | Haunted Helpdesk_memories.json |

#### Swarm Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MAX_HANDOFFS` | Maximum agent handoffs | No | 20 |
| `MAX_ITERATIONS` | Maximum workflow iterations | No | 25 |
| `EXECUTION_TIMEOUT` | Workflow timeout in seconds | No | 600.0 |
| `NODE_TIMEOUT` | Individual agent timeout | No | 120.0 |

### Frontend Environment Variables

Create a `frontend/.env.local` file based on `frontend/.env.local.example`:

```bash
cp frontend/.env.local.example frontend/.env.local
```

#### API Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes | http://localhost:8000 |

#### Application Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | No | Haunted Helpdesk |
| `NEXT_PUBLIC_APP_TAGLINE` | Application tagline | No | Where IT Nightmares Come to Die |

#### Feature Flags

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_ENABLE_ANIMATIONS` | Enable UI animations | No | true |
| `NEXT_PUBLIC_ENABLE_SOUND_EFFECTS` | Enable sound effects | No | false |
| `NEXT_PUBLIC_DEBUG_MODE` | Enable debug logging | No | false |

## 🚀 Setup Instructions

### 1. AWS Setup

#### Enable AWS Bedrock Access

1. Log in to AWS Console
2. Navigate to AWS Bedrock service
3. Request access to Claude 3.5 Sonnet model
4. Wait for approval (usually instant for most regions)

#### Create DynamoDB Table

```bash
aws dynamodb create-table \
    --table-name Haunted HelpdeskTickets \
    --attribute-definitions \
        AttributeName=ticket_id,AttributeType=S \
    --key-schema \
        AttributeName=ticket_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### Configure IAM Permissions

Your AWS credentials need the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Haunted HelpdeskTickets"
    }
  ]
}
```

### 2. Backend Setup

#### Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
cd backend
pip install -r requirements.txt
cd ..
```

#### Configure Environment

```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your AWS credentials
nano backend/.env  # or use your preferred editor
```

#### Run Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

#### Configure Environment

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local if needed (default should work)
nano .env.local  # or use your preferred editor
```

#### Run Development Server

```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### Health Check

**GET** `/health`

Returns health status of AWS services.

**Response Example:**
```json
{
  "status": "healthy",
  "services": {
    "bedrock": "available",
    "dynamodb": "available"
  },
  "timestamp": "2024-12-03T10:30:00Z"
}
```

### Ticket Management

#### Create Ticket

**POST** `/api/tickets`

Create a new ticket with text description.

**Request Body:**
```json
{
  "title": "S3 bucket not accessible",
  "description": "Cannot access my-app-bucket in us-west-2",
  "severity": "high",
  "category": "cloud"
}
```

**Response:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "S3 bucket not accessible",
  "description": "Cannot access my-app-bucket in us-west-2",
  "severity": "high",
  "category": "cloud",
  "status": "pending",
  "created_at": "2024-12-03T10:30:00Z",
  "updated_at": "2024-12-03T10:30:00Z",
  "resolution": null
}
```

#### List All Tickets

**GET** `/api/tickets`

Retrieve all tickets from the system.

**Response:**
```json
[
  {
    "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "S3 bucket not accessible",
    "status": "resolved",
    "severity": "high",
    "category": "cloud",
    "created_at": "2024-12-03T10:30:00Z"
  },
  {
    "ticket_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Cannot ping production server",
    "status": "processing",
    "severity": "critical",
    "category": "network",
    "created_at": "2024-12-03T11:00:00Z"
  }
]
```

#### Get Specific Ticket

**GET** `/api/tickets/{ticket_id}`

Retrieve details of a specific ticket.

**Response:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "S3 bucket not accessible",
  "description": "Cannot access my-app-bucket in us-west-2",
  "severity": "high",
  "category": "cloud",
  "status": "resolved",
  "created_at": "2024-12-03T10:30:00Z",
  "updated_at": "2024-12-03T10:35:00Z",
  "resolution": "The bucket exists in us-west-2 region. Access was denied due to missing IAM permissions. Added s3:GetObject permission to the user's role. Bucket is now accessible.",
  "workflow_log": [
    "orchestrator_agent",
    "memory_agent",
    "ticketing_agent",
    "orchestrator_agent",
    "cloud_service_agent",
    "orchestrator_agent",
    "memory_agent",
    "summarization_agent",
    "ticketing_agent"
  ]
}
```

### Workflow Processing

#### Process Existing Ticket

**POST** `/api/process-ticket/{ticket_id}`

Initiate workflow processing for an existing ticket.

**Response:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "workflow_result": {
    "final_response": "Ticket updated with resolution summary.",
    "handoff_sequence": [
      "orchestrator_agent",
      "memory_agent",
      "ticketing_agent",
      "orchestrator_agent",
      "cloud_service_agent",
      "orchestrator_agent",
      "memory_agent",
      "summarization_agent",
      "ticketing_agent"
    ],
    "execution_time": 45.3,
    "terminated_by": "ticketing_agent",
    "status": "success"
  }
}
```

#### Submit Ticket with Multipart Form Data

**POST** `/api/submit-ticket`

Submit a new ticket with text description and optional file attachments (screenshots, logs, etc.).

**Request (multipart/form-data):**
- `title` (string, required): Brief ticket title
- `description` (string, required): Detailed description
- `severity` (string, required): One of: `low`, `medium`, `high`, `critical`
- `category` (string, required): One of: `network`, `cloud`, `other`
- `files` (file[], optional): Error screenshots or log files

**Example using curl:**
```bash
curl -X POST http://localhost:8000/api/submit-ticket \
  -F "title=Database connection timeout" \
  -F "description=Application cannot connect to RDS instance" \
  -F "severity=high" \
  -F "category=cloud" \
  -F "files=@error_screenshot.png"
```

**Response:**
```json
{
  "ticket_id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "processing",
  "message": "Ticket submitted and processing initiated"
}
```

## 🔄 Agent Workflow Sequence

### Cached Resolution Path (Fast)
```
1. User submits ticket
2. Orchestrator → Memory Agent (search)
3. Memory Agent finds match → Summarization Agent
4. Summarization Agent → Ticketing Agent
5. Ticketing Agent marks RESOLVED → TERMINATE
```

### New Resolution Path (Full Diagnosis)
```
1. User submits ticket
2. Orchestrator → Memory Agent (search)
3. Memory Agent finds no match → Ticketing Agent
4. Ticketing Agent analyzes → Orchestrator
5. Orchestrator → Worker Agent (Network/Cloud)
6. Worker Agent diagnoses → Orchestrator
7. Orchestrator → Memory Agent (store)
8. Memory Agent stores → Summarization Agent
9. Summarization Agent → Ticketing Agent
10. Ticketing Agent updates → TERMINATE
```

## 🧪 Testing

### Backend Testing

#### Run All Tests
```bash
pytest
```

#### Run Specific Test Files
```bash
# Test memory agent functionality
pytest test_memory_agent.py

# Test multimodal input processing
pytest test_multimodal_input.py

# Test ticket submission
pytest test_submit_ticket.py
```

#### Run with Verbose Output
```bash
pytest -v
```

#### Run with Coverage Report
```bash
pytest --cov=agents --cov=backend --cov=tools
```

### Frontend Testing

#### Run All Tests
```bash
cd frontend
npm test
# or
yarn test
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Testing Scenarios

#### Scenario 1: Network Issue Resolution (New)

**Objective**: Test full workflow for a new network issue.

**Steps**:
1. Submit ticket via API:
   ```bash
   curl -X POST http://localhost:8000/api/submit-ticket \
     -F "title=Cannot ping production server" \
     -F "description=Server at 10.0.1.50 is not responding to ping" \
     -F "severity=high" \
     -F "category=network"
   ```
2. Observe workflow in UI (Demo page)
3. Verify agents activate in sequence: Orchestrator → Memory → Ticketing → Orchestrator → Network Diagnostic → Orchestrator → Memory → Summarization → Ticketing
4. Check ticket status changes to "resolved"
5. Verify resolution stored in `backend/memories/Haunted Helpdesk_memories.json`

**Expected Result**: Ticket resolved with network diagnostic results and resolution stored for future use.

#### Scenario 2: Cached Resolution (Memory Hit)

**Objective**: Test instant resolution using cached memory.

**Steps**:
1. Submit the same network issue again:
   ```bash
   curl -X POST http://localhost:8000/api/submit-ticket \
     -F "title=Cannot ping production server" \
     -F "description=Server at 10.0.1.50 is not responding to ping" \
     -F "severity=high" \
     -F "category=network"
   ```
2. Observe workflow in UI
3. Verify shorter agent sequence: Orchestrator → Memory → Summarization → Ticketing
4. Check ticket resolves much faster (< 10 seconds)

**Expected Result**: Ticket resolved instantly using cached resolution, skipping diagnostic agents.

#### Scenario 3: Cloud Service Issue (S3 Bucket)

**Objective**: Test AWS cloud service diagnostics.

**Steps**:
1. Submit S3 bucket issue:
   ```bash
   curl -X POST http://localhost:8000/api/submit-ticket \
     -F "title=S3 bucket not found" \
     -F "description=Cannot access my-test-bucket-12345" \
     -F "severity=medium" \
     -F "category=cloud"
   ```
2. Observe Cloud Service Agent activation
3. Verify S3 tools are called (check_bucket_exists, get_bucket_location)
4. Check resolution includes bucket status and recommendations

**Expected Result**: Cloud agent diagnoses bucket issue and provides actionable resolution steps.

#### Scenario 4: Multimodal Input (Screenshot Analysis)

**Objective**: Test image analysis with error screenshots.

**Steps**:
1. Prepare an error screenshot (e.g., AWS console error, terminal error)
2. Submit ticket with image:
   ```bash
   curl -X POST http://localhost:8000/api/submit-ticket \
     -F "title=Unknown AWS error" \
     -F "description=Getting error in AWS console" \
     -F "severity=high" \
     -F "category=cloud" \
     -F "files=@aws_error_screenshot.png"
   ```
3. Verify ticket description includes both text and image analysis
4. Check image analysis extracts error details, affected service, and recommendations

**Expected Result**: Combined ticket content includes structured image analysis with error details.

#### Scenario 5: AWS Credential Expiration

**Objective**: Test graceful handling of expired AWS credentials.

**Steps**:
1. Use temporary AWS credentials that will expire
2. Wait for credentials to expire
3. Submit cloud-related ticket
4. Observe error handling

**Expected Result**: System detects ExpiredToken error and prompts user to refresh credentials with clear message.

#### Scenario 6: Empty Ticket Validation

**Objective**: Test input validation for empty tickets.

**Steps**:
1. Submit ticket with empty description:
   ```bash
   curl -X POST http://localhost:8000/api/submit-ticket \
     -F "title=Test" \
     -F "description=   " \
     -F "severity=low" \
     -F "category=other"
   ```

**Expected Result**: API returns 400 error with validation message rejecting empty/whitespace-only descriptions.

#### Scenario 7: Concurrent Ticket Processing

**Objective**: Test system handling multiple simultaneous tickets.

**Steps**:
1. Submit 5 tickets simultaneously using parallel curl commands or a script
2. Monitor all tickets in UI
3. Verify each ticket processes independently
4. Check no workflow interference between tickets

**Expected Result**: All tickets process successfully without conflicts or errors.

### Property-Based Testing

The system includes property-based tests using `hypothesis` (Python) and `fast-check` (TypeScript) to verify correctness properties across generated inputs.

**Run Property-Based Tests**:
```bash
# Backend property tests
pytest -k "property" -v

# Frontend property tests
cd frontend
npm test -- --testNamePattern="property"
```

**Key Properties Tested**:
- Unique ticket ID generation
- Memory storage round-trip consistency
- Agent handoff sequence correctness
- Workflow termination finality
- Input validation across edge cases

## 🐛 Troubleshooting

### AWS Credential Issues

#### ExpiredToken Error

**Error**: 
```
An error occurred (ExpiredToken) when calling the ListBuckets operation: The provided token has expired.
```

**Solution**: 
1. Refresh your AWS credentials (especially if using temporary credentials)
2. Update `backend/.env` with new credentials:
   ```bash
   AWS_ACCESS_KEY_ID=<new-key>
   AWS_SECRET_ACCESS_KEY=<new-secret>
   AWS_SESSION_TOKEN=<new-token>  # If using temporary credentials
   ```
3. Restart the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

**Note**: The system will prompt you to refresh credentials when this error occurs. After updating credentials, retry the operation.

#### Invalid Credentials

**Error**: `InvalidClientTokenId` or `SignatureDoesNotMatch`

**Solution**:
1. Verify credentials are correct and not corrupted
2. Check for extra spaces or newlines in `.env` file
3. Ensure credentials belong to the correct AWS account
4. Test credentials with AWS CLI:
   ```bash
   aws sts get-caller-identity
   ```

### DynamoDB Connection Issues

#### Table Not Found

**Error**: `ResourceNotFoundException` for Haunted HelpdeskTickets table

**Solution**:
1. Verify the table exists:
   ```bash
   aws dynamodb describe-table --table-name Haunted HelpdeskTickets --region us-east-1
   ```
2. If table doesn't exist, create it:
   ```bash
   aws dynamodb create-table \
       --table-name Haunted HelpdeskTickets \
       --attribute-definitions AttributeName=ticket_id,AttributeType=S \
       --key-schema AttributeName=ticket_id,KeyType=HASH \
       --billing-mode PAY_PER_REQUEST \
       --region us-east-1
   ```
3. Check your AWS region matches the table region in `backend/.env`
4. Verify IAM permissions for DynamoDB access

#### Access Denied

**Error**: `AccessDeniedException` when accessing DynamoDB

**Solution**:
1. Verify IAM user/role has DynamoDB permissions
2. Check IAM policy includes:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "dynamodb:PutItem",
       "dynamodb:GetItem",
       "dynamodb:UpdateItem",
       "dynamodb:Scan"
     ],
     "Resource": "arn:aws:dynamodb:*:*:table/Haunted HelpdeskTickets"
   }
   ```
3. Test permissions with AWS CLI:
   ```bash
   aws dynamodb scan --table-name Haunted HelpdeskTickets --limit 1
   ```

### Bedrock Access Issues

#### Model Access Denied

**Error**: `AccessDeniedException` for Bedrock

**Solution**:
1. Request model access in AWS Bedrock console:
   - Navigate to AWS Bedrock → Model access
   - Request access to "Claude 3.5 Sonnet"
   - Wait for approval (usually instant, check email)
2. Verify IAM permissions include:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "bedrock:InvokeModel",
       "bedrock:InvokeModelWithResponseStream"
     ],
     "Resource": "arn:aws:bedrock:*::foundation-model/*"
   }
   ```
3. Check Bedrock is available in your region (us-east-1, us-west-2 recommended)
4. Test with AWS CLI:
   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```

#### Model Not Found

**Error**: Model ID not found or invalid

**Solution**:
1. Verify `BEDROCK_MODEL_ID` in `backend/.env` is correct:
   ```
   BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0
   ```
2. Check model availability in your region
3. List available models:
   ```bash
   aws bedrock list-foundation-models --region us-east-1 --by-provider anthropic
   ```

### Frontend Connection Issues

#### Cannot Connect to Backend

**Error**: Network errors when submitting tickets, "The spirits are restless... network connection failed 👻"

**Solution**:
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/health
   ```
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Verify CORS settings in `backend/.env`:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:8000
   ```
4. Check browser console for detailed error messages
5. Ensure no firewall blocking ports 3000 or 8000

#### CORS Errors

**Error**: CORS policy blocking requests in browser console

**Solution**:
1. Add frontend URL to `CORS_ORIGINS` in `backend/.env`
2. Restart backend server
3. Clear browser cache and reload
4. Verify backend logs show CORS middleware is active

### Memory Storage Issues

#### Cannot Read/Write Memory File

**Error**: `FileNotFoundError` or `PermissionError` for memory file

**Solution**:
1. Verify `backend/memories/` directory exists:
   ```bash
   mkdir -p backend/memories
   ```
2. Check file permissions:
   ```bash
   chmod 755 backend/memories
   ```
3. Ensure `MEMORY_DIR` and `MEMORY_FILE` are set correctly in `backend/.env`
4. Initialize empty memory file if needed:
   ```bash
   echo "[]" > backend/memories/Haunted Helpdesk_memories.json
   ```

#### Memory File Corrupted

**Error**: JSON decode error when reading memory file

**Solution**:
1. Backup existing file:
   ```bash
   cp backend/memories/Haunted Helpdesk_memories.json backend/memories/Haunted Helpdesk_memories.json.backup
   ```
2. Validate JSON:
   ```bash
   python -m json.tool backend/memories/Haunted Helpdesk_memories.json
   ```
3. If corrupted, reset to empty array:
   ```bash
   echo "[]" > backend/memories/Haunted Helpdesk_memories.json
   ```

### File Upload Issues

#### File Too Large

**Error**: `413 Payload Too Large`

**Solution**:
1. Check file size limit in `backend/.env`:
   ```
   MAX_UPLOAD_SIZE_MB=10
   ```
2. Increase limit if needed (be mindful of memory usage)
3. Compress images before uploading
4. Use appropriate image formats (PNG, JPEG)

#### Upload Directory Not Found

**Error**: Cannot save uploaded files

**Solution**:
1. Create upload directory:
   ```bash
   mkdir -p backend/uploads
   chmod 755 backend/uploads
   ```
2. Verify `UPLOAD_DIR` in `backend/.env` points to correct location

### Agent Workflow Issues

#### Workflow Timeout

**Error**: Workflow exceeds execution timeout

**Solution**:
1. Increase timeout in `backend/.env`:
   ```
   EXECUTION_TIMEOUT=900.0  # 15 minutes
   NODE_TIMEOUT=180.0       # 3 minutes per agent
   ```
2. Check if specific agent is stuck (review logs)
3. Verify network/cloud tools are responding
4. Check AWS service latency

#### Repetitive Handoffs Detected

**Error**: Workflow terminated due to repetitive handoffs

**Solution**:
1. Review agent system prompts for clarity
2. Check if agents are properly detecting completion signals
3. Examine workflow logs to identify loop pattern
4. Adjust detection parameters in `backend/.env`:
   ```
   REPETITIVE_HANDOFF_DETECTION_WINDOW=4
   REPETITIVE_HANDOFF_MIN_UNIQUE_AGENTS=2
   ```

#### Agent Not Responding

**Error**: Individual agent timeout

**Solution**:
1. Check Bedrock API status
2. Verify agent has necessary tools available
3. Review agent system prompt for issues
4. Check if tool execution is hanging (network/cloud operations)
5. Increase `NODE_TIMEOUT` if operations legitimately take longer

### Installation Issues

#### Python Dependencies

**Error**: Module not found or import errors

**Solution**:
1. Ensure Python 3.9+ is installed:
   ```bash
   python --version
   ```
2. Install dependencies in correct order:
   ```bash
   pip install -r requirements.txt
   cd backend
   pip install -r requirements.txt
   ```
3. Use virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

#### Node.js Dependencies

**Error**: Module not found in frontend

**Solution**:
1. Ensure Node.js 18+ is installed:
   ```bash
   node --version
   ```
2. Clear npm cache and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Try using yarn instead:
   ```bash
   yarn install
   ```

### Performance Issues

#### Slow Ticket Processing

**Symptoms**: Tickets take very long to resolve

**Solution**:
1. Check AWS service latency (Bedrock, DynamoDB)
2. Review agent handoff sequence (should be < 10 handoffs typically)
3. Verify network/cloud tools complete quickly
4. Check memory file size (large files slow keyword search)
5. Monitor system resources (CPU, memory)

#### High Memory Usage

**Symptoms**: Backend consuming excessive memory

**Solution**:
1. Limit concurrent ticket processing
2. Reduce `MAX_ITERATIONS` and `MAX_HANDOFFS`
3. Clear old uploaded files periodically
4. Restart backend server regularly
5. Consider implementing memory file pagination

### Debugging Tips

#### Enable Debug Logging

**Backend**:
```python
# Add to backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend**:
```bash
# In frontend/.env.local
NEXT_PUBLIC_DEBUG_MODE=true
```

#### View Agent Workflow Logs

Check the séance log in the UI or review backend console output for detailed handoff sequence.

#### Test Individual Components

```bash
# Test DynamoDB connection
python -c "from backend.dynamodb_utils import db_manager; print(db_manager.list_tickets())"

# Test memory agent
python -c "from agents.memory_agent import retrieve_memory; print(retrieve_memory('test query'))"

# Test network tools
python -c "from tools.network_tools import ping_host; print(ping_host('google.com'))"
```

#### Check AWS Service Status

Visit [AWS Service Health Dashboard](https://status.aws.amazon.com/) to check for service outages in your region.

## 📸 Screenshots

### Landing Page - Haunted Mansion Entrance
The landing page features a spooky Halloween theme with floating ghosts, flying bats, spider webs, and fog effects. The hero section introduces Haunted Helpdesk with an animated title and the tagline "Where IT Nightmares Come to Die."

### Demo Page - Crypt Control Center
The main control center where users can:
- Submit tickets with the curse submission form
- Watch the agent workflow visualization in real-time
- Monitor the séance log showing agent handoffs
- View the ticket graveyard with all submitted tickets

### Agent Visualization - Pentagram Circle
Six supernatural agent characters arranged in a pentagram circle:
- 👻 **Ghost Orchestrator** (top center) - Routes workflow with ethereal glow
- 💀 **Skeleton Memory** (top right) - Stores resolutions with memory orbs
- 🧛 **Vampire Ticketing** (bottom right) - Processes tickets with golden ticket
- 🧙 **Witch Network** (bottom center) - Diagnoses network with crystal ball
- ☠️ **Grim Reaper Cloud** (bottom left) - Handles AWS with cloud scythe
- 🧟 **Mummy Summarization** (top left) - Creates summaries wrapped in scrolls

### Ticket Submission Form
Halloween-themed form with:
- Curse Title input field
- Dark Details textarea
- Severity selector (Minor Haunting, Poltergeist, Full Possession, Apocalyptic)
- Realm selector (Network, Cloud, Other)
- Drag & drop file upload zone with bone icon
- "🎃 Cast the Ticket" submit button

### Séance Log
Real-time log showing agent handoffs with:
- Agent emoji icons
- Timestamped entries
- Scrollable history
- Spectral green timestamps

### Ticket Graveyard
Tombstone-style ticket cards displaying:
- Severity icons (🦇 Minor, 👻 Medium, 💀 High, ☠️ Critical)
- Ticket ID and title
- Status badges (pending, processing, resolved)
- Hover effects revealing "Exorcise" button

*Note: To add actual screenshots, capture images of your running application and place them in a `docs/images/` directory, then update this section with image links.*

## 🎨 Theme Customization

The Halloween theme can be customized in `frontend/tailwind.config.ts`:

### Color Palette
- `bg-void`: Deep black background (#0a0a0a)
- `bg-crypt`: Dark gray (#1a1a1a)
- `bg-tombstone`: Medium gray (#2a2a2a)
- `pumpkin-orange`: Vibrant orange (#ff6b35)
- `blood-red`: Deep red (#c1121f)
- `spectral-green`: Eerie green (#39ff14)
- `phantom-purple`: Purple (#9d4edd)
- `bone-white`: Off-white (#f8f9fa)
- `cobweb-gray`: Light gray (#6c757d)

### Animations
- `float`: Gentle up-and-down floating (ghosts)
- `rattle`: Shaking motion (skeleton)
- `cackle`: Tilting side-to-side (witch)
- `bite`: Quick forward lunge (vampire)
- `hover-menace`: Slow menacing hover (reaper)
- `unwrap`: Rotation animation (mummy)

### Gradients
- `bg-gradient-haunted`: Purple to black
- `bg-gradient-blood-moon`: Red to orange
- `bg-gradient-ectoplasm`: Green to cyan

### Custom Fonts
- **Creepster**: Halloween-themed display font from Google Fonts
- Applied to headings and titles for spooky effect

## 📊 Performance Considerations

### Expected Performance Metrics

- **Cached Resolution**: < 10 seconds (memory hit)
- **New Resolution**: 30-60 seconds (full workflow)
- **Image Analysis**: +5-10 seconds per image
- **Memory Search**: < 1 second (up to 1000 entries)
- **API Response Time**: < 200ms (excluding workflow)

### Optimization Tips

1. **Memory File Management**: Keep memory file under 10MB for fast keyword search
2. **Concurrent Processing**: Limit to 5 concurrent workflows to avoid resource exhaustion
3. **Image Size**: Compress images to < 2MB before upload
4. **DynamoDB**: Use on-demand billing for variable workloads
5. **Bedrock**: Monitor token usage to control costs

### Scaling Recommendations

- **Small Team (< 10 users)**: Single backend instance, default settings
- **Medium Team (10-50 users)**: Multiple backend instances behind load balancer
- **Large Team (50+ users)**: Distributed architecture with message queue for ticket processing

## 🔒 Security Best Practices

### AWS Credentials
- Use IAM roles instead of access keys when possible
- Rotate credentials regularly (every 90 days)
- Use temporary credentials (STS) for enhanced security
- Never commit credentials to version control

### API Security
- Enable HTTPS in production (use reverse proxy like nginx)
- Implement rate limiting to prevent abuse
- Add authentication/authorization for production use
- Validate and sanitize all user inputs

### Data Protection
- Encrypt sensitive data at rest in DynamoDB
- Use VPC endpoints for AWS service communication
- Implement audit logging for compliance
- Regular security updates for dependencies

## 🧪 Development Workflow

### Local Development

```bash
# Terminal 1: Backend with auto-reload
cd backend
uvicorn main:app --reload --log-level debug

# Terminal 2: Frontend with hot reload
cd frontend
npm run dev

# Terminal 3: Run tests on file changes
pytest --watch
```

### Code Quality

```bash
# Python linting
flake8 agents/ backend/ tools/
black agents/ backend/ tools/

# TypeScript linting
cd frontend
npm run lint
npm run type-check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

## 📚 Additional Resources

### Documentation
- [Strands Framework Documentation](https://github.com/strands-ai/strands)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Related Projects
- [LangChain](https://github.com/langchain-ai/langchain) - Alternative agent framework
- [AutoGen](https://github.com/microsoft/autogen) - Multi-agent conversation framework
- [CrewAI](https://github.com/joaomdmoura/crewAI) - Role-based agent orchestration

### AWS Resources
- [Bedrock Model Access](https://console.aws.amazon.com/bedrock/home#/modelaccess)
- [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- [IAM Policy Simulator](https://policysim.aws.amazon.com/)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `pytest` and `npm test`
5. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### Contribution Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help

For issues and questions:
1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review [API documentation](http://localhost:8000/docs) when backend is running
3. Check [AWS Service Health Dashboard](https://status.aws.amazon.com/)
4. Verify all environment variables are set correctly
5. Search existing GitHub issues
6. Create a new issue with detailed information

### Reporting Bugs

When reporting bugs, please include:
- Operating system and version
- Python and Node.js versions
- Complete error messages and stack traces
- Steps to reproduce the issue
- Expected vs actual behavior
- Relevant configuration (sanitized, no credentials)

### Feature Requests

We love feature ideas! Please open an issue with:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (if you have ideas)
- Willingness to contribute code

## 🙏 Acknowledgments

- **Strands Framework**: For the excellent multi-agent orchestration
- **AWS Bedrock**: For providing Claude 3.5 Sonnet access
- **Anthropic**: For creating Claude, the AI model powering our agents
- **Next.js Team**: For the amazing React framework
- **FastAPI**: For the high-performance Python web framework
- **Halloween**: For the spooky inspiration 🎃

---

**Built with 🎃 for automating IT nightmares**

*"In the crypt of code, where bugs dare to lurk, Haunted Helpdesk's agents work their magic, making IT operations less berserk!"*
