---
inclusion: always
---

# Technology Stack

## Backend

- **Framework**: FastAPI (Python)
- **AI/LLM**: AWS Bedrock (Claude 3.5 Sonnet)
- **Multi-Agent Framework**: Strands
- **Database**: AWS DynamoDB
- **Server**: Uvicorn (ASGI)

### Key Backend Libraries

```
fastapi>=0.68.0
uvicorn[standard]>=0.15.0
pydantic>=2.0.0
python-multipart>=0.0.6
boto3>=1.28.0
strands-agents>=0.1.0
```

## Frontend

- **Framework**: Next.js 16 (App Router)
- **React**: Version 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Animation**: Framer Motion
- **3D Graphics**: React Three Fiber, Spline
- **HTTP Client**: Axios

## AWS Services

- **AWS Bedrock**: Claude 3.5 Sonnet model for agent intelligence
- **AWS DynamoDB**: Ticket persistence (table: `HauntedHelpdeskTickets`)
- **AWS IAM**: Permissions for Bedrock and DynamoDB access

## Common Commands

### Backend

```bash
# Install dependencies
pip install -r requirements.txt
cd backend && pip install -r requirements.txt

# Run development server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
pytest -v  # verbose
pytest --cov=agents --cov=backend --cov=tools  # with coverage
```

### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test
npm test -- --watch  # watch mode
npm test -- --coverage  # with coverage

# Lint
npm run lint
```

## Environment Configuration

### Backend (.env)

Required AWS credentials and service configuration. See `backend/.env.example` for template.

### Frontend (.env.local)

API endpoint configuration. See `frontend/.env.local.example` for template.

## Development Workflow

1. Backend runs on `http://localhost:8000`
2. Frontend runs on `http://localhost:3000`
3. API documentation available at `http://localhost:8000/docs`
4. CORS configured to allow frontend-backend communication
