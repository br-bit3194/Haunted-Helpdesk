"""
Multimodal Input Processing for Haunted Helpdesk

Processes combined text and image inputs for ticket creation.
Analyzes error screenshots using AI vision capabilities and combines with text descriptions.
"""

import os
from typing import List, Optional, Dict, Any
from strands.agent import Agent
from strands.models.bedrock import BedrockModel


def create_image_analysis_agent() -> Agent:
    """
    Create and configure the Image Analysis Agent for processing error screenshots.
    
    Returns:
        Configured Image Analysis Agent instance
    """
    system_prompt = """You are an Image Analysis Agent specialized in analyzing error screenshots and technical diagrams.

Your role is to extract structured information from images to help diagnose IT issues.

EXTRACTION REQUIREMENTS:
When analyzing an image, you MUST extract and provide the following information:

1. **Problem Description**: A brief summary of what the image shows
2. **Error Details**: Exact error messages, codes, or indicators visible in the image
3. **Affected System/Service**: What system, application, or service is shown
4. **Severity Assessment**: Your assessment of the severity (Minor, Medium, High, Critical)
5. **Technical Context**: Relevant technical details like stack traces, logs, configurations
6. **Recommended Actions**: Initial suggestions based on what you see in the image

OUTPUT FORMAT:
Structure your response with clear sections using the headers above.
Be precise and extract exact text when possible.
If certain information is not visible in the image, state "Not visible in image".

ANALYSIS GUIDELINES:
- Look for error messages, warning dialogs, stack traces
- Identify application names, service names, URLs
- Note any error codes or status codes
- Observe system states (running, stopped, error)
- Check for resource metrics if visible (CPU, memory, disk)
- Look for timestamps that might indicate when the issue occurred

Remember: Your analysis will be combined with user-provided text to create a complete ticket."""

    # Configure Bedrock model with temperature 0.1 for precise extraction
    model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.1
    )
    
    # Create agent with image_reader tool
    agent = Agent(
        name="image_analysis_agent",
        model=model,
        instructions=system_prompt,
        tools=[image_reader]
    )
    
    return agent


def process_multimodal_input(
    text_description: str,
    image_paths: Optional[List[str]] = None
) -> str:
    """
    Process combined text and image inputs for ticket creation.
    
    Args:
        text_description: User-provided text description of the issue
        image_paths: Optional list of file paths to error screenshots
    
    Returns:
        Combined formatted content with text description and image analyses
    """
    # Start with text description
    combined_content = f"**Text Description:**\n{text_description}\n\n"
    
    # Process images if provided
    if image_paths and len(image_paths) > 0:
        try:
            # Create image analysis agent
            analysis_agent = create_image_analysis_agent()
            
            # Analyze each image
            for idx, image_path in enumerate(image_paths, start=1):
                try:
                    # Verify image file exists
                    if not os.path.exists(image_path):
                        raise FileNotFoundError(f"Image file not found: {image_path}")
                    
                    # Use the agent to analyze the image
                    # The image_reader tool will be called by the agent
                    analysis_prompt = (
                        f"Please analyze this error screenshot (located at {image_path}) "
                        "and extract all relevant information following the structured format. "
                        "Use the image_reader tool to read and analyze the image."
                    )
                    
                    # Run the agent with the analysis prompt
                    # The agent will use the image_reader tool internally
                    result = analysis_agent.run(analysis_prompt)
                    
                    # Extract the analysis from the result
                    # The result structure depends on strands_agents implementation
                    if hasattr(result, 'final_response'):
                        analysis_text = result.final_response
                    elif isinstance(result, dict):
                        analysis_text = result.get("response", result.get("final_response", "Analysis completed"))
                    else:
                        analysis_text = str(result)
                    
                    # Add to combined content
                    combined_content += f"**Image Analysis {idx}:**\n{analysis_text}\n\n"
                    
                except FileNotFoundError as fnf_error:
                    # Handle missing file specifically
                    error_msg = f"Image file not found: {str(fnf_error)}"
                    print(error_msg)
                    combined_content += f"**Image Analysis {idx}:**\nUnable to process image - file not found\n\n"
                    
                except Exception as img_error:
                    # Handle individual image processing errors gracefully
                    error_msg = f"Error processing image {idx}: {str(img_error)}"
                    print(error_msg)
                    combined_content += f"**Image Analysis {idx}:**\nUnable to process image - {str(img_error)}\n\n"
                    
        except Exception as e:
            # Handle agent creation or general processing errors gracefully
            error_msg = f"Error in multimodal processing: {str(e)}"
            print(error_msg)
            combined_content += f"\n**Note:** Image analysis unavailable - {str(e)}\n"
    
    return combined_content.strip()
