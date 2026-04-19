# Induja HRM - Architecture & Design Documentation

## Overview

Induja HRM is a comprehensive HR management system designed to track employee metrics, attendance, leaves, tools/materials, and organizational hierarchy across multiple companies. The application enforces strict role-based access control with admin and manager scopes.

---

## Technology Stack

### Frontend
- **React 19** with TypeScript for UI components
- **Tailwind CSS 4** for styling with minimal, rounded design
- **wouter** for client-side routing
- **tRPC** for end-to-end type-safe API communication
- **Recharts** for data visualization (heatmaps, charts)
- **shadcn/ui** for pre-built accessible components
- **Lucide React** for icons

### Backend
- **Express 4** for HTTP server
- **tRPC 11** for RPC procedures
- **Drizzle ORM** for database abstraction
- **MySQL/TiDB** for data persistence
- **Node.js** runtime

### Development
- **Vite** for fast build and dev server
- **Vitest** for unit testing
- **TypeScript 5.9** for type safety
- **pnpm** for package management

---

## Database Schema

### Core Tables

#### `companies`
Represents organizational units. Admins can manage all companies; managers are scoped to their company.

```
- id (PK)
- name
- location
- createdAt
- updatedAt
```

#### `departments`
Organizational divisions within a company.

```
- id (PK)
- companyId (FK)
- name
- description
- createdAt
- updatedAt
```

#### `job_roles`
Job titles and role definitions.

```
- id (PK)
- companyId (FK)
- name
- description
- createdAt
- updatedAt
```

#### `employees`
Core employee records with hierarchical relationships.

```
- id (PK)
- companyId (FK)
- departmentId (FK)
- jobRoleId (FK)
- managerId (FK, self-referential for hierarchy)
- firstName
- lastName
- email
- phone
- location
- dateOfBirth
- employeeCode (unique)
- joiningDate
- status (active, on_leave, inactive, terminated)
- profilePhotoUrl
- createdAt
- updatedAt
```

#### `attendance`
Daily attendance records with check-in/check-out times.

```
- id (PK)
- employeeId (FK)
- attendanceDate
- status (present, absent, half_day, sick_leave)
- checkInTime
- checkOutTime
- createdAt
- updatedAt
```

#### `leave_types`
Predefined leave categories (Sick, Vacation, Personal, etc.).

```
- id (PK)
- companyId (FK)
- name
- description
- createdAt
- updatedAt
```

#### `leave_requests`
Employee leave applications with approval workflow.

```
- id (PK)
- employeeId (FK)
- leaveTypeId (FK)
- managerId (FK, approver)
- startDate
- endDate
- days
- reason
- status (pending, approved, rejected, cancelled)
- approvalNotes
- createdAt
- updatedAt
```

#### `leave_balances`
Tracks remaining leave days per employee per leave type.

```
- id (PK)
- employeeId (FK)
- leaveTypeId (FK)
- totalDays
- usedDays
- remainingDays
- year
- createdAt
- updatedAt
```

#### `tools`
Inventory of tools and materials.

```
- id (PK)
- companyId (FK)
- serialNumber (unique)
- name
- description
- status (available, assigned, damaged, retired)
- purchaseDate
- purchasePrice
- createdAt
- updatedAt
```

#### `tool_assignments`
Tracks tool assignments to employees.

```
- id (PK)
- toolId (FK)
- employeeId (FK)
- assignedDate
- returnedDate
- condition (good, fair, damaged)
- status (assigned, returned)
- createdAt
- updatedAt
```

#### `activity_log`
Audit trail for login/logout and system events.

```
- id (PK)
- employeeId (FK)
- activityType (login, logout, attendance_check_in, attendance_check_out)
- timestamp
- details (JSON)
- createdAt
```

#### `open_positions`
Tracks unfilled job openings.

```
- id (PK)
- companyId (FK)
- departmentId (FK)
- jobRoleId (FK)
- count
- status (open, filled, closed)
- createdAt
- updatedAt
```

---

## API Architecture (tRPC Procedures)

### Authentication & Authorization

All procedures use role-based access control:

- **`publicProcedure`**: Available to all users (auth status, logout)
- **`protectedProcedure`**: Requires authentication
- **`adminProcedure`**: Admin role only (company management, system config)
- **`managerProcedure`**: Manager+ roles (team management, approvals)

### Procedure Groups

#### `auth`
- `me`: Get current user
- `logout`: Clear session

#### `companies`
- `list`: Get all companies (admin only)
- `getById`: Get company details with resources
- `getWithResources`: Get company + employees + tools + positions

#### `employees`
- `list`: Get employees by company
- `getById`: Get employee details
- `create`: Create new employee (admin only)
- `update`: Update employee info
- `getDirectReports`: Get direct reports for a manager
- `getAllReports`: Get all subordinates (recursive)

#### `attendance`
- `recordAttendance`: Check-in/check-out
- `getByEmployee`: Get attendance history
- `getByDepartment`: Get department attendance heatmap
- `getTodayStats`: Get present/absent counts

#### `leaves`
- `request`: Submit leave request
- `getByEmployee`: Get employee's leave requests
- `approve`: Manager approves leave
- `reject`: Manager rejects leave
- `getBalance`: Get leave balance for employee

#### `tools`
- `listByCompany`: Get company's tools
- `assign`: Assign tool to employee
- `returnTool`: Return tool from employee
- `getActiveAssignments`: Get current assignments

#### `reference`
- `getDepartments`: Get department list
- `getJobRoles`: Get job role list
- `getLeaveTypes`: Get leave type list
- `getOpenPositions`: Get open positions

#### `dashboard`
- `getKPIs`: Get KPI metrics (total employees, present today, on leave, etc.)
- `getRecentActivity`: Get login/logout feed

#### `hierarchy`
- `getOrgChart`: Get manager's org chart with direct/indirect reports

---

## Frontend Architecture

### Page Structure

```
/
├── Dashboard              → KPI cards, heatmap, activity feed
├── Companies              → Company list (admin only)
├── Employees              → Employee list with search/filter
├── Employees/:id          → Employee detail page
├── Attendance             → Attendance tracking & history
├── Leaves                 → Leave requests & approvals
├── Tools & Materials      → Tools inventory & assignments
└── Hierarchy              → Org chart visualization
```

### Component Hierarchy

```
App
├── DashboardLayout
│   ├── Sidebar (Navigation)
│   │   ├── Dashboard
│   │   ├── Companies
│   │   ├── Employees
│   │   ├── Attendance
│   │   ├── Leaves
│   │   ├── Tools & Materials
│   │   └── Hierarchy
│   ├── User Profile (Footer)
│   └── Main Content Area
```

### State Management

- **Authentication**: `useAuth()` hook from context
- **Data Fetching**: tRPC queries with React Query
- **Form State**: React `useState` with validation
- **Mutations**: tRPC mutations with optimistic updates

---

## UI/UX Design

### Visual Direction

- **Color Palette**:
  - Primary: Soft Teal (#14B8A6)
  - Accent: Coral (#FF6B6B)
  - Background: White (#FFFFFF)
  - Text: Dark Gray (#1F2937)

- **Typography**:
  - Headlines: Bold, tracking-tight
  - Body: Regular weight, readable line-height
  - Labels: Small, medium weight

- **Components**:
  - Rounded corners (border-radius: 8px)
  - Soft shadows for depth
  - Minimal borders, prefer background colors
  - Icons from Lucide React

### Key UI Patterns

#### KPI Cards
Six cards displaying:
1. Total Employees
2. Present Today
3. On Leave
4. Open Positions
5. Tools Assigned
6. Attendance Rate

#### Attendance Heatmap
Grid visualization showing:
- Rows: Departments
- Columns: Days of week
- Color intensity: Attendance percentage

#### Activity Feed
Recent login/logout events with:
- Employee name
- Timestamp
- Activity type
- Status badge

#### Employee List
Table with:
- Name, Email, Department, Status
- Search & filter by department
- Click to view detail page

#### Leave Request Form
Modal/card with:
- Date range picker
- Leave type dropdown
- Reason textarea
- Submit/Cancel buttons

#### Org Chart
Tree visualization showing:
- Manager at top
- Direct reports below
- Expandable nodes for subordinates
- Click to view employee details

---

## Security & Access Control

### Role-Based Access Control (RBAC)

#### Admin Role
- View all companies and resources
- Create/edit/delete employees
- Manage tools and materials
- View system-wide reports
- Approve/reject leaves (for their reports)

#### Manager Role
- View only their company
- View direct and indirect reports
- Approve/reject leaves for their team
- Track team attendance
- Assign tools to team members

#### User Role
- View own profile
- Request leaves
- View own attendance
- View assigned tools

### Data Scoping

- **Admins**: No company scope restriction
- **Managers**: Scoped to employees in their reporting hierarchy
- **Users**: Scoped to own records only

### Authentication Flow

1. User clicks "Sign in"
2. Redirected to Manus OAuth portal
3. OAuth callback to `/api/oauth/callback`
4. Session cookie created with JWT
5. User context available in all procedures

---

## Testing Strategy

### Unit Tests (Vitest)

- **Role-based access control**: Verify FORBIDDEN errors for unauthorized access
- **Data integrity**: Verify attendance/leave/tool operations
- **Calculations**: Verify KPI metrics and leave balance calculations

### Integration Tests

- **Complete workflows**: Leave request → Approval → Balance update
- **Hierarchical queries**: Manager viewing full org chart
- **Cross-module operations**: Employee creation → Attendance tracking

### Test Coverage

- `server/routers.test.ts`: 16+ tests covering RBAC and data operations
- `server/auth.logout.test.ts`: Authentication flow tests

---

## Deployment & Hosting

### Environment Variables

```
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=<signing key>
VITE_APP_ID=<OAuth app ID>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=<login portal URL>
```

### Build & Start

```bash
pnpm build        # Build frontend + backend
pnpm start        # Start production server
```

### Database Migrations

```bash
pnpm drizzle-kit generate  # Generate migration SQL
# Apply SQL via webdev_execute_sql
```

---

## Performance Considerations

### Query Optimization

- Indexed foreign keys (companyId, managerId, employeeId)
- Efficient hierarchical queries using recursive CTEs
- Pagination for large result sets

### Caching

- React Query caching for dashboard KPIs
- Stale-while-revalidate for attendance data
- Manual invalidation on mutations

### Lazy Loading

- Sidebar navigation items loaded on demand
- Employee detail pages fetch on route change
- Org chart nodes expanded on user interaction

---

## Future Enhancements

1. **Real-time Updates**: WebSocket for live activity feed
2. **Advanced Reporting**: Export attendance/leave reports to PDF
3. **Mobile App**: React Native companion app
4. **Notifications**: Email/SMS for leave approvals
5. **Integration**: Sync with payroll systems
6. **Analytics**: Dashboards for HR metrics and trends
7. **Multi-language**: i18n support for global teams
8. **Audit Trail**: Detailed change logs for compliance

---

## File Structure

```
induja_hrm/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Companies.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── EmployeeDetail.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── Leaves.tsx
│   │   │   ├── Tools.tsx
│   │   │   ├── Hierarchy.tsx
│   │   │   └── Home.tsx
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardLayoutSkeleton.tsx
│   │   │   └── ui/ (shadcn components)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── lib/trpc.ts
│   ├── index.html
│   └── public/
├── server/
│   ├── routers.ts
│   ├── routers.test.ts
│   ├── db.ts
│   ├── auth.logout.test.ts
│   └── _core/
│       ├── index.ts
│       ├── context.ts
│       ├── trpc.ts
│       ├── oauth.ts
│       └── ...
├── drizzle/
│   ├── schema.ts
│   ├── 0001_*.sql (migrations)
│   └── ...
├── shared/
│   └── const.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── todo.md
```

---

## Conclusion

Induja HRM provides a robust, scalable foundation for HR management with strict role-based access control, comprehensive data tracking, and an intuitive user interface. The architecture supports future enhancements while maintaining security and performance standards.
