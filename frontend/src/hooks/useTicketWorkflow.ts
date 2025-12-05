import { useState, useEffect, useCallback, useRef } from 'react';
import { ticketsApi, type ProcessTicketResponse, type Ticket } from '@/lib/api-client';

// Log entry interface
export interface WorkflowLogEntry {
  id: string;
  agentName: string;
  message: string;
  timestamp: Date;
}

// Workflow state interface
export interface WorkflowState {
  isProcessing: boolean;
  activeAgent: string | null;
  logs: WorkflowLogEntry[];
  error: string | null;
  workflowResult: ProcessTicketResponse | null;
}

// Hook options
interface UseTicketWorkflowOptions {
  ticketId: string | null;
  pollingInterval?: number; // milliseconds
  onWorkflowComplete?: (result: ProcessTicketResponse) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for managing ticket workflow state
 * Polls the /api/process-ticket/{ticket_id} endpoint for updates
 * Parses handoff sequence to determine active agent
 * Updates séance log with new handoff events
 */
export function useTicketWorkflow({
  ticketId,
  pollingInterval = 2000, // Poll every 2 seconds
  onWorkflowComplete,
  onError,
}: UseTicketWorkflowOptions) {
  const [state, setState] = useState<WorkflowState>({
    isProcessing: false,
    activeAgent: null,
    logs: [],
    error: null,
    workflowResult: null,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedHandoffsRef = useRef<Set<string>>(new Set());
  const isProcessingRef = useRef(false);

  // Helper to extract agent name from handoff string
  const extractAgentName = useCallback((handoff: string): string => {
    // Handoff format might be like "orchestrator_agent" or "Orchestrator Agent"
    // Normalize to lowercase and remove "_agent" suffix
    const normalized = handoff.toLowerCase().replace(/_agent$/, '').replace(/\s+agent$/, '');
    return normalized;
  }, []);

  // Helper to create log entry from handoff
  const createLogEntry = useCallback((handoff: string, index: number): WorkflowLogEntry => {
    const agentName = extractAgentName(handoff);
    
    // Create descriptive message based on agent
    let message = '';
    if (agentName.includes('orchestrator')) {
      message = 'Routing ticket through the spectral workflow...';
    } else if (agentName.includes('memory')) {
      message = 'Searching the ancient scrolls for past resolutions...';
    } else if (agentName.includes('ticketing')) {
      message = 'Processing ticket and updating status...';
    } else if (agentName.includes('network')) {
      message = 'Performing network diagnostics and analysis...';
    } else if (agentName.includes('cloud')) {
      message = 'Investigating cloud services and AWS resources...';
    } else if (agentName.includes('summarization')) {
      message = 'Creating concise summary of the resolution...';
    } else {
      message = `Agent ${handoff} is now active...`;
    }

    return {
      id: `${Date.now()}-${index}`,
      agentName: handoff,
      message,
      timestamp: new Date(),
    };
  }, [extractAgentName]);

  // Process workflow result and update state
  const processWorkflowResult = useCallback((result: ProcessTicketResponse) => {
    const handoffSequence = result.workflow_result?.handoff_sequence || [];
    
    // Create log entries for new handoffs
    const newLogs: WorkflowLogEntry[] = [];
    handoffSequence.forEach((handoff, index) => {
      const handoffKey = `${handoff}-${index}`;
      if (!processedHandoffsRef.current.has(handoffKey)) {
        processedHandoffsRef.current.add(handoffKey);
        newLogs.push(createLogEntry(handoff, index));
      }
    });

    // Determine active agent (last in sequence if still processing)
    const isComplete = result.workflow_result?.status === 'success' || 
                       result.status === 'resolved';
    const activeAgent = isComplete 
      ? null 
      : handoffSequence.length > 0 
        ? extractAgentName(handoffSequence[handoffSequence.length - 1])
        : null;

    setState(prev => ({
      ...prev,
      logs: [...prev.logs, ...newLogs],
      activeAgent,
      isProcessing: !isComplete,
      workflowResult: result,
      error: null,
    }));

    // Call completion callback if workflow is complete
    if (isComplete && onWorkflowComplete) {
      onWorkflowComplete(result);
    }

    return isComplete;
  }, [createLogEntry, extractAgentName, onWorkflowComplete]);

  // Poll for workflow updates
  const pollWorkflowStatus = useCallback(async () => {
    if (!ticketId || isProcessingRef.current) {
      return;
    }

    try {
      isProcessingRef.current = true;
      
      // Fetch ticket to check status
      const ticket: Ticket = await ticketsApi.getById(ticketId);
      
      // If ticket is still pending, it hasn't been processed yet
      if (ticket.status === 'pending') {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          activeAgent: null,
        }));
        return;
      }

      // If ticket is processing or resolved, try to get workflow result
      if (ticket.status === 'processing' || ticket.status === 'resolved') {
        try {
          const result = await ticketsApi.process(ticketId);
          const isComplete = processWorkflowResult(result);
          
          // Stop polling if workflow is complete
          if (isComplete && pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } catch (error) {
          // If we get an error, the workflow might not have started yet
          // or might be in progress, so we'll keep polling
          console.log('Workflow not ready yet, continuing to poll...');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workflow status';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Stop polling on error
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [ticketId, processWorkflowResult, onError]);

  // Start workflow processing
  const startWorkflow = useCallback(async (newTicketId: string) => {
    // Reset state
    setState({
      isProcessing: true,
      activeAgent: null,
      logs: [],
      error: null,
      workflowResult: null,
    });
    processedHandoffsRef.current.clear();

    // Add initial log entry
    setState(prev => ({
      ...prev,
      logs: [{
        id: `${Date.now()}-init`,
        agentName: 'System',
        message: '🔮 Initiating spectral workflow...',
        timestamp: new Date(),
      }],
    }));

    try {
      // Trigger workflow processing
      const result = await ticketsApi.process(newTicketId);
      processWorkflowResult(result);

      // Start polling for updates
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(pollWorkflowStatus, pollingInterval);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start workflow';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [pollingInterval, processWorkflowResult, pollWorkflowStatus, onError]);

  // Stop workflow polling
  const stopWorkflow = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isProcessing: false,
      activeAgent: null,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startWorkflow,
    stopWorkflow,
  };
}
