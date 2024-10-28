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

## Client Layer

- [x] Portal separation (client, practitioner, admin, staff)
- [ ] Subscriber implementation for:
  - [ ] Appointments
  - [ ] Messages
  - [ ] Notifications
  - [ ] Products

**Technical Requirements:**

- React
  - Rationale: Simpler learning curve, large community support, and sufficient for current needs
- React Router DOM
  - Rationale: De-facto routing solution for React, provides declarative routing
- Axios for API calls
  - Rationale: Consistent API across browsers, built-in request/response interceptors, better error handling than fetch
- React Context for state management
  - Rationale: Built into React, sufficient for our needs without Redux complexity

### Server Layer

- [ ] REST API Gateway
- [ ] Publishers implementation
- [ ] Core Services setup

**Technical Requirements:**

- Express.js
  - Rationale: Lightweight, flexible, great middleware ecosystem
- JSON Web Tokens (jsonwebtoken)
  - Rationale: Stateless authentication, reduces database load
- Express Validator
  - Rationale: Request validation middleware, prevents malformed data
- CORS middleware
  - Rationale: Secure cross-origin requests handling
- Nodemailer for emails
  - Rationale: Well-maintained, supports multiple email services

### Data Layer

- [ ] MySQL Database setup
- [ ] Caching strategy (TBD)

**Technical Requirements:**

- MySQL
  - Rationale: Team familiarity, ACID compliance, good for relational data
- mysql2 package
  - Rationale: Better performance than mysql package, supports promises
- Database migrations (using node-mysql-migrate)
  - Rationale: Version control for database schema

## 📋 Feature Implementation

### Authentication & Authorization

- [ ] Login/Logout system
- [ ] Role-based access
- [ ] Session management
- [ ] Auto logout on inactivity

**Technical Requirements:**

- bcrypt for password hashing
  - Rationale: Industry standard, secure salt generation
- express-session for sessions
  - Rationale: Session handling with optional Redis support later
- Cookie handling
  - Rationale: Secure session management

### Appointment System

- [ ] Schedule display
- [ ] Booking system
- [ ] Updates handling

**Technical Requirements:**

- FullCalendar
  - Rationale: Feature-rich, handles complex scheduling scenarios
- date-fns
  - Rationale: Lightweight date manipulation, tree-shakeable
- Socket.IO (if real-time needed)
  - Rationale: Bi-directional communication, fallback options

### Communication System

- [ ] Messaging
- [ ] Notifications
- [ ] Email notifications

**Technical Requirements:**

- Socket.IO for real-time features
  - Rationale: Handles WebSocket with fallbacks, room support
- Nodemailer
  - Rationale: Email sending with template support

### Financial Management

- [ ] Payment processing
- [ ] Reports
- [ ] Invoices

**Technical Requirements:**

- Stripe for payments
  - Rationale: Well-documented, secure, handles compliance
- html-pdf for PDF generation
  - Rationale: Convert HTML/CSS to PDF, customizable templates

## 👥 Team Division

### Frontend Team (2 members)

Focus areas:

- Component architecture
- Form handling (react-hook-form)
  - Rationale: Performance, minimal re-renders
- API integration
- UI/UX implementation

### Backend Team (2 members)

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
