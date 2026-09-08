# Weekly Report Generator & Team Dashboard

A full-stack web application for managing weekly reports with role-based access control, review workflows, and team analytics.

##  Features

### For Team Members:
-  Create and manage weekly reports
- Track tasks, blockers, and achievements
-  Submit reports for manager review
- View version history after revisions
- Time tracking across categories

### For Managers/Admin:
- Review and approve team reports
- Request changes with comments
- Team analytics dashboard
- Track submission compliance
- AI assistant for insights
- Full project management (CRUD)
- User management & role assignment

### Technical Features:
- JWT authentication with bcrypt
- Role-Based Access Control (2 roles: Team Member & Manager)
- Report versioning system
- Automated testing (Jest + Supertest)
- RESTful API design
- MongoDB with Mongoose ODM
- TypeScript for type safety
- Input validation
- Security headers (Helmet, CORS)
- Rate limiting

##  Advanced Technical Implementations (Assignment Features)
We successfully integrated several "good to have" and advanced architectural requirements:
- **Google Gemini 2.5 AI Assistant:** Instead of basic RAG, we built a Direct REST API integration securely piped into the Node.js backend. It seamlessly parses and feeds massive context logic directly into Google's latest model architecture to generate Executive Summaries, Workload Imbalance reports, and Blocker Detection for managers.
- **RBAC Security Filtering:** Endpoints strictly distinguish managers from team members, utilizing robust HTTP JSON Web Token implementations.
- **Form UI/UX Defect Mitigations:** Successfully bypassed and re-routed problematic browser logic (e.g. Chrome's invasive Auto-fill logic) to enforce strict manager usability.

## Tech Stack

### Backend:
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT + bcryptjs
- **Validation:** express-validator
- **Testing:** Jest + Supertest
- **AI Integration:** Google Gemini 2.5 Flash (Direct API)

### Frontend:
- **Framework:** React 18 + TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS + Custom Animations
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Icons:** Lucide React
## Project Structure

```
project/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── __tests__/      # Jest test files
│   │   ├── config/         # Configuration (DB, env)
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database seeding
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   ├── app.ts          # Express app
│   │   └── server.ts       # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── src/                    # React frontend
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── ...
│
├── API_DOCUMENTATION.md    # Complete API docs
├── FRONTEND_INTEGRATION.md # Frontend setup guide
└── README.md              # This file
```

##  Quick Start

### Prerequisites:
- Node.js 18+
- MongoDB Compass (Local Installation) or MongoDB Atlas (Cloud)
- npm or yarn

### Backend Setup:

```bash
# Navigate to backend

cd backend

# Install dependencies
npm install



# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URI (e.g. mongodb://localhost:27017/weekly-reports for MongoDB Compass)

# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration

MONGODB_URI=mongodb://localhost:27017/weekly-reports

# JWT Configuration
JWT_SECRET=your jwt_secret_ky
JWT_EXPIRES_IN=7d

# OpenAI Configuration (for AI Assistant)
OPENAI_API_KEY=your_openai_key_gemini_2,5

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=1000
RATE_LIMIT_MAX_REQUESTS=100




# Seed database with demo data
npm run seed

# Start development server
npm run dev
```

Backend runs on: **http://localhost:5000**

### Frontend Setup:

```bash
# Install dependencies
npm install

# Configure environment
# Create .env file:
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

##  Testing

```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
```

##  Documentation

- **All technical documentation, security protocols, API notes, and deployment architectures are organically compiled directly within this single README source of truth.**

## Test Accounts

**Primary Testing Manager:**
- Email: `sarfan@gmail.com`
- Password: `Password123!`

*Note on New Users: Managers can dynamically generate new Team Members from the "Users" admin dashboard. Generating a new user will instantly spawn an auto-generated (or custom) password that the Manager can copy and email directly to the team member so they can log in to their personal dashboard.*

##  API Endpoints

### Authentication:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Reports (Team Member):
- `GET /api/reports/my-history` - Get my reports
- `POST /api/reports` - Create report
- `GET /api/reports/:id` - Get report details
- `PUT /api/reports/:id` - Update report
- `POST /api/reports/:id/submit` - Submit report
- `GET /api/reports/:id/versions` - Version history

### Manager:
- `GET /api/manager/reports` - Team reports
- `POST /api/manager/reports/:id/review` - Review report
- `GET /api/manager/analytics/summary` - Analytics
- `GET /api/manager/analytics/charts` - Chart data

### Projects:
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (Manager)
- `PUT /api/projects/:id` - Update project (Manager)
- `DELETE /api/projects/:id` - Delete project (Admin)

### AI Assistant:
- `POST /api/ai/chat` - Chat with AI (Manager)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.

##  RBAC Rules

### Team Member:
- Manage their own reports
- Cannot view other team member reports
- Cannot access manager routes

### Manager:
- View all team reports
- Review and approve reports
- Access analytics
- Manage projects

### Admin:
- All manager permissions
- Manage user roles
- Delete projects

##  Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration
- Rate limiting (100 req/15min)
- Input validation
- Error sanitization
- MongoDB injection prevention

## 🔧 Development

### Backend Scripts:
```bash
npm run dev       # Development with auto-reload
npm run build     # Build TypeScript to JavaScript
npm start         # Production server
npm run seed      # Seed database
npm test          # Run tests
npm run lint      # Lint code
```

### Frontend Scripts:
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

##  Database Schema

### Collections:
- **users** - User accounts and roles
- **projects** - Project definitions
- **reports** - Weekly reports with embedded tasks
- **reportversions** - Version snapshots
- **reviewcomments** - Review audit trail

### Advanced Database Schema Output Knowledge
This is an explicit example of the internal raw MongoDB schema used for Manager test credentials:
```json
{
  "_id": { "$oid": "6a9c60084b749ecda8e41edd" },
  "name": "Sarah Manager",
  "email": "sarfan@gmail.com",
  "password": "$2a$10$wbgyRtGiVjiFxUX0XOBvJuug0Wb9IpnfkXANIFk9BcJQLyurxzJEy",
  "role": "MANAGER",
  "department": "Engineering",
  "avatarUrl": null,
  "createdAt": { "$date": "2026-09-05T18:31:36.307Z" },
  "updatedAt": { "$date": "2026-09-06T08:23:06.601Z" },
  "__v": 0
}
```

## AI Chat Assistant Documentation
As an advanced optional enhancement, we have successfully integrated an AI-powered conversational assistant to help managers oversee their teams. The AI is designed to synthesize qualitative and quantitative data across multiple reports, extracting the highest-value insights.

**Approach & Architecture**:
We implemented a **Direct API Integration with Context Injection** approach using the **Google Gemini (2.5 Flash)** LLM. 
1. **In-App Widget:** A beautifully styled, floating React chat widget (`AIChatWidget.tsx`) is injected exclusively into the Manager's dashboard environment.
2. **REST API Middleware:** The frontend communicates with a secure Node.js internal endpoint (`POST /ai/chat`). 
3. **Data Aggregation:** The backend intercepts the manager's query and performs a MongoDB aggregation, fetching the team's most recent reports.
4. **LLM Synthesis:** The reports are formatted into a highly condensed plain-text schema (including hours, task statuses, and blocker descriptors) and prefixed securely to the user's prompt as invisible system context.

**Prompt Design Engineering**:
The system prompt is explicitly engineered to enforce the core constraints of the prompt assignment, guaranteeing hyper-relevant outputs even to generic questions:
> "You are an Executive AI assistant helping a manager analyze their team's weekly reports. Whenever asked for a summary or insights, explicitly focus on: Highlighting completed work and key achievements, Identifying recurring open blockers across the team, Detecting workload imbalances."

**Data Privacy Considerations**:
As with any LLM integration processing internal employment data, strict PII protocols have been established:
1. **Selective Hydration:** The backend actively filters the MongoDB documents before sending them to Gemini. Passwords, phone numbers, and arbitrary metadata are strictly stripped.
2. **RBAC Isolation:** The `POST /ai/chat` endpoint is shielded by strict Role-Based Access Control JWT middleware. Team members physically cannot hit the AI endpoint.
3. **Stateless Transmission:** We are transmitting data to the Gemini API securely over HTTPS. The LLM interaction acts completely statelessly, meaning no sensitive corporate IP is being cached long-term inside our backend.

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Run linter before committing

## License

MIT License

##  Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP

### CORS Error
- Verify `CORS_ORIGIN` in backend `.env`
- Check frontend is using correct API URL

### Port Already in Use
- Change `PORT` in backend `.env`
- Kill process using the port

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify token is not expired

## Support

For issues and questions:
1. Check documentation
2. Review test files for examples
3. Check API responses for error messages

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
