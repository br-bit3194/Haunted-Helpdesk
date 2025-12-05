"""
Haunted Helpdesk FastAPI Application

Main FastAPI application for the Haunted Helpdesk AI-powered multi-agent IT operations platform.
Provides REST API endpoints for ticket management and workflow processing.
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import os
import uuid
import shutil
import logging

# Import Haunted Helpdesk components
from dynamodb_utils import db_manager
from Helpdesk_swarm import create_Haunted_Helpdesk_swarm
from multimodal_input import process_multimodal_input

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("haunted_helpdesk.workflow")


# Initialize FastAPI application
app = FastAPI(
    title="Haunted Helpdesk - Multi-Agent IT Operations Platform",
    description=(
        "AI-powered multi-agent system for automated IT incident resolution. "
        "Haunted Helpdesk orchestrates six specialized agents (Orchestrator, Memory, Ticketing, "
        "Network Diagnostic, Cloud Service, and Summarization) to resolve IT incidents "
        "efficiently with persistent memory capabilities."
    ),
    version="1.0.0"
)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Pydantic Models

class TicketCreate(BaseModel):
    """Model for creating a new ticket."""
    title: str = Field(..., description="Brief title of the issue", min_length=1)
    description: str = Field(..., description="Detailed description of the issue", min_length=1)
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    category: str = Field(..., description="Category: network, cloud, other")
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "title": "S3 Bucket Access Denied",
                "description": "Unable to access my-app-bucket in us-west-2 region",
                "severity": "high",
                "category": "cloud"
            }
        }
    )


class TicketResponse(BaseModel):
    """Model for ticket response."""
    ticket_id: str = Field(..., description="Unique ticket identifier")
    title: str = Field(..., description="Brief title of the issue")
    description: str = Field(..., description="Detailed description of the issue")
    severity: str = Field(..., description="Severity level")
    category: str = Field(..., description="Category")
    status: str = Field(..., description="Current status: pending, processing, resolved")
    created_at: str = Field(..., description="ISO 8601 timestamp of creation")
    updated_at: str = Field(..., description="ISO 8601 timestamp of last update")
    resolution: Optional[str] = Field(None, description="Resolution summary if resolved")
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "S3 Bucket Access Denied",
                "description": "Unable to access my-app-bucket in us-west-2 region",
                "severity": "high",
                "category": "cloud",
                "status": "resolved",
                "created_at": "2024-12-03T10:30:00Z",
                "updated_at": "2024-12-03T10:35:00Z",
                "resolution": "Bucket permissions were updated to allow access."
            }
        }
    )


# API Endpoints

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint that verifies AWS service availability.
    
    Checks:
    - AWS Bedrock availability (Claude 3.5 Sonnet model)
    - DynamoDB table accessibility (HauntedHelpdeskTickets)
    
    Returns:
        JSON object with overall status and individual service statuses
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {}
    }
    
    # Check AWS Bedrock availability
    bedrock_status = await _check_bedrock_availability()
    health_status["services"]["bedrock"] = bedrock_status
    
    # Check DynamoDB table accessibility
    dynamodb_status = await _check_dynamodb_accessibility()
    health_status["services"]["dynamodb"] = dynamodb_status
    
    # Determine overall health status
    if not bedrock_status["available"] or not dynamodb_status["available"]:
        health_status["status"] = "degraded"
    
    return health_status


async def _check_bedrock_availability() -> Dict[str, Any]:
    """
    Check if AWS Bedrock service is available and accessible.
    
    Returns:
        Dictionary with availability status and details
    """
    try:
        bedrock_client = boto3.client('bedrock-runtime')
        
        # The model ID we're using for Haunted Helpdesk
        model_id = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
        
        # Try a minimal invocation to verify access
        # We use a very short prompt to minimize cost and latency
        response = bedrock_client.invoke_model(
            modelId=model_id,
            body='{"anthropic_version":"bedrock-2023-05-31","max_tokens":1,"messages":[{"role":"user","content":"test"}]}'
        )
        
        return {
            "available": True,
            "status": "operational",
            "model": model_id,
            "message": "AWS Bedrock is accessible"
        }
        
    except NoCredentialsError:
        return {
            "available": False,
            "status": "error",
            "message": "AWS credentials not found or expired. Please refresh your credentials."
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            return {
                "available": False,
                "status": "error",
                "message": "AWS credentials have expired. Please refresh your credentials."
            }
        elif error_code == 'AccessDeniedException':
            return {
                "available": False,
                "status": "error",
                "message": "Access denied to AWS Bedrock. Please check IAM permissions."
            }
        elif error_code == 'ResourceNotFoundException':
            return {
                "available": False,
                "status": "error",
                "message": "Bedrock model not found. Please verify model access in your region."
            }
        else:
            return {
                "available": False,
                "status": "error",
                "message": f"AWS Bedrock error: {error_code}"
            }
    except Exception as e:
        return {
            "available": False,
            "status": "error",
            "message": f"Unexpected error checking Bedrock: {str(e)}"
        }


async def _check_dynamodb_accessibility() -> Dict[str, Any]:
    """
    Check if DynamoDB table is accessible.
    
    Returns:
        Dictionary with availability status and details
    """
    try:
        # Try to describe the table to verify it exists and is accessible
        dynamodb_client = boto3.client('dynamodb')
        response = dynamodb_client.describe_table(TableName=db_manager.table_name)
        
        table_status = response['Table']['TableStatus']
        
        return {
            "available": table_status == 'ACTIVE',
            "status": table_status.lower(),
            "table_name": db_manager.table_name,
            "message": f"DynamoDB table is {table_status}"
        }
        
    except NoCredentialsError:
        return {
            "available": False,
            "status": "error",
            "message": "AWS credentials not found or expired. Please refresh your credentials."
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            return {
                "available": False,
                "status": "error",
                "message": "AWS credentials have expired. Please refresh your credentials."
            }
        elif error_code == 'ResourceNotFoundException':
            return {
                "available": False,
                "status": "error",
                "message": f"DynamoDB table '{db_manager.table_name}' not found. Please create the table."
            }
        elif error_code == 'AccessDeniedException':
            return {
                "available": False,
                "status": "error",
                "message": "Access denied to DynamoDB. Please check IAM permissions."
            }
        else:
            return {
                "available": False,
                "status": "error",
                "message": f"DynamoDB error: {error_code}"
            }
    except Exception as e:
        return {
            "available": False,
            "status": "error",
            "message": f"Unexpected error checking DynamoDB: {str(e)}"
        }


# Ticket CRUD Endpoints

@app.post("/api/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(ticket: TicketCreate) -> TicketResponse:
    """
    Create a new ticket.
    
    Args:
        ticket: Ticket creation data
        
    Returns:
        Created ticket with unique identifier
        
    Raises:
        HTTPException: If ticket creation fails
    """
    import uuid
    from fastapi import HTTPException
    
    try:
        # Generate unique ticket ID
        ticket_id = str(uuid.uuid4())
        
        # Prepare ticket data
        ticket_data = {
            "ticket_id": ticket_id,
            "title": ticket.title,
            "description": ticket.description,
            "severity": ticket.severity,
            "category": ticket.category,
            "status": "pending",  # Initial status
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "resolution": None
        }
        
        # Create ticket in DynamoDB
        created_ticket = db_manager.create_ticket(ticket_data)
        
        return TicketResponse(**created_ticket)
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            raise HTTPException(
                status_code=401,
                detail="AWS credentials have expired. Please refresh your credentials."
            )
        elif error_code == 'AccessDeniedException':
            raise HTTPException(
                status_code=403,
                detail="Access denied to DynamoDB. Please check IAM permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create ticket: {error_message}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error creating ticket: {str(e)}"
        )


@app.get("/api/tickets", response_model=list[TicketResponse])
async def list_tickets() -> list[TicketResponse]:
    """
    List all tickets.
    
    Returns:
        List of all tickets in the system
        
    Raises:
        HTTPException: If listing tickets fails
    """
    from fastapi import HTTPException
    
    try:
        # Retrieve all tickets from DynamoDB
        tickets = db_manager.list_tickets()
        
        # Convert to response models
        return [TicketResponse(**ticket) for ticket in tickets]
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            raise HTTPException(
                status_code=401,
                detail="AWS credentials have expired. Please refresh your credentials."
            )
        elif error_code == 'AccessDeniedException':
            raise HTTPException(
                status_code=403,
                detail="Access denied to DynamoDB. Please check IAM permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list tickets: {error_message}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error listing tickets: {str(e)}"
        )


@app.get("/api/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str) -> TicketResponse:
    """
    Get a specific ticket by ID.
    
    Args:
        ticket_id: Unique identifier of the ticket
        
    Returns:
        Ticket details
        
    Raises:
        HTTPException: If ticket not found or retrieval fails
    """
    from fastapi import HTTPException
    
    try:
        # Retrieve ticket from DynamoDB
        ticket = db_manager.get_ticket(ticket_id)
        
        # Return 404 if ticket not found
        if ticket is None:
            raise HTTPException(
                status_code=404,
                detail=f"Ticket with ID '{ticket_id}' not found"
            )
        
        return TicketResponse(**ticket)
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            raise HTTPException(
                status_code=401,
                detail="AWS credentials have expired. Please refresh your credentials."
            )
        elif error_code == 'AccessDeniedException':
            raise HTTPException(
                status_code=403,
                detail="Access denied to DynamoDB. Please check IAM permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get ticket: {error_message}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error getting ticket: {str(e)}"
        )


# Ticket Processing Endpoint

@app.post("/api/process-ticket/{ticket_id}")
async def process_ticket(ticket_id: str) -> Dict[str, Any]:
    """
    Process a ticket through the Haunted Helpdesk multi-agent workflow.
    
    This endpoint initiates the complete workflow sequence:
    1. Retrieves the ticket from DynamoDB
    2. Updates ticket status to "processing"
    3. Initializes the Haunted Helpdesk swarm
    4. Executes the swarm with the ticket content
    5. Returns the workflow result with handoff sequence and final response
    
    Args:
        ticket_id: Unique identifier of the ticket to process
        
    Returns:
        Dictionary containing:
        - ticket_id: The processed ticket ID
        - status: Current ticket status
        - workflow_result: Complete workflow execution details including:
            - final_response: Last agent's response
            - handoff_sequence: List of agent names in execution order
            - conversation_history: All messages exchanged
            - execution_time: Time taken in seconds
            - terminated_by: Agent that terminated the workflow
        
    Raises:
        HTTPException: If ticket not found or processing fails
    """
    from fastapi import HTTPException
    import json
    import time
    
    try:
        # Step 1: Retrieve ticket from DynamoDB
        ticket = db_manager.get_ticket(ticket_id)
        
        # Return 404 if ticket not found
        if ticket is None:
            raise HTTPException(
                status_code=404,
                detail=f"Ticket with ID '{ticket_id}' not found"
            )
        
        # Step 2: Update ticket status to "processing"
        update_data = {
            "status": "processing",
            "updated_at": datetime.utcnow().isoformat()
        }
        db_manager.update_ticket(ticket_id, update_data)
        
        # Step 3: Initialize Haunted Helpdesk swarm
        swarm = create_Haunted_Helpdesk_swarm()
        
        # Prepare ticket content for workflow
        ticket_content = f"""
Ticket ID: {ticket['ticket_id']}
Title: {ticket['title']}
Description: {ticket['description']}
Severity: {ticket['severity']}
Category: {ticket['category']}
Created: {ticket['created_at']}
"""
        
        # Step 4: Execute swarm with ticket content
        # The swarm starts with the orchestrator agent by default
        start_time = time.time()
        
        # Log workflow start
        logger.info(f"Workflow started: ticket_id={ticket_id}, entry_agent=orchestrator_agent")
        
        # Retry logic for AWS Bedrock intermittent errors
        max_retries = 2
        last_error = None
        
        for attempt in range(max_retries):
            try:
                result = await swarm.invoke_async(task=ticket_content)
                execution_time = time.time() - start_time
                
                # Log workflow completion
                logger.info(f"Workflow completed: ticket_id={ticket_id}, execution_time={execution_time:.2f}s, attempt={attempt+1}")
                break
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                
                # Check if it's a retryable AWS error
                if "modelstreamerror" in error_str or "unexpected error" in error_str:
                    if attempt < max_retries - 1:
                        logger.warning(f"AWS Bedrock error on attempt {attempt+1}, retrying: {str(e)}")
                        continue
                    else:
                        logger.error(f"AWS Bedrock error after {max_retries} attempts: {str(e)}")
                        raise
                else:
                    # Non-retryable error, raise immediately
                    raise
        
        if last_error and attempt == max_retries - 1:
            raise last_error
        
        # Step 5: Serialize swarm result to JSON
        # Extract handoff sequence from the result
        handoff_sequence = []
        if hasattr(result, 'conversation_history') and result.conversation_history:
            for message in result.conversation_history:
                if hasattr(message, 'agent_name') and message.agent_name:
                    if not handoff_sequence or handoff_sequence[-1] != message.agent_name:
                        handoff_sequence.append(message.agent_name)
        
        # Extract summary from conversation history
        summary = None
        if hasattr(result, 'conversation_history') and result.conversation_history:
            for msg in result.conversation_history:
                if hasattr(msg, 'agent_name') and msg.agent_name == 'summarization_agent':
                    if hasattr(msg, 'content'):
                        # Extract summary content (remove WORKFLOW_COMPLETE marker if present)
                        content = msg.content
                        if "WORKFLOW_COMPLETE" in content:
                            summary = content.split("WORKFLOW_COMPLETE")[0].strip()
                        else:
                            summary = content.strip()
                        break
        
        # Build workflow result
        workflow_result = {
            "final_response": result.final_response if hasattr(result, 'final_response') else str(result),
            "handoff_sequence": handoff_sequence,
            "execution_time": execution_time,
            "status": "completed",
            "summary": summary  # Add summary as separate field
        }
        
        # Add conversation history if available
        if hasattr(result, 'conversation_history'):
            workflow_result["conversation_history"] = [
                {
                    "agent_name": msg.agent_name if hasattr(msg, 'agent_name') else "unknown",
                    "content": msg.content if hasattr(msg, 'content') else str(msg),
                    "role": msg.role if hasattr(msg, 'role') else "assistant"
                }
                for msg in result.conversation_history
            ]
        
        # Add termination info if available
        if hasattr(result, 'terminated_by'):
            workflow_result["terminated_by"] = result.terminated_by
        
        # Return workflow result
        return {
            "ticket_id": ticket_id,
            "status": "processing",
            "workflow_result": workflow_result
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            raise HTTPException(
                status_code=401,
                detail="AWS credentials have expired. Please refresh your credentials."
            )
        elif error_code == 'AccessDeniedException':
            raise HTTPException(
                status_code=403,
                detail="Access denied to AWS services. Please check IAM permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"AWS error during ticket processing: {error_message}"
            )
    except Exception as e:
        # Log the error for debugging
        import traceback
        error_trace = traceback.format_exc()
        error_message = str(e)
        
        # Check for specific error types
        is_loop_error = "loop" in error_message.lower() or "repetitive" in error_message.lower()
        is_max_handoffs = "max" in error_message.lower() and "handoff" in error_message.lower()
        is_timeout = "timeout" in error_message.lower() or "timed out" in error_message.lower()
        
        # Log appropriate error type
        if is_loop_error:
            logger.error(f"Loop detected in workflow: ticket_id={ticket_id}, error={error_message}")
        elif is_max_handoffs:
            logger.error(f"Max handoffs exceeded: ticket_id={ticket_id}, error={error_message}")
        elif is_timeout:
            logger.error(f"Workflow timeout: ticket_id={ticket_id}, error={error_message}")
        else:
            logger.error(f"Error processing ticket {ticket_id}: {error_trace}")
        
        # Try to update ticket status to indicate error
        try:
            error_resolution = f"Error during processing: {error_message}"
            if is_loop_error:
                error_resolution = f"Loop detected in workflow: {error_message}"
            elif is_max_handoffs:
                error_resolution = f"Max handoffs exceeded: {error_message}"
            elif is_timeout:
                error_resolution = f"Workflow timeout: {error_message}"
            
            error_update = {
                "status": "error",
                "updated_at": datetime.utcnow().isoformat(),
                "resolution": error_resolution
            }
            db_manager.update_ticket(ticket_id, error_update)
        except:
            pass  # If we can't update, at least return the error
        
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error processing ticket: {error_message}\n\nTraceback:\n{error_trace}"
        )


# Multipart Ticket Submission Endpoint

@app.post("/api/submit-ticket")
async def submit_ticket(
    background_tasks: BackgroundTasks,
    title: str = Form(..., description="Brief title of the issue"),
    description: str = Form(..., description="Detailed description of the issue"),
    severity: str = Form(..., description="Severity level: low, medium, high, critical"),
    category: str = Form(..., description="Category: network, cloud, other"),
    files: List[UploadFile] = File(default=[], description="Optional error screenshots")
) -> Dict[str, Any]:
    """
    Submit a ticket with multipart form data including optional file attachments.
    
    This endpoint:
    1. Accepts form fields (title, description, severity, category)
    2. Accepts file uploads (error screenshots)
    3. Saves uploaded files to backend/uploads/ directory
    4. Processes multimodal input combining text and images
    5. Creates ticket with combined content
    6. Initiates workflow processing in background task
    7. Returns ticket_id and processing status
    
    Args:
        background_tasks: FastAPI background tasks for async processing
        title: Brief title of the issue
        description: Detailed description of the issue
        severity: Severity level (low, medium, high, critical)
        category: Category (network, cloud, other)
        files: Optional list of uploaded files (error screenshots)
        
    Returns:
        Dictionary containing:
        - ticket_id: Unique identifier for the created ticket
        - status: Current ticket status (processing)
        - message: Confirmation message
        
    Raises:
        HTTPException: If validation fails or ticket creation fails
    """
    try:
        # Validate that title and description are not empty or whitespace-only
        if not title or not title.strip():
            raise HTTPException(
                status_code=400,
                detail="Ticket title cannot be empty"
            )
        
        if not description or not description.strip():
            raise HTTPException(
                status_code=400,
                detail="Ticket description cannot be empty"
            )
        
        # Ensure uploads directory exists
        upload_dir = "backend/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Process uploaded files
        saved_file_paths = []
        
        if files and len(files) > 0:
            for file in files:
                # Skip empty files
                if not file.filename:
                    continue
                
                try:
                    # Generate unique filename to avoid collisions
                    file_extension = os.path.splitext(file.filename)[1]
                    unique_filename = f"{uuid.uuid4()}{file_extension}"
                    file_path = os.path.join(upload_dir, unique_filename)
                    
                    # Check file size (limit to 10MB as per design doc)
                    file.file.seek(0, 2)  # Seek to end
                    file_size = file.file.tell()
                    file.file.seek(0)  # Reset to beginning
                    
                    max_size_mb = 10
                    max_size_bytes = max_size_mb * 1024 * 1024
                    
                    if file_size > max_size_bytes:
                        raise HTTPException(
                            status_code=413,
                            detail=f"File '{file.filename}' exceeds maximum size of {max_size_mb}MB"
                        )
                    
                    # Validate file type (images only)
                    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
                    if file_extension.lower() not in allowed_extensions:
                        raise HTTPException(
                            status_code=415,
                            detail=f"Unsupported file type '{file_extension}'. Supported types: {', '.join(allowed_extensions)}"
                        )
                    
                    # Save file to uploads directory
                    with open(file_path, "wb") as buffer:
                        shutil.copyfileobj(file.file, buffer)
                    
                    saved_file_paths.append(file_path)
                    
                except HTTPException:
                    # Re-raise HTTP exceptions
                    raise
                except Exception as e:
                    # Handle file save errors
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to save file '{file.filename}': {str(e)}"
                    )
        
        # Process multimodal input combining text and images
        try:
            combined_content = process_multimodal_input(
                text_description=description,
                image_paths=saved_file_paths if saved_file_paths else None
            )
        except Exception as e:
            # If multimodal processing fails, fall back to text-only
            print(f"Warning: Multimodal processing failed: {str(e)}")
            combined_content = description
        
        # Generate unique ticket ID
        ticket_id = str(uuid.uuid4())
        
        # Prepare ticket data with combined content
        ticket_data = {
            "ticket_id": ticket_id,
            "title": title.strip(),
            "description": combined_content,
            "severity": severity,
            "category": category,
            "status": "processing",  # Start as processing since we'll initiate workflow
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "resolution": None
        }
        
        # Create ticket in DynamoDB
        created_ticket = db_manager.create_ticket(ticket_data)
        
        # Initiate workflow processing in background task
        background_tasks.add_task(
            process_ticket_workflow,
            ticket_id=ticket_id,
            ticket_content=combined_content
        )
        
        # Return ticket_id and processing status
        return {
            "ticket_id": ticket_id,
            "status": "processing",
            "message": "Ticket submitted successfully and processing has been initiated",
            "files_processed": len(saved_file_paths)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code in ['ExpiredToken', 'ExpiredTokenException']:
            raise HTTPException(
                status_code=401,
                detail="AWS credentials have expired. Please refresh your credentials."
            )
        elif error_code == 'AccessDeniedException':
            raise HTTPException(
                status_code=403,
                detail="Access denied to AWS services. Please check IAM permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"AWS error during ticket submission: {error_message}"
            )
    except Exception as e:
        # Log unexpected errors
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error submitting ticket: {error_trace}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error submitting ticket: {str(e)}"
        )


async def process_ticket_workflow(ticket_id: str, ticket_content: str):
    """
    Background task to process ticket through Haunted Helpdesk workflow.
    
    This function runs asynchronously in the background to avoid blocking
    the API response. It executes the complete multi-agent workflow.
    
    Args:
        ticket_id: Unique identifier of the ticket
        ticket_content: Combined ticket content (text + image analysis)
    """
    import time
    
    try:
        # Initialize Haunted Helpdesk swarm
        swarm = create_Haunted_Helpdesk_swarm()
        
        # Prepare ticket content for workflow
        ticket = db_manager.get_ticket(ticket_id)
        if not ticket:
            print(f"Error: Ticket {ticket_id} not found for background processing")
            return
        
        formatted_content = f"""
Ticket ID: {ticket['ticket_id']}
Title: {ticket['title']}
Description: {ticket_content}
Severity: {ticket['severity']}
Category: {ticket['category']}
Created: {ticket['created_at']}
"""
        
        # Execute swarm with ticket content
        start_time = time.time()
        
        # Log workflow start
        logger.info(f"Background workflow started: ticket_id={ticket_id}, entry_agent=orchestrator_agent")
        
        # Retry logic for AWS Bedrock intermittent errors
        max_retries = 2
        last_error = None
        
        for attempt in range(max_retries):
            try:
                result = swarm.execute(
                    initial_message=formatted_content,
                    starting_agent_name="orchestrator_agent"
                )
                
                execution_time = time.time() - start_time
                
                # Log workflow completion
                logger.info(f"Background workflow completed: ticket_id={ticket_id}, execution_time={execution_time:.2f}s, attempt={attempt+1}")
                print(f"Ticket {ticket_id} workflow completed in {execution_time:.2f} seconds")
                break
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                
                # Check if it's a retryable AWS error
                if "modelstreamerror" in error_str or "unexpected error" in error_str:
                    if attempt < max_retries - 1:
                        logger.warning(f"AWS Bedrock error on attempt {attempt+1}, retrying: {str(e)}")
                        continue
                    else:
                        logger.error(f"AWS Bedrock error after {max_retries} attempts: {str(e)}")
                        raise
                else:
                    # Non-retryable error, raise immediately
                    raise
        
        if last_error and attempt == max_retries - 1:
            raise last_error
        
        # The workflow should update the ticket status through the Ticketing Agent
        # No need to manually update here as the agent handles it
        
    except Exception as e:
        # Log error and update ticket status
        import traceback
        error_trace = traceback.format_exc()
        error_message = str(e)
        
        # Check for specific error types
        is_loop_error = "loop" in error_message.lower() or "repetitive" in error_message.lower()
        is_max_handoffs = "max" in error_message.lower() and "handoff" in error_message.lower()
        is_timeout = "timeout" in error_message.lower() or "timed out" in error_message.lower()
        
        # Log appropriate error type
        if is_loop_error:
            logger.error(f"Loop detected in background workflow: ticket_id={ticket_id}, error={error_message}")
        elif is_max_handoffs:
            logger.error(f"Max handoffs exceeded in background workflow: ticket_id={ticket_id}, error={error_message}")
        elif is_timeout:
            logger.error(f"Background workflow timeout: ticket_id={ticket_id}, error={error_message}")
        else:
            logger.error(f"Error processing ticket {ticket_id} in background: {error_trace}")
        
        print(f"Error processing ticket {ticket_id} in background: {error_trace}")
        
        try:
            # Update ticket to error status with specific error type
            error_resolution = f"Error during workflow processing: {error_message}"
            if is_loop_error:
                error_resolution = f"Loop detected in workflow: {error_message}"
            elif is_max_handoffs:
                error_resolution = f"Max handoffs exceeded: {error_message}"
            elif is_timeout:
                error_resolution = f"Workflow timeout: {error_message}"
            
            error_update = {
                "status": "error",
                "updated_at": datetime.utcnow().isoformat(),
                "resolution": error_resolution
            }
            db_manager.update_ticket(ticket_id, error_update)
        except Exception as update_error:
            logger.error(f"Failed to update ticket status after error: {str(update_error)}")
            print(f"Failed to update ticket status after error: {str(update_error)}")
