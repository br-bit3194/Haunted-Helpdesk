# Implementation Plan

- [ ] 1. Create Dockerfile with multi-stage build
  - Create `backend/Dockerfile` with builder and runtime stages
  - Use `python:3.11-slim` as base image
  - Copy requirements.txt and install dependencies in builder stage
  - Copy application source files to runtime stage
  - Create non-root user `appuser` (UID 1000)
  - Set working directory to `/app`
  - Expose port 8000
  - Create uploads/ and memories/ directories with correct permissions
  - Set CMD to run uvicorn with main:app
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2_

- [ ] 2. Create .dockerignore file
  - Create `backend/.dockerignore` to exclude unnecessary files from build context
  - Exclude `env/`, `__pycache__/`, `.pytest_cache/`, `*.pyc`, `.git/`
  - Exclude `node_modules/`, `.env`, `.env.local`
  - Keep `.env.example` for reference
  - _Requirements: 1.5_

- [ ] 3. Create docker-compose.yml for development
  - Create `docker-compose.yml` in project root
  - Define `backend` service with build context pointing to backend/
  - Configure volume mounts for hot-reload: `./backend:/app/backend`
  - Create named volumes for uploads and memories persistence
  - Map port 8000:8000
  - Load environment variables from `.env` file
  - Set environment variable for development mode if needed
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 4. Create docker-compose.prod.yml for production
  - Create `docker-compose.prod.yml` with production configuration
  - Remove volume mounts for source code (use baked-in code)
  - Keep named volumes for uploads and memories
  - Add health check configuration using /health endpoint
  - Set restart policy to `unless-stopped`
  - Configure resource limits (memory, CPU)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Update backend application to read environment variables
  - Modify `backend/main.py` to read configuration from environment variables
  - Add environment variable reading for API_HOST, API_PORT
  - Ensure AWS credentials are read from environment (already done via boto3)
  - Add logging for configuration values (without exposing secrets)
  - Implement default values for optional environment variables
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Create deployment documentation
  - Create `backend/README.md` with deployment instructions
  - Document all required environment variables with descriptions
  - Provide example commands for building Docker image
  - Provide example commands for running container locally
  - Include docker-compose usage examples
  - Add troubleshooting section for common issues
  - Document production deployment considerations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Create example environment file for Docker
  - Create `backend/.env.docker.example` with all environment variables
  - Include comments explaining each variable
  - Provide example values for development
  - Mark required vs optional variables clearly
  - _Requirements: 2.1, 2.2, 2.3, 6.2, 6.3_

- [ ]* 8. Write integration tests for Docker deployment
  - Create `backend/tests/test_docker_deployment.py`
  - Test Docker image builds successfully
  - Test container starts and responds to health check
  - Test environment variable injection works correctly
  - Test volume mounts work in development mode
  - Test application is accessible on port 8000
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.2, 4.1_

- [ ]* 8.1 Write property test for container build completeness
  - **Property 1: Container build completeness**
  - **Validates: Requirements 1.1, 1.2, 1.4**
  - Generate various valid backend source configurations
  - Verify Docker build succeeds for all configurations

- [ ]* 8.2 Write property test for environment variable propagation
  - **Property 2: Environment variable propagation**
  - **Validates: Requirements 2.1, 2.2, 2.3**
  - Generate random valid environment variable sets
  - Verify application receives and uses all provided variables

- [ ]* 8.3 Write property test for port accessibility
  - **Property 3: Port accessibility**
  - **Validates: Requirements 1.3**
  - Test container starts with various port configurations
  - Verify application is accessible on specified port

- [ ]* 8.4 Write property test for non-root execution
  - **Property 5: Non-root execution**
  - **Validates: Requirements 5.1**
  - Start container and verify process UID is 1000
  - Ensure no processes run as root

- [ ]* 8.5 Write property test for directory creation and permissions
  - **Property 6: Directory creation**
  - **Validates: Requirements 3.4**
  - Verify uploads/ and memories/ directories exist and are writable
  - Test file creation in both directories

- [ ] 9. Create build and deployment scripts
  - Create `backend/scripts/build.sh` for building Docker image
  - Create `backend/scripts/run-dev.sh` for running development container
  - Create `backend/scripts/run-prod.sh` for running production container
  - Make scripts executable and add error handling
  - Add logging to scripts for debugging
  - _Requirements: 6.1, 6.4_

- [ ] 10. Test complete deployment workflow
  - Build Docker image using Dockerfile
  - Start container using docker-compose
  - Verify health endpoint returns 200 OK
  - Test creating a ticket via API
  - Test file upload functionality
  - Verify logs are accessible via docker logs
  - Stop and clean up containers
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.4, 4.1, 4.5_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
