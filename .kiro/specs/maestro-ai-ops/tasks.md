# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create Haunted Helpdesk root directory with agents/, backend/, tools/, and frontend/ subdirectories
  - Create backend/memories/ and backend/uploads/ directories
  - Create requirements.txt with strands-agents, boto3, fastapi, uvicorn, pydantic, python-multipart
  - Create backend/requirements.txt with FastAPI-specific dependencies
  - Create frontend package.json with Next.js 16, React 19, Tailwind CSS 4, Radix UI, Framer Motion, Axios
  - _Requirements: 1.1, 8.1, 9.1_

- [x] 2. Implement network diagnostic tools
  - Create tools/__init__.py
  - Create tools/network_tools.py with @tool decorators
  - Implement ping_host tool with subprocess execution and timeout handling
  - Implement traceroute_host tool with subprocess execution and timeout handling
  - Implement check_dns_resolution tool with nslookup subprocess execution
  - Add error handling for subprocess failures and timeouts
  - _Requirements: 5.1, 5.2_

- [x] 3. Implement cloud service tools
  - Create tools/cloud_tools.py with @tool decorators
  - Implement list_all_buckets tool using boto3 S3 client
  - Implement get_bucket_location tool using boto3 S3 client
  - Implement check_bucket_exists tool using boto3 head_bucket with error handling
  - Handle ClientError exceptions for 404 (not found) and 403 (access denied)
  - Handle ExpiredToken errors with descriptive messages
  - _Requirements: 6.1, 6.2, 11.1_

- [ ]* 3.1 Write property test for cloud tools error handling
  - **Property 44: ExpiredToken error messaging**
  - **Validates: Requirements 11.1**

- [ ]* 3.2 Write property test for AWS credential safety
  - **Property 45: AWS error message safety**
  - **Validates: Requirements 11.3**

- [x] 4. Implement Memory Agent with storage tools
  - Create agents/__init__.py
  - Create agents/memory_agent.py
  - Implement retrieve_memory tool with JSON file loading and keyword matching
  - Implement store_memory tool with JSON file append and timestamp generation
  - Implement list_memories tool for debugging
  - Create Memory Agent with system prompt defining response formats ("MEMORY_FOUND:" and "NO_MEMORY_FOUND")
  - Configure BedrockModel with temperature 0.3
  - Ensure agent always hands back to orchestrator_agent
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ]* 4.1 Write property test for memory retrieval format
  - **Property 14: MEMORY_FOUND response format**
  - **Property 15: NO_MEMORY_FOUND response format**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 4.2 Write property test for memory storage round-trip
  - **Property 16: Memory storage round-trip**
  - **Property 17: Memory file persistence**
  - **Validates: Requirements 3.4, 3.5**

- [ ]* 4.3 Write property test for Memory Agent handoff
  - **Property 18: Memory Agent always returns to Orchestrator**
  - **Validates: Requirements 3.6**

- [x] 5. Implement Network Diagnostic Agent
  - Create agents/network_diagnostic_agent.py
  - Import network tools (ping_host, traceroute_host, check_dns_resolution)
  - Create Network Diagnostic Agent with system prompt for network troubleshooting
  - Configure agent to format results for Summarization Agent
  - Configure agent to hand off to summarization_agent after completion
  - Configure BedrockModel with temperature 0.3
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 Write property test for network tool execution
  - **Property 24: Network diagnostic tool execution**
  - **Validates: Requirements 5.1, 5.2**

- [ ]* 5.2 Write property test for Network Agent handoff
  - **Property 27: Network Agent hands to Summarization**
  - **Validates: Requirements 5.5**

- [x] 6. Implement Cloud Service Agent
  - Create agents/cloud_service_agent.py
  - Import cloud tools (list_all_buckets, get_bucket_location, check_bucket_exists)
  - Create Cloud Service Agent with system prompt for AWS troubleshooting
  - Configure agent to provide resolution steps
  - Configure agent to hand off to orchestrator_agent with complete resolution
  - Configure BedrockModel with temperature 0.3
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 6.1 Write property test for cloud tool execution
  - **Property 28: Cloud diagnostic tool execution**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 6.2 Write property test for Cloud Agent handoff
  - **Property 31: Cloud Agent hands to Orchestrator**
  - **Validates: Requirements 6.5**

- [x] 7. Implement Summarization Agent
  - Create agents/summarization_agent.py
  - Create Summarization Agent with system prompt for creating 2-3 paragraph summaries
  - Configure system prompt to extract: original issue, steps taken, final resolution, technical details
  - Configure system prompt to append "WORKFLOW_COMPLETE: Summary created successfully. Please update the ticket with this summary."
  - Configure agent to hand off to orchestrator_agent after completion
  - Configure BedrockModel with temperature 0.2 for deterministic output
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ]* 7.1 Write property test for summary structure
  - **Property 32: Summary paragraph count**
  - **Property 33: Summary contains required elements**
  - **Validates: Requirements 7.1, 7.2**

- [ ]* 7.2 Write property test for summary completion marker
  - **Property 34: Summary completion marker**
  - **Validates: Requirements 7.3**

- [ ]* 7.3 Write property test for Summarization Agent handoff
  - **Property 35: Summarization Agent hands to Orchestrator**
  - **Validates: Requirements 7.5**

- [x] 8. Implement Ticketing Agent
  - Create agents/ticketing_agent.py
  - Create Ticketing Agent with system prompt handling three scenarios
  - Scenario 1: Cached resolution (MEMORY_FOUND) → mark RESOLVED → TERMINATE
  - Scenario 2: Raw ticket (NO_MEMORY_FOUND) → analyze/structure → hand to orchestrator
  - Scenario 3: Final resolution → update DynamoDB → TERMINATE
  - Configure BedrockModel with temperature 0.4
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 8.1 Write property test for Ticketing Agent scenarios
  - **Property 19: Cached resolution workflow termination**
  - **Property 20: Raw ticket analysis output**
  - **Property 21: Final resolution persistence**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ]* 8.2 Write property test for termination finality
  - **Property 23: Ticketing Agent termination finality**
  - **Validates: Requirements 4.5**

- [x] 9. Implement Orchestrator Agent
  - Create agents/orchestrator_agent.py
  - Create comprehensive system prompt with MANDATORY WORKFLOW sequence
  - Rule 1: ALWAYS start by handing to memory_agent with full ticket
  - Rule 2: If "MEMORY_FOUND" → summarization_agent → ticketing_agent
  - Rule 3: If "NO_MEMORY_FOUND" → ticketing_agent → worker agent → memory_agent (with "STORE") → summarization_agent → ticketing_agent
  - Rule 4: Route to network_diagnostic_agent for network issues, cloud_service_agent for AWS issues
  - Rule 5: Never restart workflow after ticketing_agent terminates
  - Rule 6: When "WORKFLOW_COMPLETE" seen, immediately hand to ticketing_agent
  - Configure BedrockModel with temperature 0.3
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ]* 9.1 Write property test for first handoff
  - **Property 6: First handoff to Memory Agent**
  - **Validates: Requirements 2.1**

- [ ]* 9.2 Write property test for MEMORY_FOUND routing
  - **Property 7: MEMORY_FOUND routing sequence**
  - **Validates: Requirements 2.2**

- [ ]* 9.3 Write property test for NO_MEMORY_FOUND routing
  - **Property 8: NO_MEMORY_FOUND routing**
  - **Validates: Requirements 2.3**

- [ ]* 9.4 Write property test for worker agent routing
  - **Property 9: Worker agent routing by ticket type**
  - **Validates: Requirements 2.4**

- [ ]* 9.5 Write property test for memory storage request
  - **Property 10: Memory storage request format**
  - **Validates: Requirements 2.5**

- [ ]* 9.6 Write property test for workflow completion
  - **Property 11: WORKFLOW_COMPLETE triggers final handoff**
  - **Property 12: No workflow restart after termination**
  - **Validates: Requirements 2.6, 2.7**

- [x] 10. Implement Haunted Helpdesk Swarm orchestration
  - Create backend/Haunted Helpdesk_swarm.py
  - Import all six agent creation functions
  - Implement create_Haunted Helpdesk_swarm() function
  - Initialize Swarm with all agents in list
  - Configure max_handoffs=20, max_iterations=25
  - Configure execution_timeout=600.0, node_timeout=120.0
  - Configure repetitive_handoff_detection_window=4, repetitive_handoff_min_unique_agents=2
  - Return configured swarm instance
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 11. Implement DynamoDB utilities
  - Create backend/dynamodb_utils.py
  - Implement DynamoDBManager class with __init__ connecting to Haunted HelpdeskTickets table
  - Implement create_ticket method with JSON serialization and put_item
  - Implement get_ticket method with get_item by ticket_id
  - Implement list_tickets method with scan operation
  - Implement update_ticket method with update_item and expression builders
  - Create singleton db_manager instance
  - Add error handling for DynamoDB exceptions
  - _Requirements: 1.3, 4.3, 8.2, 8.3, 8.4, 11.4_

- [ ]* 11.1 Write property test for ticket persistence
  - **Property 3: Ticket persistence round-trip**
  - **Validates: Requirements 1.3**

- [ ]* 11.2 Write property test for DynamoDB error handling
  - **Property 46: DynamoDB error status codes**
  - **Validates: Requirements 11.4**

- [x] 12. Implement multimodal input processing
  - Create backend/multimodal_input.py
  - Import strands_tools image_reader
  - Implement create_image_analysis_agent() with image_reader tool
  - Configure system prompt to extract: problem description, error details, affected system, severity, technical context, recommended actions
  - Configure BedrockModel with temperature 0.1
  - Implement process_multimodal_input() function combining text and image analyses
  - Format output with "**Text Description:**" and "**Image Analysis N:**" sections
  - Handle image processing errors gracefully
  - _Requirements: 1.2, 1.4_

- [ ]* 12.1 Write property test for image analysis structure
  - **Property 2: Image analysis produces structured output**
  - **Validates: Requirements 1.2**

- [ ]* 12.2 Write property test for multimodal combination
  - **Property 4: Multimodal content combination**
  - **Validates: Requirements 1.4**

- [x] 13. Implement FastAPI main application
  - Create backend/main.py
  - Initialize FastAPI app with title and description
  - Add CORS middleware for localhost:3000 and localhost:8000
  - Import DynamoDBManager, create_Haunted Helpdesk_swarm, process_multimodal_input
  - Define Pydantic models: TicketCreate, TicketResponse
  - _Requirements: 8.1, 8.7_

- [x] 14. Implement API health endpoint
  - Implement GET /health endpoint
  - Check AWS Bedrock availability
  - Check DynamoDB table accessibility
  - Return JSON with service statuses
  - _Requirements: 8.1_

- [x] 15. Implement ticket CRUD endpoints
  - Implement POST /api/tickets endpoint with TicketCreate model
  - Generate unique ticket_id using UUID
  - Set initial status to "pending"
  - Call db_manager.create_ticket()
  - Return TicketResponse
  - Implement GET /api/tickets endpoint
  - Call db_manager.list_tickets()
  - Return list of tickets
  - Implement GET /api/tickets/{ticket_id} endpoint
  - Call db_manager.get_ticket()
  - Return 404 if not found, otherwise return ticket
  - _Requirements: 8.2, 8.3, 8.4_

- [ ]* 15.1 Write property test for ticket creation
  - **Property 1: Ticket creation produces unique identifiers**
  - **Property 36: Ticket creation returns identifier**
  - **Validates: Requirements 1.1, 8.2**

- [ ]* 15.2 Write property test for ticket list
  - **Property 37: Ticket list returns array**
  - **Validates: Requirements 8.3**

- [ ]* 15.3 Write property test for ticket retrieval
  - **Property 38: Ticket retrieval by ID**
  - **Validates: Requirements 8.4**

- [x] 16. Implement ticket processing endpoint
  - Implement POST /api/process-ticket/{ticket_id} endpoint
  - Retrieve ticket from DynamoDB
  - Return 404 if ticket not found
  - Update ticket status to "processing"
  - Initialize Haunted Helpdesk swarm
  - Execute swarm with ticket content
  - Serialize swarm result to JSON
  - Return workflow result with handoff sequence and final response
  - _Requirements: 8.5_

- [ ]* 16.1 Write property test for ticket processing
  - **Property 39: Ticket processing initiates workflow**
  - **Validates: Requirements 8.5**

- [x] 17. Implement multipart ticket submission endpoint
  - Implement POST /api/submit-ticket endpoint with File upload support
  - Accept form fields: title, description, severity, category
  - Accept file uploads with multipart/form-data
  - Save uploaded files to backend/uploads/ directory
  - Process multimodal input combining text and images
  - Create ticket with combined content
  - Initiate workflow processing in background task
  - Return ticket_id and processing status
  - _Requirements: 1.1, 1.2, 1.4, 8.6_

- [ ]* 17.1 Write property test for multipart processing
  - **Property 40: Multipart form processing**
  - **Validates: Requirements 8.6**

- [ ]* 17.2 Write property test for empty ticket rejection
  - **Property 5: Empty ticket rejection**
  - **Validates: Requirements 1.5**

- [x] 18. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Set up Next.js frontend project
  - Create frontend/ directory
  - Initialize Next.js 16 with App Router
  - Install dependencies: React 19, TypeScript 5, Tailwind CSS 4
  - Install UI libraries: Radix UI components, Framer Motion, Axios
  - Install @splinetool/react-spline for 3D graphics
  - Create src/app/, src/components/, src/lib/, src/hooks/ directories
  - _Requirements: 9.1, 9.2_

- [x] 20. Configure Tailwind CSS with Halloween theme
  - Create tailwind.config.ts with custom color palette
  - Define colors: bg-void, bg-crypt, bg-tombstone, pumpkin-orange, blood-red, spectral-green, phantom-purple, bone-white, cobweb-gray
  - Define custom animations: float, rattle, cackle, bite, hover-menace, unwrap
  - Define gradient utilities: bg-gradient-haunted, bg-gradient-blood-moon, bg-gradient-ectoplasm
  - Create src/app/globals.css with theme variables and animations
  - Import Creepster font from Google Fonts
  - Add scrollbar styling
  - _Requirements: 9.1, 9.2_

- [x] 21. Implement API client
  - Create src/lib/api-client.ts
  - Define API_BASE_URL from environment variable
  - Define spooky error messages object
  - Implement ticketsApi object with methods: create, getAll, getById, process
  - Implement apiRequest helper function with error handling
  - Transform errors to spooky messages
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 22. Implement atmospheric effect components
  - Create src/components/effects/FloatingGhosts.tsx with upward floating animation
  - Create src/components/effects/Bats.tsx with random flight patterns
  - Create src/components/effects/SpiderWeb.tsx with corner placement and spider
  - Create src/components/effects/Fog.tsx with bottom gradient overlay
  - Create src/components/effects/CandleFlicker.tsx with flame animation and glow
  - Use Framer Motion for all animations
  - _Requirements: 9.1_

- [x] 23. Implement agent character components
  - Create src/components/agents/GhostOrchestrator.tsx with ethereal SVG, glowing eyes, baton, float animation
  - Create src/components/agents/SkeletonMemory.tsx with skull SVG, memory orbs, scroll, rattle animation
  - Create src/components/agents/VampireTicketing.tsx with cape SVG, fangs, ticket, bite animation
  - Create src/components/agents/WitchNetwork.tsx with hat SVG, crystal ball, network nodes, cackle animation
  - Create src/components/agents/ReaperCloud.tsx with robe SVG, cloud scythe, AWS logo, hover-menace animation
  - Create src/components/agents/MummySummarization.tsx with bandages SVG, glowing eyes, TL;DR scroll, unwrap animation
  - Each component accepts isActive prop for conditional animation
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 24. Implement landing page
  - Create src/app/page.tsx
  - Add atmospheric effects: SpiderWeb (both corners), FloatingGhosts (5), Bats (8), Fog
  - Add blood moon background element
  - Implement hero section with animated "Haunted Helpdesk" title using Framer Motion
  - Add tagline "Where IT Nightmares Come to Die"
  - Add CTA buttons: "Enter the Crypt" (link to /demo) and "View Grimoire" (GitHub link)
  - Implement feature cards section: AI Possession, Spectral Swarm, Eternal Memory
  - Implement agent showcase section with all six agent characters and descriptions
  - Apply Halloween color scheme and Creepster font
  - _Requirements: 9.1_

- [x] 25. Implement demo control center page
  - Create src/app/demo/page.tsx
  - Add Fog effect with opacity 0.15
  - Implement header with "🎃 Crypt Control Center" title and three CandleFlicker components
  - Create three-column layout: ticket form (1 col), agent visualization + ticket list (2 cols)
  - _Requirements: 9.2_

- [x] 26. Implement ticket submission form
  - In demo page, create ticket submission form section
  - Add cobweb decoration SVG in corner
  - Implement form fields: Curse Title (text), Dark Details (textarea), Severity (select), Realm (select)
  - Severity options: Minor Haunting, Poltergeist, Full Possession, Apocalyptic
  - Realm options: Network, Cloud, Other
  - Implement drag & drop file upload zone with bone icon
  - Add "🎃 Cast the Ticket" submit button with gradient styling
  - Connect form to API client for ticket submission
  - _Requirements: 9.3_

- [x] 27. Implement agent workflow visualization
  - In demo page, create agent visualization section
  - Add pentagram background SVG with circle
  - Position six agent components in circle layout using absolute positioning
  - GhostOrchestrator: top center
  - SkeletonMemory: top right
  - VampireTicketing: bottom right
  - WitchNetwork: bottom center
  - ReaperCloud: bottom left
  - MummySummarization: top left
  - Add center processing indicator with spinning crystal ball emoji when processing
  - Manage activeAgent state to highlight current agent
  - _Requirements: 9.4_

- [ ]* 27.1 Write property test for active agent visualization
  - **Property 41: Active agent visualization**
  - **Validates: Requirements 9.4**

- [x] 28. Implement séance log component
  - In demo page, create séance log section below agent visualization
  - Display scrollable log with max height
  - Implement LogEntry component with agent icon, timestamp, and message
  - Map agent names to emoji icons
  - Update log in real-time as workflow progresses
  - Style with phantom-purple heading and spectral-green timestamps
  - _Requirements: 9.5_

- [ ]* 28.1 Write property test for handoff log entries
  - **Property 42: Handoff log entries**
  - **Validates: Requirements 9.5**

- [x] 29. Implement ticket graveyard (list view)
  - In demo page, create ticket list section
  - Implement TicketTombstone component with ticket details
  - Display severity icon (🦇 Minor, 👻 Medium, 💀 High, ☠️ Critical)
  - Display ticket ID, title, and status badge
  - Status colors: pending (gray), processing (purple with pulse), resolved (green)
  - Add hover effect showing "Exorcise" button
  - Fetch tickets from API on page load
  - Update list when new tickets are created
  - _Requirements: 9.6_

- [ ]* 29.1 Write property test for ticket status indicators
  - **Property 43: Ticket status indicators**
  - **Validates: Requirements 9.6**

- [x] 30. Implement real-time workflow updates
  - Create custom hook useTicketWorkflow for managing workflow state
  - Poll /api/process-ticket/{ticket_id} endpoint for updates
  - Parse handoff sequence to determine active agent
  - Update séance log with new handoff events
  - Update ticket status in graveyard when workflow completes
  - Handle workflow errors and display spooky error messages
  - _Requirements: 9.4, 9.5_

- [x] 31. Add form validation and error handling
  - Validate ticket title is non-empty
  - Validate description is non-empty and not just whitespace
  - Display validation errors below form fields
  - Handle file upload errors (size, type)
  - Display API errors with spooky themed messages
  - Add loading states during submission
  - _Requirements: 1.5_

- [x] 32. Implement responsive design
  - Add mobile breakpoints for landing page
  - Adjust agent circle layout for smaller screens
  - Make ticket form and graveyard stack vertically on mobile
  - Ensure all animations work on mobile devices
  - Test on various screen sizes
  - _Requirements: 9.1, 9.2_

- [x] 33. Add accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works for all forms and buttons
  - Add alt text to decorative SVG elements
  - Ensure color contrast meets WCAG standards
  - Add focus indicators for keyboard users
  - Test with screen readers
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 34. Create environment configuration files
  - Create backend/.env.example with AWS credentials template
  - Create frontend/.env.local.example with API URL template
  - Document all environment variables in README
  - Add .env files to .gitignore
  - _Requirements: 8.1_

- [x] 35. Create comprehensive README
  - Document project overview and architecture
  - List all requirements and prerequisites
  - Provide AWS setup instructions (Bedrock access, DynamoDB table, IAM permissions)
  - Provide backend setup instructions (dependencies, environment, running)
  - Provide frontend setup instructions (dependencies, environment, running)
  - Document API endpoints with examples
  - Document agent workflow sequence
  - Add troubleshooting section
  - Include testing scenarios
  - Add screenshots of UI
  - _Requirements: All_

- [x] 36. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
