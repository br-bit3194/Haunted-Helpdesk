'use client';

import { useState, useEffect } from 'react';
import { Fog, CandleFlicker } from '@/components/effects';
import {
  GhostOrchestrator,
  SkeletonMemory,
  VampireTicketing,
  WitchNetwork,
  ReaperCloud,
  MummySummarization,
} from '@/components/agents';
import { ticketsApi, type Ticket } from '@/lib/api-client';
import { useTicketWorkflow, type WorkflowLogEntry } from '@/hooks/useTicketWorkflow';

// Agent name to emoji icon mapping
const getAgentIcon = (agentName: string): string => {
  const agentLower = agentName.toLowerCase();
  if (agentLower.includes('orchestrator')) return '👻';
  if (agentLower.includes('memory')) return '💀';
  if (agentLower.includes('ticketing')) return '🧛';
  if (agentLower.includes('network')) return '🧙';
  if (agentLower.includes('cloud')) return '☠️';
  if (agentLower.includes('summarization')) return '🧟';
  return '🎃'; // default
};

// Severity icon mapping
const getSeverityIcon = (severity: string): string => {
  const severityLower = severity.toLowerCase();
  if (severityLower.includes('minor') || severityLower === 'low') return '🦇';
  if (severityLower.includes('poltergeist') || severityLower === 'medium') return '👻';
  if (severityLower.includes('possession') || severityLower === 'high') return '💀';
  if (severityLower.includes('apocalyptic') || severityLower === 'critical') return '☠️';
  return '👻'; // default
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'pending') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cobweb-gray/20 text-cobweb-gray border border-cobweb-gray/30">
        PENDING
      </span>
    );
  }
  
  if (statusLower === 'processing') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-phantom-purple/20 text-phantom-purple border border-phantom-purple/30 animate-pulse">
        PROCESSING
      </span>
    );
  }
  
  if (statusLower === 'resolved') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-spectral-green/20 text-spectral-green border border-spectral-green/30">
        RESOLVED
      </span>
    );
  }
  
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cobweb-gray/20 text-cobweb-gray border border-cobweb-gray/30">
      {status.toUpperCase()}
    </span>
  );
};

// LogEntry component
const LogEntryComponent = ({ entry }: { entry: WorkflowLogEntry }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };
  
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-tombstone/30 rounded border border-phantom-purple/20 hover:border-phantom-purple/40 transition-colors">
      {/* Agent Icon */}
      <div className="text-2xl flex-shrink-0">
        {getAgentIcon(entry.agentName)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Agent Name and Timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-creepster text-bone-white">
            {entry.agentName}
          </span>
          <span className="text-xs text-spectral-green font-mono">
            {formatTime(entry.timestamp)}
          </span>
        </div>
        
        {/* Message */}
        <p className="text-sm text-cobweb-gray break-words">
          {entry.message}
        </p>
      </div>
    </div>
  );
};

// TicketTombstone component
const TicketTombstone = ({ ticket, onExorcise }: { ticket: Ticket; onExorcise?: (ticketId: string) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="relative bg-bg-tombstone border-2 border-cobweb-gray/40 rounded-lg p-4 transition-all duration-300 hover:border-blood-red/60 hover:shadow-lg hover:shadow-blood-red/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="listitem"
      aria-label={`Ticket: ${ticket.title}, Status: ${ticket.status}, Severity: ${ticket.severity}`}
    >
      {/* Severity Icon */}
      <div className="absolute -top-4 -left-4 text-4xl" aria-hidden="true">
        {getSeverityIcon(ticket.severity)}
      </div>
      
      {/* Ticket Content */}
      <div className="ml-6">
        {/* Ticket ID and Status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs text-cobweb-gray font-mono">
            #{ticket.ticket_id.slice(0, 8)}
          </span>
          <StatusBadge status={ticket.status} />
        </div>
        
        {/* Ticket Title */}
        <h3 className="text-lg font-creepster text-bone-white mb-2 line-clamp-2">
          {ticket.title}
        </h3>
        
        {/* Ticket Details */}
        <div className="flex items-center gap-4 text-xs text-cobweb-gray">
          <span className="capitalize">{ticket.category}</span>
          <span>•</span>
          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
        </div>
        
        {/* Hover Action - Exorcise Button */}
        {isHovered && onExorcise && (
          <button
            onClick={() => onExorcise(ticket.ticket_id)}
            className="mt-3 w-full px-4 py-2 bg-gradient-blood-moon text-bone-white font-creepster text-sm rounded border-2 border-blood-red/50 hover:border-blood-red transition-all duration-300 hover:shadow-lg hover:shadow-blood-red/30 focus:outline-none focus:ring-4 focus:ring-blood-red/50"
            aria-label={`Process ticket ${ticket.title}`}
          >
            <span aria-hidden="true">⚰️</span> Exorcise
          </button>
        )}
      </div>
    </div>
  );
};

export default function DemoPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    category: 'other',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Use the workflow hook
  const {
    isProcessing,
    activeAgent,
    logs: seanceLog,
    error: workflowError,
    startWorkflow,
    stopWorkflow,
  } = useTicketWorkflow({
    ticketId: currentTicketId,
    pollingInterval: 2000,
    onWorkflowComplete: (result) => {
      console.log('Workflow completed:', result);
      // Refresh tickets when workflow completes
      fetchTickets();
      // Clear current ticket ID
      setCurrentTicketId(null);
    },
    onError: (error) => {
      console.error('Workflow error:', error);
    },
  });
  
  // Fetch tickets on page load
  useEffect(() => {
    fetchTickets();
  }, []);
  
  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError(null);
      const fetchedTickets = await ticketsApi.getAll();
      setTickets(fetchedTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTicketError(error instanceof Error ? error.message : 'Failed to fetch tickets');
    } finally {
      setIsLoadingTickets(false);
    }
  };
  
  const handleExorcise = async (ticketId: string) => {
    try {
      // Set the current ticket ID and start workflow
      setCurrentTicketId(ticketId);
      await startWorkflow(ticketId);
    } catch (error) {
      console.error('Failed to exorcise ticket:', error);
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'The curse must have a name... 🎃';
    }
    
    // Validate description
    if (!formData.description.trim()) {
      errors.description = 'You must describe the dark details... 📜';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'The spirits need more details (at least 10 characters)... 👻';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };
  
  // Validate and add files
  const handleFiles = (files: File[]) => {
    const errors: Record<string, string> = {};
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    files.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.files = `File "${file.name}" is too large (max 10MB) 💀`;
        return;
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.files = `File "${file.name}" type not supported (use images only) 🦇`;
        return;
      }
      
      validFiles.push(file);
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...errors }));
    } else {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.files;
        return newErrors;
      });
    }
  };
  
  // Remove a selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If files are attached, use multipart submission
      if (selectedFiles.length > 0) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('severity', formData.severity);
        formDataToSend.append('category', formData.category);
        
        selectedFiles.forEach((file) => {
          formDataToSend.append('files', file);
        });
        
        const result = await ticketsApi.submitWithFiles(formDataToSend);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          severity: 'medium',
          category: 'other',
        });
        setSelectedFiles([]);
        
        // Refresh tickets and start workflow
        fetchTickets();
        setCurrentTicketId(result.ticket_id);
        startWorkflow(result.ticket_id);
      } else {
        // Simple ticket creation without files
        const ticket = await ticketsApi.create(formData);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          severity: 'medium',
          category: 'other',
        });
        
        // Refresh tickets and start workflow
        fetchTickets();
        setCurrentTicketId(ticket.ticket_id);
        startWorkflow(ticket.ticket_id);
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to cast the ticket... try again 🎃');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <main id="main-content" className="min-h-screen bg-gradient-haunted relative overflow-hidden" role="main">
      {/* Atmospheric Effects */}
      <Fog opacity={0.15} aria-hidden="true" />
      
      {/* Header */}
      <header className="relative z-10 py-4 sm:py-6 md:py-8 px-4 sm:px-6 border-b-2 border-phantom-purple/30" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-creepster text-pumpkin-orange flex items-center gap-2 sm:gap-4">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">🎃</span>
            <span className="hidden sm:inline">Crypt Control Center</span>
            <span className="sm:hidden">Control Center</span>
          </h1>
          
          <div className="hidden sm:flex items-center gap-4 md:gap-6" aria-hidden="true">
            <CandleFlicker />
            <CandleFlicker />
            <CandleFlicker />
          </div>
          <div className="sm:hidden" aria-hidden="true">
            <CandleFlicker />
          </div>
        </div>
      </header>
      
      {/* Main Content - Three Column Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Ticket Form (1 col) */}
          <div className="lg:col-span-1 order-1">
            <div className="bg-bg-crypt border-2 border-spectral-green/30 rounded-lg p-4 sm:p-6 shadow-lg relative">
              {/* Cobweb decoration */}
              <div className="absolute top-0 right-0 text-cobweb-gray/30 text-4xl" aria-hidden="true">
                🕸️
              </div>
              
              <h2 id="ticket-form-title" className="text-xl sm:text-2xl font-creepster text-spectral-green mb-4 sm:mb-6">
                Cast a Ticket
              </h2>
              
              {/* Submit Error Display */}
              {submitError && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blood-red/10 border-2 border-blood-red/30 rounded-lg" role="alert" aria-live="assertive">
                  <div className="flex items-start gap-2">
                    <div className="text-lg sm:text-xl" aria-hidden="true">⚠️</div>
                    <p className="text-xs sm:text-sm text-blood-red flex-1">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" aria-labelledby="ticket-form-title">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-xs sm:text-sm font-creepster text-bone-white mb-1 sm:mb-2">
                    Curse Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-invalid={!!formErrors.title}
                    aria-describedby={formErrors.title ? 'title-error' : undefined}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-bg-tombstone border-2 rounded text-bone-white placeholder-cobweb-gray/50 focus:outline-none focus:border-spectral-green focus:ring-4 focus:ring-spectral-green/50 transition-colors ${
                      formErrors.title ? 'border-blood-red' : 'border-cobweb-gray/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="e.g., S3 Bucket Vanished"
                  />
                  {formErrors.title && (
                    <p id="title-error" className="mt-1 text-[10px] sm:text-xs text-blood-red flex items-center gap-1" role="alert">
                      <span aria-hidden="true">👻</span>
                      {formErrors.title}
                    </p>
                  )}
                </div>
                
                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-xs sm:text-sm font-creepster text-bone-white mb-1 sm:mb-2">
                    Dark Details
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    rows={3}
                    aria-required="true"
                    aria-invalid={!!formErrors.description}
                    aria-describedby={formErrors.description ? 'description-error' : undefined}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-bg-tombstone border-2 rounded text-bone-white placeholder-cobweb-gray/50 focus:outline-none focus:border-spectral-green focus:ring-4 focus:ring-spectral-green/50 transition-colors resize-none ${
                      formErrors.description ? 'border-blood-red' : 'border-cobweb-gray/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Describe the haunting..."
                  />
                  {formErrors.description && (
                    <p id="description-error" className="mt-1 text-[10px] sm:text-xs text-blood-red flex items-center gap-1" role="alert">
                      <span aria-hidden="true">📜</span>
                      {formErrors.description}
                    </p>
                  )}
                </div>
                
                {/* Severity Field */}
                <div>
                  <label htmlFor="severity" className="block text-xs sm:text-sm font-creepster text-bone-white mb-1 sm:mb-2">
                    Severity
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    aria-label="Select ticket severity level"
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-bg-tombstone border-2 border-cobweb-gray/30 rounded text-bone-white focus:outline-none focus:border-spectral-green focus:ring-4 focus:ring-spectral-green/50 transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="low">🦇 Minor Haunting</option>
                    <option value="medium">👻 Poltergeist</option>
                    <option value="high">💀 Full Possession</option>
                    <option value="critical">☠️ Apocalyptic</option>
                  </select>
                </div>
                
                {/* Category Field */}
                <div>
                  <label htmlFor="category" className="block text-xs sm:text-sm font-creepster text-bone-white mb-1 sm:mb-2">
                    Realm
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    aria-label="Select ticket category or realm"
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-bg-tombstone border-2 border-cobweb-gray/30 rounded text-bone-white focus:outline-none focus:border-spectral-green focus:ring-4 focus:ring-spectral-green/50 transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="network">🧙 Network</option>
                    <option value="cloud">☠️ Cloud</option>
                    <option value="other">🎃 Other</option>
                  </select>
                </div>
                
                {/* File Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-creepster text-bone-white mb-1 sm:mb-2">
                    Cursed Screenshots
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all ${
                      isDragging
                        ? 'border-spectral-green bg-spectral-green/10'
                        : formErrors.files
                        ? 'border-blood-red bg-blood-red/5'
                        : 'border-cobweb-gray/30 bg-bg-tombstone/50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-spectral-green/50'}`}
                  >
                    <input
                      type="file"
                      id="files"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      aria-label="Upload error screenshots"
                      aria-describedby="file-upload-instructions"
                      className="hidden"
                    />
                    <label
                      htmlFor="files"
                      className={`flex flex-col items-center gap-1 sm:gap-2 ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="text-3xl sm:text-4xl" aria-hidden="true">🦴</div>
                      <p id="file-upload-instructions" className="text-xs sm:text-sm text-cobweb-gray">
                        {isDragging ? 'Release the spirits...' : 'Drag & drop or click'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-cobweb-gray/70">
                        Images only, max 10MB
                      </p>
                    </label>
                  </div>
                  
                  {formErrors.files && (
                    <p className="mt-1 text-xs text-blood-red flex items-center gap-1" role="alert">
                      <span aria-hidden="true">⚠️</span>
                      {formErrors.files}
                    </p>
                  )}
                  
                  {/* Selected Files List */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-bg-tombstone/50 rounded border border-cobweb-gray/20"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm">📷</span>
                            <span className="text-xs text-bone-white truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-cobweb-gray/70">
                              ({(file.size / 1024).toFixed(1)}KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            disabled={isSubmitting}
                            className="text-blood-red hover:text-blood-red/80 transition-colors text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-blood-red/50 rounded"
                            aria-label={`Remove file ${file.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label={isSubmitting ? 'Submitting ticket...' : 'Submit ticket'}
                  className={`w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-blood-moon text-bone-white font-creepster text-base sm:text-lg rounded-lg border-2 border-pumpkin-orange/50 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-pumpkin-orange/50 ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-pumpkin-orange hover:shadow-lg hover:shadow-pumpkin-orange/30'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin" aria-hidden="true">🔮</span>
                      <span className="text-sm sm:text-base">Casting...</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">🎃</span>
                      <span className="text-sm sm:text-base">Cast the Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Right Columns - Agent Visualization + Ticket List (2 cols) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2">
            {/* Agent Visualization */}
            <div className="bg-bg-crypt border-2 border-phantom-purple/30 rounded-lg p-4 sm:p-6 shadow-lg">
              <h2 id="workflow-title" className="text-xl sm:text-2xl font-creepster text-phantom-purple mb-3 sm:mb-4">
                Spectral Workflow
              </h2>
              
              {/* Pentagram Circle with Agents */}
              <div className="relative w-full aspect-square max-w-xs sm:max-w-sm md:max-w-md mx-auto" role="region" aria-labelledby="workflow-title" aria-live="polite">
                {/* Pentagram Background SVG */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full opacity-20"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.5))' }}
                >
                  {/* Outer circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="2"
                  />
                  
                  {/* Pentagram star */}
                  <path
                    d="M 100 20 L 120 80 L 180 80 L 130 115 L 150 175 L 100 140 L 50 175 L 70 115 L 20 80 L 80 80 Z"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* Agent Positions in Circle */}
                {/* GhostOrchestrator - Top Center */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-90 md:scale-100">
                  <div className="flex flex-col items-center gap-1 sm:gap-2" role="img" aria-label={`Ghost Orchestrator agent${activeAgent === 'orchestrator' ? ' - currently active' : ''}`}>
                    <GhostOrchestrator isActive={activeAgent === 'orchestrator'} />
                    <span className="text-[10px] sm:text-xs text-spectral-green font-creepster whitespace-nowrap">
                      Orchestrator
                    </span>
                  </div>
                </div>
                
                {/* MummySummarization - Top Left */}
                <div className="absolute top-[15%] left-[5%] -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-90 md:scale-100">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <MummySummarization isActive={activeAgent === 'summarization'} />
                    <span className="text-[10px] sm:text-xs text-pumpkin-orange font-creepster whitespace-nowrap">
                      Summary
                    </span>
                  </div>
                </div>
                
                {/* SkeletonMemory - Top Right */}
                <div className="absolute top-[15%] right-[5%] translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-90 md:scale-100">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <SkeletonMemory isActive={activeAgent === 'memory'} />
                    <span className="text-[10px] sm:text-xs text-bone-white font-creepster whitespace-nowrap">
                      Memory
                    </span>
                  </div>
                </div>
                
                {/* ReaperCloud - Bottom Left */}
                <div className="absolute bottom-[15%] left-[5%] -translate-x-1/2 translate-y-1/2 scale-75 sm:scale-90 md:scale-100">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <ReaperCloud isActive={activeAgent === 'cloud_service'} />
                    <span className="text-[10px] sm:text-xs text-cobweb-gray font-creepster whitespace-nowrap">
                      Cloud
                    </span>
                  </div>
                </div>
                
                {/* WitchNetwork - Bottom Center */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 scale-75 sm:scale-90 md:scale-100">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <WitchNetwork isActive={activeAgent === 'network_diagnostic'} />
                    <span className="text-[10px] sm:text-xs text-phantom-purple font-creepster whitespace-nowrap">
                      Network
                    </span>
                  </div>
                </div>
                
                {/* VampireTicketing - Bottom Right */}
                <div className="absolute bottom-[15%] right-[5%] translate-x-1/2 translate-y-1/2 scale-75 sm:scale-90 md:scale-100">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <VampireTicketing isActive={activeAgent === 'ticketing'} />
                    <span className="text-[10px] sm:text-xs text-blood-red font-creepster whitespace-nowrap">
                      Ticketing
                    </span>
                  </div>
                </div>
                
                {/* Center Processing Indicator */}
                {isProcessing && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="text-4xl sm:text-5xl md:text-6xl animate-spin">
                      🔮
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Séance Log */}
            <div className="bg-bg-crypt border-2 border-phantom-purple/30 rounded-lg p-4 sm:p-6 shadow-lg">
              <h2 id="seance-log-title" className="text-xl sm:text-2xl font-creepster text-phantom-purple mb-3 sm:mb-4">
                Séance Log
              </h2>
              
              {/* Workflow Error Display */}
              {workflowError && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blood-red/10 border-2 border-blood-red/30 rounded-lg" role="alert" aria-live="assertive">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="text-xl sm:text-2xl" aria-hidden="true">⚠️</div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-bold text-blood-red mb-1">
                        Workflow Error
                      </p>
                      <p className="text-xs sm:text-sm text-cobweb-gray">
                        {workflowError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Log Container */}
              <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto space-y-2 sm:space-y-3 pr-2" role="log" aria-labelledby="seance-log-title" aria-live="polite">
                {seanceLog.length === 0 ? (
                  <div className="text-cobweb-gray text-center py-8 sm:py-12">
                    <div className="text-3xl sm:text-4xl mb-2">🕯️</div>
                    <p className="text-sm sm:text-base">The spirits are silent... awaiting a summoning</p>
                  </div>
                ) : (
                  seanceLog.map((entry) => (
                    <LogEntryComponent key={entry.id} entry={entry} />
                  ))
                )}
              </div>
            </div>
            
            {/* Ticket List (Graveyard) */}
            <div className="bg-bg-crypt border-2 border-blood-red/30 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 id="ticket-list-title" className="text-xl sm:text-2xl font-creepster text-blood-red">
                  Ticket Graveyard
                </h2>
                <button
                  onClick={fetchTickets}
                  className="text-xs sm:text-sm text-spectral-green hover:text-spectral-green/80 transition-colors focus:outline-none focus:ring-2 focus:ring-spectral-green/50 rounded px-2 py-1"
                  aria-label="Refresh ticket list"
                >
                  <span aria-hidden="true">🔄</span> <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
              
              {/* Loading State */}
              {isLoadingTickets && (
                <div className="text-cobweb-gray text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-2 animate-spin">🔮</div>
                  <p className="text-sm sm:text-base">Summoning tickets from the void...</p>
                </div>
              )}
              
              {/* Error State */}
              {ticketError && !isLoadingTickets && (
                <div className="text-blood-red text-center py-8 sm:py-12 border-2 border-blood-red/30 rounded-lg bg-blood-red/5">
                  <div className="text-3xl sm:text-4xl mb-2">⚠️</div>
                  <p className="text-sm sm:text-base px-4">{ticketError}</p>
                </div>
              )}
              
              {/* Empty State */}
              {!isLoadingTickets && !ticketError && tickets.length === 0 && (
                <div className="text-cobweb-gray text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-2">🪦</div>
                  <p className="text-sm sm:text-base">The graveyard is empty... no tickets yet</p>
                </div>
              )}
              
              {/* Ticket List */}
              {!isLoadingTickets && !ticketError && tickets.length > 0 && (
                <div className="space-y-4 sm:space-y-6 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-2" role="list" aria-labelledby="ticket-list-title">
                  {tickets.map((ticket) => (
                    <TicketTombstone
                      key={ticket.ticket_id}
                      ticket={ticket}
                      onExorcise={handleExorcise}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
