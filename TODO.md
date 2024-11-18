# Legacy Migration & Implementation Progress & Technical Requirements

## Legacy Components for Adaptation

### 1. UI Components & Layouts

- Navigation bar from `Schedule2.html`
  - Responsive design
  - Logo placement
  - Menu structure
- Services cards from `About.html`
  - Card layout
  - Action buttons
  - Image placement
- Footer component
  - Link structure
  - Social media integration

## 2. Booking System (`scriptUser.js`)

- Time slot selection logic
- Availability checking
- Booking confirmation flow
- Class capacity management

## 3. Schedule Management (`script3.js`)

- Time interval generation (15-min slots)
- Duration calculations
- Schedule display grid
- Class type filtering

## 4. Financial Tracking

- Payment processing
- Transaction recording
- Report generation
- PDF export functionality

## TODOs

## Client Layer (`src/components`, `src/pages`, `src/context`)

- [x] Portal separation (client, practitioner, admin, staff)
- [ ] Subscriber implementation for:
  - [ ] Appointments
  - [ ] Messages
  - [ ] Notifications
  - [ ] Products
- [ ] WebSocket client setup for real-time updates

**Technical Requirements:**

- React (`src/components`, `src/pages`)
  - Rationale: Simpler learning curve, large community support, and sufficient for current needs
- React Router DOM (`src/App.jsx`, `src/pages`)
  - Rationale: De-facto routing solution for React, provides declarative routing
- React Context for state management (`src/context`)
  - Rationale: Built into React, sufficient for our needs without Redux complexity and verbosity
- WebSocket client (`src/services/websocket.js`)
  - Rationale: Enable real-time pub/sub communication with server

### Backend Layer (Supabase) (`src/services`, `src/hooks`, `server/`)

- [x] Database and API setup
- [ ] Real-time subscriptions setup
- [ ] WebSocket server implementation
- [ ] Message broker integration
- [ ] Event handlers for pub/sub patterns

**Technical Requirements:**

- Supabase Client (`src/services/api/index.js`)
  - Rationale: Takes care of both database and authentication
- Redis (`server/broker.js`)
  - Rationale: Message broker for pub/sub architecture
- WebSocket Server (`server/websocket.js`)
  - Rationale: Handle real-time bidirectional communication

### Data Layer (`src/services`, `supabase/migrations`, `server/events`)

- [x] PostgreSQL Database setup (via Supabase)
- [ ] Row Level Security policies
- [ ] Database triggers and functions
- [ ] Event sourcing implementation
- [ ] Message queue setup

**Technical Requirements:**

- PostgreSQL (managed by Supabase) (`supabase/migrations`)
  - Rationale: Built-in to Supabase, powerful relational database
- Database migrations (via Supabase CLI) (`supabase/migrations`)
  - Rationale: Version control for database schema
- Redis Pub/Sub (`server/events`)
  - Rationale: Handle event distribution in pub/sub architecture
- Event Store (`server/eventStore.js`)
  - Rationale: Maintain event history for pub/sub system

## 📋 Feature Implementation

### Authentication & Authorization (`src/context/AuthContext`, `src/services/auth.js`)

- [x] Login/Logout system
- [x] Role-based access
- [x] Session management
- [ ] Auto logout on inactivity
- [ ] Social auth providers integration (e.g. Google, etc)
- [ ] 2FA setup for elevated roles (i.e. non-client roles) (TBD)
- [ ] WebSocket authentication

**Technical Requirements:**

- Supabase Auth (`src/services/auth.js`)
  - Rationale: Handles authentication, session management, and security
- Row Level Security (defined in Supabase dashboard)
  - Rationale: Fine-grained access control at the database level
- Custom claims and policies (defined in Supabase dashboard)
  - Rationale: Role-based access control implementation

### Appointment System (`src/pages/client/appointments`, `src/services/appointments.js`, `server/publishers`)

- [ ] Schedule display
- [ ] Booking system
- [ ] Updates handling
- [ ] Real-time availability updates
- [ ] Appointment event publishing

**Technical Requirements:**

- date-fns
  - Rationale: Lightweight date manipulation, tree-shakeable
- Redis Pub/Sub
  - Rationale: Real-time appointment updates distribution
- WebSocket
  - Rationale: Push updates to subscribed clients

### Communication System (`src/components/messaging`, `src/services/messaging.js`, `server/publishers`)

- [ ] Messaging
- [ ] Notifications
- [ ] Email notifications
- [ ] Real-time message delivery
- [ ] Message event publishing

**Technical Requirements:**

- WebSocket for real-time features (`src/services/websocket.js`)
  - Rationale: Real-time message delivery to subscribers
- Redis Pub/Sub (`server/publishers/messaging.js`)
  - Rationale: Message event distribution
- Nodemailer (`src/services/email.js`)
  - Rationale: Email notifications for subscribers

### Financial Management (`src/components/financial`, `src/services/payments.js`, `server/publishers`)

- [ ] Payment processing
- [ ] Reports
- [ ] Invoices
- [ ] Transaction event publishing

**Technical Requirements:**

- Paypal sandbox for payments (`src/services/payments.js`)
  - Rationale: Easy to setup and use for testing
- html-pdf for PDF generation (`src/services/pdf.js`)
  - Rationale: Convert HTML/CSS to PDF, customizable templates
- Redis Pub/Sub (`server/publishers/transactions.js`)
  - Rationale: Transaction event distribution

## 👥 Team Division

### Frontend Team

Focus areas:

- Component architecture
- Form handling
- API integration
- UI/UX implementation

### Backend Team

Focus areas:

- API development
- Database design
- Authentication
- Business logic

## 🔄 Development Process

1. Core setup
   - Project structure
   - Basic routing
   - Database schema
2. Authentication system
3. Basic CRUD operations
4. Advanced features
5. Testing & optimization

## 📝 Notes

- Keep dependencies minimal
- Focus on core functionality first
- Document API endpoints
- Include error handling
- Write tests using Jest
  - Rationale: Built-in with React, good assertion library
