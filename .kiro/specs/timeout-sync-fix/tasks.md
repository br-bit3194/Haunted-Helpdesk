# Implementation Plan

- [ ] 1. Update Swarm configuration for better loop detection
  - Reduce `repetitive_handoff_detection_window` from 4 to 3 in `backend/Helpdesk_swarm.py`
  - Verify all timeout parameters are correctly configured
  - Add comments explaining each configuration parameter
  - _Requirements: 3.1, 3.3, 3.5_

- [ ] 2. Enhance Orchestrator Agent with state tracking and termination logic
  - [ ] 2.1 Add workflow state tracking instructions to system prompt
    - Include state machine definition with all 15 states
    - Add state detection logic based on conversation history analysis
    - Add state transition rules
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 2.2 Add termination signal detection to system prompt
    - Add check for TERMINATE_WORKFLOW marker
    - Add check for WORKFLOW_COMPLETE marker
    - Add rule to refuse handoffs when TERMINATED state detected
    - _Requirements: 2.2, 2.4, 4.6_
  
  - [ ] 2.3 Add one-shot handoff rules to system prompt
    - Add "hand off exactly once per state" instruction
    - Add check to prevent duplicate handoffs to same agent
    - Add state-based routing logic
    - _Requirements: 6.2, 6.5_

- [ ] 3. Update Ticketing Agent with explicit termination signals
  - [ ] 3.1 Add TERMINATE_WORKFLOW marker to Scenario 1 response format
    - Update response template for cached resolution path
    - Ensure marker is on its own line after resolution
    - _Requirements: 2.1, 5.1_
  
  - [ ] 3.2 Add TERMINATE_WORKFLOW marker to Scenario 3 response format
    - Update response template for final resolution path
    - Ensure marker is on its own line after resolution summary
    - _Requirements: 2.1, 5.2_
  
  - [ ] 3.3 Add termination state check to system prompt
    - Add instruction to check conversation history for existing termination
    - Add rule to refuse handoffs after terminating
    - Add rule to refuse duplicate terminations
    - _Requirements: 1.2, 1.3, 5.3_

- [ ] 4. Update Memory Agent with one-shot handoff rules
  - Add "hand off to orchestrator exactly once" instruction
  - Add check to prevent duplicate retrieve operations
  - Add check to prevent duplicate store operations
  - Ensure response format consistency (MEMORY_FOUND, NO_MEMORY_FOUND)
  - _Requirements: 6.3_

- [ ] 5. Update Summarization Agent with workflow completion signal
  - Verify WORKFLOW_COMPLETE marker is always included in response
  - Add "hand off to orchestrator exactly once" instruction
  - Add check to prevent duplicate summary generation
  - _Requirements: 2.3, 6.4_

- [ ] 6. Update Worker Agents (Network Diagnostic and Cloud Service) with handoff rules
  - Add "hand off to orchestrator exactly once after resolution" instruction to both agents
  - Add check to prevent duplicate diagnostic operations
  - Ensure resolution format is consistent
  - _Requirements: 6.5_

- [ ] 7. Add structured logging throughout workflow
  - [ ] 7.1 Add workflow start logging in `process_ticket` endpoint
    - Log ticket_id, entry agent, and timestamp
    - _Requirements: 7.1_
  
  - [ ] 7.2 Add handoff logging in workflow execution
    - Log source agent, target agent, and handoff reason
    - _Requirements: 7.2_
  
  - [ ] 7.3 Add termination logging in workflow completion
    - Log termination reason, final agent, and execution time
    - _Requirements: 7.3_
  
  - [ ] 7.4 Add loop detection logging
    - Log detected loop pattern and handoff count
    - _Requirements: 7.4_
  
  - [ ] 7.5 Add handoff sequence to API response
    - Extract handoff sequence from workflow result
    - Include in workflow_result dictionary
    - _Requirements: 7.5_

- [ ] 8. Implement error handling for loop detection
  - Add try-catch for loop detection errors in `process_ticket` endpoint
  - Update ticket status to "error" with loop details
  - Return structured error response with loop pattern
  - _Requirements: 3.1, 3.4_

- [ ] 9. Implement error handling for max handoffs exceeded
  - Add try-catch for max handoffs errors in `process_ticket` endpoint
  - Update ticket status to "error" with handoff count
  - Return structured error response with handoff sequence
  - _Requirements: 3.3_

- [ ] 10. Implement error handling for execution timeout
  - Add try-catch for timeout errors in `process_ticket` endpoint
  - Update ticket status to "error" with execution time
  - Return structured error response with last agent
  - _Requirements: 3.5_

- [ ]* 11. Test workflow termination with cached resolution
  - Create test ticket that matches existing memory
  - Submit ticket and verify workflow follows MEMORY_FOUND path
  - Verify workflow terminates after Ticketing Agent without extra handoffs
  - Verify ticket status is "resolved"
  - Verify handoff sequence is correct: orchestrator → memory → orchestrator → summarization → orchestrator → ticketing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1_

- [ ]* 12. Test workflow termination with new resolution
  - Create test ticket with no memory match
  - Submit ticket and verify workflow follows NO_MEMORY_FOUND path
  - Verify workflow terminates after final Ticketing Agent update
  - Verify ticket status is "resolved"
  - Verify handoff sequence includes all expected agents
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.2_

- [ ]* 13. Test loop detection
  - Create scenario that forces repetitive handoff pattern
  - Verify loop is detected after 3 repetitions
  - Verify workflow terminates with loop error
  - Verify ticket status is "error"
  - Verify error response includes loop pattern
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 14. Test max handoffs enforcement
  - Create scenario that causes many handoffs (if possible)
  - Verify workflow terminates at 20 handoffs
  - Verify ticket status is "error"
  - Verify error response includes handoff count
  - _Requirements: 3.3_

- [ ]* 15. Test execution timeout
  - Create scenario with slow agent response (may need to mock)
  - Verify workflow terminates after 10 minutes
  - Verify ticket status is "error"
  - Verify error response includes execution time
  - _Requirements: 3.5_

- [ ]* 16. Test concurrent workflow independence
  - Submit two different tickets simultaneously
  - Verify both workflows execute independently
  - Verify both workflows terminate correctly
  - Verify ticket statuses are independent
  - _Requirements: 1.5_

- [ ]* 17. Verify logging output
  - Run complete workflow and check logs
  - Verify workflow start is logged
  - Verify all handoffs are logged
  - Verify termination is logged
  - Verify handoff sequence in API response
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Run all workflow tests
  - Verify no endless loops occur
  - Verify all tickets terminate properly
  - Verify error handling works correctly
  - Ask user if any issues arise
