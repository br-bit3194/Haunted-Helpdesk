# Design Document

## Overview

This design document outlines the containerization strategy for the Haunted Helpdesk backend FastAPI application. The solution uses Docker to package the application with all dependencies, enabling consistent deployment across development, staging, and production environments. The design emphasizes security, efficiency, and operational simplicity while maintaining compatibility with AWS services (Bedrock and DynamoDB).

## Architecture

### Container Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container                │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   FastAPI Application (Port 8000) │ │
│  │   - main.py                       │ │
│  │   - agents/                       │ │
│  │   - tools/                        │ │
│  │   - dynamodb_utils.py             │ │
│  │   - Helpdesk_swarm.py             │ │
│  │   - multimodal_input.py           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Runtime Directories             │ │
│  │   - /app/backend/uploads/         │ │
│  │   - /app/backend/memories/        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Python 3.11 Runtime             │ │
│  │   - uvicorn                       │ │
│  │   - fastapi                       │ │
│  │   - boto3                         │ │
│  │   - strands-agents                │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
    AWS Bedrock          DynamoDB
    (Claude 3.5)         (Tickets)
```

### Multi-Stage Build Strategy

The Dockerfile uses a multi-stage build to optimize image size:

1. **Builder Stage**: Installs dependencies and compiles any necessary packages
2. **Runtime Stage**: Copies only necessary files and dependencies from builder

This approach reduces the final image size by excluding build tools and intermediate files.

## Components and Interfaces

### Dockerfile Components

#### Base Image Selection
- **Base**: `python:3.11-slim` - Official Python image with minimal footprint
- **Rationale**: Slim variant reduces image size while providing necessary Python runtime
- **Security**: Official images receive regular security updates

#### Application Structure
```
/app/
├── backend/
│   ├── agents/
│   ├── tools/
│   ├── memories/
│   ├── uploads/
│   ├── main.py
│   ├── dynamodb_utils.py
│   ├── Helpdesk_swarm.py
│   ├── multimodal_input.py
│   ├── requirements.txt
│   └── __init__.py
└── requirements.txt (root level copy for caching)
```

#### Port Exposure
- **Port 8000**: FastAPI application HTTP endpoint
- **Health Check**: Available at `http://localhost:8000/health`

#### User Configuration
- **Non-root user**: Application runs as user `appuser` (UID 1000)
- **Working directory**: `/app`
- **Permissions**: Read/write access to `uploads/` and `memories/` directories

### Environment Variables Interface

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | Yes | - | AWS access key for Bedrock/DynamoDB |
| `AWS_SECRET_ACCESS_KEY` | Yes | - | AWS secret key |
| `AWS_SESSION_TOKEN` | No | - | AWS session token (for temporary credentials) |
| `AWS_DEFAULT_REGION` | Yes | `us-east-1` | AWS region |
| `BEDROCK_MODEL_ID` | No | `us.anthropic.claude-3.5-sonnet-20241022-v2:0` | Bedrock model identifier |
| `DYNAMODB_TABLE_NAME` | Yes | `HauntedHelpdeskTickets` | DynamoDB table name |
| `API_HOST` | No | `0.0.0.0` | FastAPI bind address |
| `API_PORT` | No | `8000` | FastAPI port |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `UPLOAD_DIR` | No | `backend/uploads` | File upload directory |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Maximum file upload size |
| `MEMORY_DIR` | No | `backend/memories` | Memory storage directory |
| `MAX_HANDOFFS` | No | `20` | Maximum agent handoffs |
| `EXECUTION_TIMEOUT` | No | `600.0` | Workflow execution timeout (seconds) |

### Docker Compose Interface

The docker-compose.yml provides orchestration for both development and production scenarios:

**Development Mode:**
- Volume mounts for hot-reload
- Environment variables from `.env` file
- Port mapping to localhost

**Production Mode:**
- No volume mounts (code baked into image)
- Environment variables from secrets management
- Health checks enabled
- Restart policies configured

## Data Models

### Container Build Context

```dockerfile
# Files included in build context
COPY backend/requirements.txt /app/backend/
COPY backend/*.py /app/backend/
COPY backend/agents/ /app/backend/agents/
COPY backend/tools/ /app/backend/tools/
COPY backend/memories/.gitkeep /app/backend/memories/
COPY backend/uploads/.gitkeep /app/backend/uploads/
```

### Volume Mounts (Development)

```yaml
volumes:
  - ./backend:/app/backend  # Source code hot-reload
  - backend-uploads:/app/backend/uploads  # Persistent uploads
  - backend-memories:/app/backend/memories  # Persistent memories
```

### Health Check Configuration

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Container build completeness
*For any* valid backend source tree, building the Docker image should succeed and include all necessary Python dependencies from requirements.txt
**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: Environment variable propagation
*For any* set of valid environment variables, when passed to the container, the FastAPI application should read and use those values for configuration
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Port accessibility
*For any* running container instance, the FastAPI application should be accessible on the exposed port 8000
**Validates: Requirements 1.3**

### Property 4: Health check responsiveness
*For any* running container with valid AWS credentials, the /health endpoint should return HTTP 200 with service status details
**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 5: Non-root execution
*For any* running container, the application process should execute as a non-root user (UID 1000)
**Validates: Requirements 5.1**

### Property 6: Directory creation
*For any* container start, the system should create or verify existence of uploads/ and memories/ directories with appropriate permissions
**Validates: Requirements 3.4**

### Property 7: Development hot-reload
*For any* source code change in development mode with volume mounts, the application should reload automatically without container restart
**Validates: Requirements 3.1, 3.2**

### Property 8: Missing environment variable handling
*For any* critical missing environment variable (AWS credentials, DynamoDB table), the application should log a clear error message
**Validates: Requirements 2.5**

## Error Handling

### Build-Time Errors

1. **Missing Dependencies**
   - Error: `pip install` fails for a package
   - Handling: Dockerfile fails with clear error message
   - Resolution: Update requirements.txt with correct package versions

2. **Invalid Base Image**
   - Error: Base image not found or inaccessible
   - Handling: Docker build fails immediately
   - Resolution: Verify Docker Hub connectivity and image name

### Runtime Errors

1. **Missing AWS Credentials**
   - Error: `NoCredentialsError` from boto3
   - Handling: Application logs error and /health returns degraded status
   - Resolution: Provide valid AWS credentials via environment variables

2. **DynamoDB Table Not Found**
   - Error: `ResourceNotFoundException` from DynamoDB
   - Handling: /health endpoint returns error status with clear message
   - Resolution: Create DynamoDB table or update table name

3. **Port Already in Use**
   - Error: Cannot bind to port 8000
   - Handling: Container fails to start with error message
   - Resolution: Stop conflicting service or use different port mapping

4. **File Permission Errors**
   - Error: Cannot write to uploads/ or memories/
   - Handling: Application logs permission error
   - Resolution: Ensure directories have correct ownership (UID 1000)

### Health Check Failures

1. **AWS Bedrock Unavailable**
   - Status: `degraded`
   - Message: "AWS Bedrock is not accessible"
   - Action: Check AWS credentials and Bedrock service availability

2. **DynamoDB Unavailable**
   - Status: `degraded`
   - Message: "DynamoDB table is not accessible"
   - Action: Verify table exists and IAM permissions are correct

## Testing Strategy

### Unit Tests

Unit tests verify specific Docker and deployment configurations:

1. **Dockerfile Syntax Test**
   - Verify Dockerfile parses correctly
   - Check for common anti-patterns

2. **Environment Variable Parsing Test**
   - Test application reads environment variables correctly
   - Verify default values are applied when variables are missing

3. **Health Endpoint Test**
   - Verify /health endpoint returns correct structure
   - Test with mocked AWS services

### Property-Based Tests

Property-based tests verify universal properties across different configurations:

1. **Property Test: Container Build Success**
   - Generate various valid backend source configurations
   - Verify Docker build succeeds for all configurations
   - **Validates: Property 1**

2. **Property Test: Environment Variable Injection**
   - Generate random valid environment variable sets
   - Verify application receives and uses all provided variables
   - **Validates: Property 2**

3. **Property Test: Port Binding**
   - Test container starts with various port configurations
   - Verify application is accessible on specified port
   - **Validates: Property 3**

4. **Property Test: Non-Root Execution**
   - Start container and verify process UID
   - Ensure no processes run as root
   - **Validates: Property 5**

5. **Property Test: Directory Permissions**
   - Verify uploads/ and memories/ directories are writable
   - Test file creation in both directories
   - **Validates: Property 6**

### Integration Tests

Integration tests verify the complete deployment workflow:

1. **Docker Build and Run Test**
   - Build image from Dockerfile
   - Start container with test environment variables
   - Verify application responds to HTTP requests
   - Stop and remove container

2. **Docker Compose Test**
   - Start services using docker-compose
   - Verify health check passes
   - Test API endpoints
   - Stop services

3. **AWS Integration Test**
   - Start container with real AWS credentials
   - Verify Bedrock connectivity
   - Verify DynamoDB accessibility
   - Create and process a test ticket

### Manual Testing Checklist

1. Build Docker image locally
2. Run container with development configuration
3. Verify hot-reload works with code changes
4. Run container with production configuration
5. Test health endpoint returns correct status
6. Verify file uploads work correctly
7. Test with invalid AWS credentials (should fail gracefully)
8. Test with missing environment variables (should log errors)

## Deployment Scenarios

### Local Development

```bash
# Build image
docker build -t haunted-helpdesk-backend:dev .

# Run with docker-compose
docker-compose up

# Access application
curl http://localhost:8000/health
```

### Production Deployment

```bash
# Build optimized image
docker build -t haunted-helpdesk-backend:latest .

# Run with production environment
docker run -d \
  --name haunted-helpdesk \
  -p 8000:8000 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_DEFAULT_REGION=us-east-1 \
  -e DYNAMODB_TABLE_NAME=HauntedHelpdeskTickets \
  --restart unless-stopped \
  haunted-helpdesk-backend:latest
```

### Cloud Deployment (AWS ECS/Fargate)

- Use task definition with environment variables from AWS Secrets Manager
- Configure ALB health checks to use /health endpoint
- Set up CloudWatch logs for container output
- Use IAM roles for AWS service access (no hardcoded credentials)

## Security Considerations

1. **Secrets Management**
   - Never bake AWS credentials into image
   - Use environment variables or mounted secrets
   - Consider AWS Secrets Manager for production

2. **Image Scanning**
   - Scan images for vulnerabilities before deployment
   - Use tools like Trivy or AWS ECR scanning

3. **Network Security**
   - Run container in private network
   - Use security groups to restrict access
   - Only expose necessary ports

4. **File Upload Security**
   - Enforce file size limits (10MB default)
   - Validate file types
   - Scan uploaded files for malware in production

## Performance Optimization

1. **Layer Caching**
   - Copy requirements.txt before source code
   - Leverage Docker layer caching for faster builds

2. **Image Size**
   - Use slim base image
   - Multi-stage build to exclude build tools
   - Remove unnecessary files (.pyc, __pycache__)

3. **Startup Time**
   - Pre-compile Python files
   - Use uvicorn with appropriate worker count
   - Configure health check start_period appropriately

## Monitoring and Observability

1. **Logging**
   - Application logs to stdout/stderr
   - Docker captures logs automatically
   - Forward to CloudWatch or ELK stack

2. **Metrics**
   - Expose Prometheus metrics endpoint (future enhancement)
   - Track request latency, error rates
   - Monitor AWS service call metrics

3. **Health Checks**
   - Container-level health check using /health endpoint
   - Orchestrator (ECS, Kubernetes) uses health status
   - Automatic restart on health check failure
