"""
Memory Agent for Haunted Helpdesk

Provides persistent memory capabilities for storing and retrieving past resolutions.
Uses JSON file storage with keyword matching for resolution retrieval.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from strands.agent import Agent
from strands.tools import tool
from strands.models.bedrock import BedrockModel


# Memory file path
MEMORY_FILE_PATH = "backend/memories/Haunted Helpdesk_memories.json"


def _ensure_memory_file_exists() -> None:
    """Ensure the memory file and directory exist."""
    os.makedirs(os.path.dirname(MEMORY_FILE_PATH), exist_ok=True)
    if not os.path.exists(MEMORY_FILE_PATH):
        with open(MEMORY_FILE_PATH, 'w') as f:
            json.dump([], f)


def _load_memories() -> List[Dict[str, Any]]:
    """Load all memories from the JSON file."""
    _ensure_memory_file_exists()
    try:
        with open(MEMORY_FILE_PATH, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_memories(memories: List[Dict[str, Any]]) -> None:
    """Save memories to the JSON file."""
    _ensure_memory_file_exists()
    with open(MEMORY_FILE_PATH, 'w') as f:
        json.dump(memories, f, indent=2)


def _extract_keywords(text: str) -> List[str]:
    """Extract keywords from text for matching."""
    # Simple keyword extraction: lowercase, split by whitespace, remove short words
    words = text.lower().split()
    keywords = [word.strip('.,!?;:()[]{}') for word in words if len(word) > 3]
    return keywords


def _keyword_match_score(query: str, memory_query: str) -> float:
    """Calculate keyword match score between query and stored memory."""
    query_keywords = set(_extract_keywords(query))
    memory_keywords = set(_extract_keywords(memory_query))
    
    if not query_keywords or not memory_keywords:
        return 0.0
    
    # Calculate Jaccard similarity
    intersection = query_keywords.intersection(memory_keywords)
    union = query_keywords.union(memory_keywords)
    
    return len(intersection) / len(union) if union else 0.0


@tool
def retrieve_memory(query: str) -> str:
    """
    Search memory store for matching resolutions using keyword matching.
    
    Args:
        query: The issue description to search for
    
    Returns:
        String in format "MEMORY_FOUND: [resolution]" if match found,
        or "NO_MEMORY_FOUND" if no match exists
    """
    try:
        memories = _load_memories()
        
        if not memories:
            return "NO_MEMORY_FOUND"
        
        # Find best matching memory (threshold: 0.3 similarity)
        best_match = None
        best_score = 0.0
        threshold = 0.3
        
        for memory in memories:
            score = _keyword_match_score(query, memory.get('query', ''))
            if score > best_score and score >= threshold:
                best_score = score
                best_match = memory
        
        if best_match:
            resolution = best_match.get('resolution', '')
            return f"MEMORY_FOUND: {resolution}"
        else:
            return "NO_MEMORY_FOUND"
            
    except Exception as e:
        # On error, return NO_MEMORY_FOUND to allow workflow to continue
        print(f"Error retrieving memory: {str(e)}")
        return "NO_MEMORY_FOUND"


@tool
def store_memory(query: str, resolution: str) -> str:
    """
    Store a new resolution in the memory store.
    
    Args:
        query: The original issue description
        resolution: The solution that resolved the issue
    
    Returns:
        Confirmation message with memory ID
    """
    try:
        memories = _load_memories()
        
        # Create new memory entry
        memory_entry = {
            "id": f"mem_{len(memories) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "query": query,
            "resolution": resolution,
            "timestamp": datetime.now().isoformat(),
            "keywords": _extract_keywords(query)
        }
        
        # Append to memories
        memories.append(memory_entry)
        
        # Save to file
        _save_memories(memories)
        
        return f"Memory stored successfully with ID: {memory_entry['id']}"
        
    except Exception as e:
        return f"Error storing memory: {str(e)}"


@tool
def list_memories() -> str:
    """
    List all stored memories for debugging purposes.
    
    Returns:
        JSON string of all memory entries
    """
    try:
        memories = _load_memories()
        
        if not memories:
            return "No memories stored yet."
        
        # Format memories for display
        summary = f"Total memories: {len(memories)}\n\n"
        for memory in memories:
            summary += f"ID: {memory.get('id', 'unknown')}\n"
            summary += f"Query: {memory.get('query', '')[:100]}...\n"
            summary += f"Timestamp: {memory.get('timestamp', 'unknown')}\n"
            summary += "---\n"
        
        return summary
        
    except Exception as e:
        return f"Error listing memories: {str(e)}"


def create_memory_agent() -> Agent:
    """
    Create and configure the Memory Agent.
    
    Returns:
        Configured Memory Agent instance
    """
    system_prompt = """You are the Memory Agent in the Haunted Helpdesk multi-agent system.

Your role is to manage the persistent memory of past incident resolutions.

CRITICAL RESPONSE FORMATS:
1. When you find a matching resolution, you MUST respond EXACTLY in this format:
   "MEMORY_FOUND: [the resolution text]"

2. When you do NOT find a matching resolution, you MUST respond EXACTLY:
   "NO_MEMORY_FOUND"

3. When storing a new resolution, confirm the storage operation.

WORKFLOW RULES:
- You have three tools: retrieve_memory, store_memory, and list_memories
- When you receive a ticket query, use retrieve_memory to search for similar past issues
- When you receive an explicit request to STORE a resolution, use store_memory
- ALWAYS use the exact response formats above
- After completing ANY operation, you MUST hand back to the orchestrator_agent
- NEVER continue processing after your task is complete

KEYWORD MATCHING:
- The retrieve_memory tool uses keyword matching to find similar issues
- It extracts keywords from the query and compares with stored memories
- A similarity threshold determines if a match is found

Remember: Your responses must follow the exact formats specified above for the workflow to function correctly."""

    # Configure Bedrock model with temperature 0.3
    model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.3
    )
    
    # Create agent with tools
    agent = Agent(
        name="memory_agent",
        model=model,
        system_prompt=system_prompt,
        tools=[retrieve_memory, store_memory, list_memories]
    )
    
    return agent
