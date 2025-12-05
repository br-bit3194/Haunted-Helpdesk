# useTicketWorkflow Hook

## Overview

The `useTicketWorkflow` hook manages real-time workflow updates for ticket processing in the Haunted Helpdesk system. It polls the backend API to track agent handoffs, updates the active agent visualization, and maintains a log of workflow events.

## Features

- **Real-time Polling**: Automatically polls the `/api/process-ticket/{ticket_id}` endpoint every 2 seconds (configurable)
- **Agent Tracking**: Parses handoff sequences to determine which agent is currently active
- **Log Management**: Creates descriptive log entries for each agent handoff with timestamps
- **Error Handling**: Catches and displays spooky-themed error messages
- **Workflow Completion**: Detects when workflow completes and triggers callbacks
- **Automatic Cleanup**: Stops polling when workflow completes or component unmounts

## Usage

```typescript
import { useTicketWorkflow } from '@/hooks/useTicketWorkflow';

function MyComponent() {
  const {
    isProcessing,
    activeAgent,
    logs,
    error,
    workflowResult,
    startWorkflow,
    stopWorkflow,
  } = useTicketWorkflow({
    ticketId: currentTicketId,
    pollingInterval: 2000,
    onWorkflowComplete: (result) => {
      console.log('Workflow completed:', result);
    },
    onError: (error) => {
      console.error('Workflow error:', error);
    },
  });

  // Start processing a ticket
  const handleProcess = async (ticketId: string) => {
    await startWorkflow(ticketId);
  };

  return (
    <div>
      {isProcessing && <p>Processing...</p>}
      {activeAgent && <p>Active Agent: {activeAgent}</p>}
      {logs.map(log => <div key={log.id}>{log.message}</div>)}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## API

### Options

- `ticketId`: The ID of the ticket to track (can be null)
- `pollingInterval`: How often to poll for updates in milliseconds (default: 2000)
- `onWorkflowComplete`: Callback fired when workflow completes
- `onError`: Callback fired when an error occurs

### Return Values

- `isProcessing`: Boolean indicating if workflow is currently running
- `activeAgent`: Name of the currently active agent (null if not processing)
- `logs`: Array of workflow log entries with agent names, messages, and timestamps
- `error`: Error message if something went wrong (null otherwise)
- `workflowResult`: Complete workflow result from the backend
- `startWorkflow(ticketId)`: Function to initiate workflow for a ticket
- `stopWorkflow()`: Function to stop polling and reset state

## Agent Name Mapping

The hook automatically creates descriptive messages for each agent:

- **Orchestrator**: "Routing ticket through the spectral workflow..."
- **Memory**: "Searching the ancient scrolls for past resolutions..."
- **Ticketing**: "Processing ticket and updating status..."
- **Network Diagnostic**: "Performing network diagnostics and analysis..."
- **Cloud Service**: "Investigating cloud services and AWS resources..."
- **Summarization**: "Creating concise summary of the resolution..."

## Implementation Details

### Polling Strategy

1. When `startWorkflow()` is called, it triggers the `/api/process-ticket/{ticket_id}` endpoint
2. A polling interval is set up to check for updates every 2 seconds
3. Each poll fetches the ticket status and workflow result
4. New handoffs are detected and added to the log
5. Polling stops automatically when workflow completes or an error occurs

### Handoff Tracking

The hook maintains a Set of processed handoffs to avoid duplicate log entries. Each handoff is tracked by combining the agent name and its index in the sequence.

### State Management

All state is managed internally using React hooks:
- `useState` for the main workflow state
- `useRef` for polling interval, processed handoffs, and processing flag
- `useCallback` for memoized helper functions
- `useEffect` for cleanup on unmount

## Requirements Validated

This implementation satisfies the following requirements:

- **Requirement 9.4**: Visualizes active agent in pentagram circle layout
- **Requirement 9.5**: Updates séance log with timestamped entries for agent handoffs
