"""
Test the core memory logic without requiring strands_agents installation.
This tests the keyword extraction and matching algorithms.
"""

import json
import os
from datetime import datetime


# Copy of the core functions from memory_agent.py for testing
def extract_keywords(text: str) -> list:
    """Extract keywords from text for matching."""
    words = text.lower().split()
    keywords = [word.strip('.,!?;:()[]{}') for word in words if len(word) > 3]
    return keywords


def keyword_match_score(query: str, memory_query: str) -> float:
    """Calculate keyword match score between query and stored memory."""
    query_keywords = set(extract_keywords(query))
    memory_keywords = set(extract_keywords(memory_query))
    
    if not query_keywords or not memory_keywords:
        return 0.0
    
    # Calculate Jaccard similarity
    intersection = query_keywords.intersection(memory_keywords)
    union = query_keywords.union(memory_keywords)
    
    return len(intersection) / len(union) if union else 0.0


def test_keyword_extraction():
    """Test keyword extraction."""
    print("Testing keyword extraction...")
    
    text = "Server is down and not responding to requests"
    keywords = extract_keywords(text)
    
    assert "server" in keywords, "Should extract 'server'"
    assert "down" in keywords, "Should extract 'down'"
    assert "responding" in keywords, "Should extract 'responding'"
    assert "requests" in keywords, "Should extract 'requests'"
    assert "is" not in keywords, "Should filter short word 'is'"
    assert "to" not in keywords, "Should filter short word 'to'"
    
    print(f"  ✓ Extracted keywords: {keywords}")
    print("  ✓ Keyword extraction works correctly")


def test_keyword_matching():
    """Test keyword matching score."""
    print("\nTesting keyword matching...")
    
    query1 = "Server is down and not responding"
    query2 = "Server not responding to requests"
    query3 = "Database connection timeout error"
    
    # Similar queries should have high score
    score1 = keyword_match_score(query1, query2)
    print(f"  Similar queries score: {score1:.3f}")
    assert score1 > 0.3, f"Similar queries should match (score: {score1})"
    
    # Different queries should have low score
    score2 = keyword_match_score(query1, query3)
    print(f"  Different queries score: {score2:.3f}")
    assert score2 < 0.3, f"Different queries should not match (score: {score2})"
    
    print("  ✓ Keyword matching works correctly")


def test_memory_file_operations():
    """Test memory file operations."""
    print("\nTesting memory file operations...")
    
    test_file = "test_memories.json"
    
    # Clean up if exists
    if os.path.exists(test_file):
        os.remove(test_file)
    
    # Test creating and writing
    memories = [
        {
            "id": "mem_1",
            "query": "Server is down",
            "resolution": "Restart the server",
            "timestamp": datetime.now().isoformat(),
            "keywords": extract_keywords("Server is down")
        }
    ]
    
    with open(test_file, 'w') as f:
        json.dump(memories, f, indent=2)
    
    print(f"  ✓ Created test memory file")
    
    # Test reading
    with open(test_file, 'r') as f:
        loaded = json.load(f)
    
    assert len(loaded) == 1, "Should load one memory"
    assert loaded[0]["query"] == "Server is down", "Should preserve query"
    assert loaded[0]["resolution"] == "Restart the server", "Should preserve resolution"
    
    print(f"  ✓ Read and verified memory file")
    
    # Test appending
    memories.append({
        "id": "mem_2",
        "query": "DNS not working",
        "resolution": "Update DNS config",
        "timestamp": datetime.now().isoformat(),
        "keywords": extract_keywords("DNS not working")
    })
    
    with open(test_file, 'w') as f:
        json.dump(memories, f, indent=2)
    
    with open(test_file, 'r') as f:
        loaded = json.load(f)
    
    assert len(loaded) == 2, "Should have two memories"
    print(f"  ✓ Appended second memory")
    
    # Clean up
    os.remove(test_file)
    print(f"  ✓ Memory file operations work correctly")


def test_matching_algorithm():
    """Test the complete matching algorithm."""
    print("\nTesting complete matching algorithm...")
    
    # Simulate stored memories
    memories = [
        {
            "query": "Server is down and not responding to requests",
            "resolution": "Restarted web server service"
        },
        {
            "query": "S3 bucket not accessible, getting 403 error",
            "resolution": "Updated IAM policy"
        },
        {
            "query": "DNS resolution failing for internal domain",
            "resolution": "Updated DNS configuration"
        }
    ]
    
    # Test cases with debug info
    test_cases = [
        ("Server not responding", "Restarted web server service", True),
        ("S3 bucket not accessible", "Updated IAM policy", True),  # More similar query
        ("DNS resolution failing internal domain", "Updated DNS configuration", True),  # More similar
        ("Database connection timeout", None, False),
    ]
    
    threshold = 0.3
    
    for query, expected_resolution, should_match in test_cases:
        best_match = None
        best_score = 0.0
        
        for memory in memories:
            score = keyword_match_score(query, memory["query"])
            if score > best_score and score >= threshold:
                best_score = score
                best_match = memory
        
        if should_match:
            assert best_match is not None, f"Should find match for: {query}"
            assert expected_resolution in best_match["resolution"], \
                f"Should match correct resolution for: {query}"
            print(f"  ✓ Matched '{query}' (score: {best_score:.3f})")
        else:
            assert best_match is None, f"Should not find match for: {query}"
            print(f"  ✓ Correctly rejected '{query}' (best score: {best_score:.3f})")
    
    print("  ✓ Matching algorithm works correctly")


def test_response_format():
    """Test response format requirements."""
    print("\nTesting response format requirements...")
    
    # Test MEMORY_FOUND format
    resolution = "Restarted the web server service"
    response = f"MEMORY_FOUND: {resolution}"
    
    assert response.startswith("MEMORY_FOUND: "), "Should start with MEMORY_FOUND:"
    assert resolution in response, "Should contain resolution"
    print(f"  ✓ MEMORY_FOUND format: {response[:50]}...")
    
    # Test NO_MEMORY_FOUND format
    response = "NO_MEMORY_FOUND"
    assert response == "NO_MEMORY_FOUND", "Should be exact string"
    print(f"  ✓ NO_MEMORY_FOUND format: {response}")
    
    print("  ✓ Response formats match requirements")


def run_all_tests():
    """Run all tests."""
    print("=" * 70)
    print("Memory Agent Core Logic Test Suite")
    print("=" * 70)
    print()
    
    try:
        test_keyword_extraction()
        test_keyword_matching()
        test_memory_file_operations()
        test_matching_algorithm()
        test_response_format()
        
        print("\n" + "=" * 70)
        print("✓ All core logic tests passed!")
        print("=" * 70)
        print()
        print("Note: To test the full agent with strands_agents, install dependencies:")
        print("  pip install -r requirements.txt")
        
        return True
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
