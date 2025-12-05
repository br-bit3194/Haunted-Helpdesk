import axios, { AxiosError } from 'axios';

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Spooky error messages for different error types
const SPOOKY_ERROR_MESSAGES: Record<string, string> = {
  network: "The spirits are restless... network connection failed 👻",
  timeout: "The séance timed out... the spirits have gone silent ⏰",
  server: "Something wicked happened on the server side 🎃",
  notFound: "The entity you seek has vanished into the void... 🌑",
  unauthorized: "The crypt keeper denies you entry... 🔒",
  forbidden: "Dark forces prevent you from accessing this realm... ⛔",
  badRequest: "Your incantation was malformed... check your spell 📜",
  conflict: "A spectral conflict has occurred... 👥",
  unknown: "An unknown curse has befallen us... ☠️"
};

// Ticket interfaces
export interface TicketCreate {
  title: string;
  description: string;
  severity: string;
  category: string;
}

export interface Ticket {
  ticket_id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolution?: string;
  workflow_log?: string[];
}

export interface ProcessTicketResponse {
  ticket_id: string;
  status: string;
  workflow_result: {
    final_response: string;
    handoff_sequence: string[];
    execution_time: number;
    terminated_by: string;
    status: string;
  };
}

// Helper function to transform errors to spooky messages
function getSpookyErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network errors (no response)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return SPOOKY_ERROR_MESSAGES.timeout;
      }
      return SPOOKY_ERROR_MESSAGES.network;
    }
    
    // HTTP status code errors
    const status = axiosError.response.status;
    switch (status) {
      case 400:
        return SPOOKY_ERROR_MESSAGES.badRequest;
      case 401:
        return SPOOKY_ERROR_MESSAGES.unauthorized;
      case 403:
        return SPOOKY_ERROR_MESSAGES.forbidden;
      case 404:
        return SPOOKY_ERROR_MESSAGES.notFound;
      case 409:
        return SPOOKY_ERROR_MESSAGES.conflict;
      case 500:
      case 502:
      case 503:
      case 504:
        return SPOOKY_ERROR_MESSAGES.server;
      default:
        return SPOOKY_ERROR_MESSAGES.unknown;
    }
  }
  
  return SPOOKY_ERROR_MESSAGES.unknown;
}

// Generic API request helper with error handling
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: unknown,
  config?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      ...config,
      timeout: 150000, // 150 second (2.5 minute) timeout - workflows can take up to 2 minutes
    });
    
    return response.data;
  } catch (error) {
    const spookyMessage = getSpookyErrorMessage(error);
    throw new Error(spookyMessage);
  }
}

// Tickets API object with all CRUD methods
export const ticketsApi = {
  /**
   * Create a new ticket
   * POST /api/tickets
   */
  create: async (ticketData: TicketCreate): Promise<Ticket> => {
    return apiRequest<Ticket>('POST', '/api/tickets', ticketData);
  },

  /**
   * Get all tickets
   * GET /api/tickets
   */
  getAll: async (): Promise<Ticket[]> => {
    return apiRequest<Ticket[]>('GET', '/api/tickets');
  },

  /**
   * Get a specific ticket by ID
   * GET /api/tickets/{ticket_id}
   */
  getById: async (ticketId: string): Promise<Ticket> => {
    return apiRequest<Ticket>('GET', `/api/tickets/${ticketId}`);
  },

  /**
   * Process a ticket through the workflow
   * POST /api/process-ticket/{ticket_id}
   */
  process: async (ticketId: string): Promise<ProcessTicketResponse> => {
    return apiRequest<ProcessTicketResponse>('POST', `/api/process-ticket/${ticketId}`);
  },

  /**
   * Submit a ticket with multipart form data (text + files)
   * POST /api/submit-ticket
   */
  submitWithFiles: async (formData: FormData): Promise<{ ticket_id: string; status: string }> => {
    return apiRequest<{ ticket_id: string; status: string }>(
      'POST',
      '/api/submit-ticket',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};

// Health check API
export const healthApi = {
  /**
   * Check API health status
   * GET /health
   */
  check: async (): Promise<{ status: string; services: Record<string, string> }> => {
    return apiRequest<{ status: string; services: Record<string, string> }>('GET', '/health');
  },
};

export default ticketsApi;
