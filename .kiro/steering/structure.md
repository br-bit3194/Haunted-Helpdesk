---
inclusion: always
---

# Project Structure

## Root Directory

```
/
├── backend/          # FastAPI backend application
├── frontend/         # Next.js frontend application
├── sounds/           # Audio assets (background music)
├── 3d_model/         # 3D model files (.glb)
├── docs/             # Documentation
└── *.md              # Implementation guides and documentation
```

## Backend Structure

```
backend/
├── agents/                    # AI agent implementations
│   ├── orchestrator_agent.py  # Central routing agent
│   ├── memory_agent.py        # Memory storage/retrieval
│   ├── ticketing_agent.py     # Ticket processing
│   ├── network_diagnostic_agent.py  # Network diagnostics
│   ├── cloud_service_agent.py # AWS/cloud operations
│   └── summarization_agent.py # Resolution summaries
├── tools/                     # Agent tool functions
│   ├── network_tools.py       # Ping, traceroute, DNS
│   └── cloud_tools.py         # S3, AWS diagnostics
├── memories/                  # JSON memory storage
├── uploads/                   # User-uploaded files
├── main.py                    # FastAPI application entry
├── Helpdesk_swarm.py         # Swarm orchestration config
├── dynamodb_utils.py         # DynamoDB operations
├── multimodal_input.py       # Image/text processing
└── requirements.txt          # Python dependencies
```

## Frontend Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Home page
│   │   ├── demo/              # Demo/ticket submission page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── agents/            # Agent character components
│   │   ├── effects/           # Visual effects (fog, glitch, etc.)
│   │   ├── Model3DViewer.tsx  # 3D model viewer
│   │   └── ScaryEffects.tsx   # Combined effects
│   ├── hooks/                 # Custom React hooks
│   │   ├── useScaryAudio.ts   # Audio management
│   │   ├── useTicketWorkflow.ts  # Ticket workflow state
│   │   ├── useMouseTracking.ts   # Mouse interaction
│   │   └── useModelAnimations.ts # 3D animations
│   └── lib/                   # Utilities
│       ├── api-client.ts      # Backend API client
│       └── audioManager.ts    # Audio system
├── public/
│   ├── models/                # 3D model files
│   └── sounds/                # Audio files
├── package.json
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Conventions

### Backend

- **Agent naming**: All agents end with `_agent` suffix (e.g., `orchestrator_agent`)
- **Tool functions**: Defined in `tools/` directory, imported by agents
- **API routes**: Prefixed with `/api/` (e.g., `/api/tickets`, `/api/submit-ticket`)
- **Error handling**: AWS credential errors handled gracefully with user-friendly messages
- **Logging**: Structured logging for workflow tracking

### Frontend

- **Component organization**: Grouped by function (agents, effects, etc.)
- **Naming**: PascalCase for components, camelCase for hooks
- **Styling**: Tailwind utility classes with custom Halloween theme colors
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation support
- **Performance**: Dynamic imports for 3D components, reduced effects on mobile

### Styling Theme

Custom Tailwind colors defined in `tailwind.config.ts`:
- `pumpkin-orange`: Primary accent (#ff6b35)
- `blood-red`: Error/danger (#8b0000)
- `spectral-green`: Success/active (#39ff14)
- `phantom-purple`: Secondary accent (#9d4edd)
- `bone-white`: Text/foreground (#f8f8ff)
- `cobweb-gray`: Muted text (#4a4a4a)
- `bg-void`, `bg-crypt`, `bg-tombstone`: Background shades

### API Communication

- Backend exposes REST API on port 8000
- Frontend consumes API via axios client in `lib/api-client.ts`
- CORS enabled for localhost development
- Multipart form data for file uploads
- JSON for standard requests/responses
