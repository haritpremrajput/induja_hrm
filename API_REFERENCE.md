# Induja HRM - API Reference

## Overview

This document describes all available tRPC procedures in the Induja HRM system. All procedures are type-safe and return structured responses with proper error handling.

## Authentication

### `auth.me`
Get current authenticated user.

**Type**: `publicProcedure`
**Input**: None
**Output**: `User | null`

```typescript
const user = await trpc.auth.me.useQuery();
// Returns: { id, openId, name, email, role, ... } or null if not authenticated
```

### `auth.logout`
Clear session and log out user.

**Type**: `publicProcedure`
**Input**: None
**Output**: `{ success: boolean }`

```typescript
await trpc.auth.logout.useMutation().mutateAsync();
```

---

## Companies

### `companies.list`
Get all companies (admin only).

**Type**: `adminProcedure`
**Input**: None
**Output**: `Company[]`

```typescript
const companies = await trpc.companies.list.useQuery();
// Returns: [{ id, name, location, ... }]
```

### `companies.getById`
Get company details by ID.

**Type**: `protectedProcedure`
**Input**: `{ id: number }`
**Output**: `Company | null`

```typescript
const company = await trpc.companies.getById.useQuery({ id: 1 });
```

### `companies.getWithResources`
Get company with associated employees, tools, and positions.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `{ company: Company; employees: Employee[]; tools: Tool[]; positions: OpenPosition[] }`

```typescript
const resources = await trpc.companies.getWithResources.useQuery({ companyId: 1 });
```

---

## Employees

### `employees.list`
Get employees by company with optional filters.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number; departmentId?: number; status?: string }`
**Output**: `Employee[]`

```typescript
const employees = await trpc.employees.list.useQuery({ 
  companyId: 1,
  departmentId: 2,
  status: 'active'
});
```

### `employees.getById`
Get employee details.

**Type**: `protectedProcedure`
**Input**: `{ id: number }`
**Output**: `Employee | null`

```typescript
const employee = await trpc.employees.getById.useQuery({ id: 5 });
// Returns: { id, firstName, lastName, email, department, role, ... }
```

### `employees.create`
Create new employee (admin only).

**Type**: `adminProcedure`
**Input**: `{ companyId, departmentId, jobRoleId, firstName, lastName, email, joiningDate, employeeCode }`
**Output**: `Employee`

```typescript
const newEmployee = await trpc.employees.create.useMutation().mutateAsync({
  companyId: 1,
  departmentId: 1,
  jobRoleId: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  joiningDate: new Date(),
  employeeCode: 'EMP001'
});
```

### `employees.update`
Update employee information.

**Type**: `protectedProcedure`
**Input**: `{ id, firstName?, lastName?, email?, phone?, location?, ... }`
**Output**: `Employee`

```typescript
const updated = await trpc.employees.update.useMutation().mutateAsync({
  id: 5,
  phone: '+1234567890',
  location: 'New York'
});
```

### `employees.getDirectReports`
Get direct reports for a manager.

**Type**: `managerProcedure`
**Input**: `{ managerId: number }`
**Output**: `Employee[]`

```typescript
const reports = await trpc.employees.getDirectReports.useQuery({ managerId: 2 });
```

### `employees.getAllReports`
Get all subordinates (recursive) for a manager.

**Type**: `managerProcedure`
**Input**: `{ managerId: number }`
**Output**: `Employee[]`

```typescript
const allReports = await trpc.employees.getAllReports.useQuery({ managerId: 2 });
```

---

## Attendance

### `attendance.recordAttendance`
Record check-in or check-out.

**Type**: `protectedProcedure`
**Input**: `{ employeeId, attendanceDate, status, checkInTime?, checkOutTime? }`
**Output**: `Attendance`

```typescript
const record = await trpc.attendance.recordAttendance.useMutation().mutateAsync({
  employeeId: 5,
  attendanceDate: new Date(),
  status: 'present',
  checkInTime: new Date()
});
```

### `attendance.getByEmployee`
Get attendance history for an employee.

**Type**: `protectedProcedure`
**Input**: `{ employeeId: number; limit?: number }`
**Output**: `Attendance[]`

```typescript
const history = await trpc.attendance.getByEmployee.useQuery({ 
  employeeId: 5,
  limit: 30
});
```

### `attendance.getByDepartment`
Get department attendance heatmap data.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number; departmentId: number; startDate, endDate }`
**Output**: `{ department: string; data: HeatmapData[] }`

```typescript
const heatmap = await trpc.attendance.getByDepartment.useQuery({
  companyId: 1,
  departmentId: 1,
  startDate: new Date('2026-04-01'),
  endDate: new Date('2026-04-30')
});
```

### `attendance.getTodayStats`
Get today's attendance statistics.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `{ present: number; absent: number; onLeave: number }`

```typescript
const stats = await trpc.attendance.getTodayStats.useQuery({ companyId: 1 });
```

---

## Leaves

### `leaves.request`
Submit a leave request.

**Type**: `protectedProcedure`
**Input**: `{ employeeId, leaveTypeId, startDate, endDate, days, reason }`
**Output**: `LeaveRequest`

```typescript
const request = await trpc.leaves.request.useMutation().mutateAsync({
  employeeId: 5,
  leaveTypeId: 1,
  startDate: new Date('2026-05-01'),
  endDate: new Date('2026-05-05'),
  days: 5,
  reason: 'Vacation'
});
```

### `leaves.getByEmployee`
Get leave requests for an employee.

**Type**: `protectedProcedure`
**Input**: `{ employeeId: number }`
**Output**: `LeaveRequest[]`

```typescript
const leaves = await trpc.leaves.getByEmployee.useQuery({ employeeId: 5 });
```

### `leaves.approve`
Approve a leave request (manager only).

**Type**: `managerProcedure`
**Input**: `{ requestId, managerId, notes? }`
**Output**: `LeaveRequest`

```typescript
const approved = await trpc.leaves.approve.useMutation().mutateAsync({
  requestId: 10,
  managerId: 2,
  notes: 'Approved'
});
```

### `leaves.reject`
Reject a leave request (manager only).

**Type**: `managerProcedure`
**Input**: `{ requestId, managerId, notes? }`
**Output**: `LeaveRequest`

```typescript
const rejected = await trpc.leaves.reject.useMutation().mutateAsync({
  requestId: 10,
  managerId: 2,
  notes: 'Insufficient coverage'
});
```

### `leaves.getBalance`
Get leave balance for an employee.

**Type**: `protectedProcedure`
**Input**: `{ employeeId: number; year: number }`
**Output**: `LeaveBalance[]`

```typescript
const balance = await trpc.leaves.getBalance.useQuery({ 
  employeeId: 5,
  year: 2026
});
// Returns: [{ leaveType: 'Sick', total: 10, used: 2, remaining: 8 }]
```

---

## Tools & Materials

### `tools.listByCompany`
Get tools for a company.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `Tool[]`

```typescript
const tools = await trpc.tools.listByCompany.useQuery({ companyId: 1 });
```

### `tools.assign`
Assign tool to employee.

**Type**: `adminProcedure`
**Input**: `{ toolId, employeeId, assignedDate, condition }`
**Output**: `ToolAssignment`

```typescript
const assignment = await trpc.tools.assign.useMutation().mutateAsync({
  toolId: 1,
  employeeId: 5,
  assignedDate: new Date(),
  condition: 'good'
});
```

### `tools.returnTool`
Return tool from employee.

**Type**: `adminProcedure`
**Input**: `{ assignmentId, returnedDate, condition }`
**Output**: `{ success: boolean }`

```typescript
await trpc.tools.returnTool.useMutation().mutateAsync({
  assignmentId: 1,
  returnedDate: new Date(),
  condition: 'good'
});
```

### `tools.getActiveAssignments`
Get currently assigned tools for a company.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `ToolAssignment[]`

```typescript
const assignments = await trpc.tools.getActiveAssignments.useQuery({ companyId: 1 });
```

---

## Reference Data

### `reference.getDepartments`
Get departments for a company.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `Department[]`

```typescript
const departments = await trpc.reference.getDepartments.useQuery({ companyId: 1 });
```

### `reference.getJobRoles`
Get job roles for a company.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `JobRole[]`

```typescript
const roles = await trpc.reference.getJobRoles.useQuery({ companyId: 1 });
```

### `reference.getLeaveTypes`
Get leave types for a company.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `LeaveType[]`

```typescript
const leaveTypes = await trpc.reference.getLeaveTypes.useQuery({ companyId: 1 });
```

### `reference.getOpenPositions`
Get open positions for a company.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `OpenPosition[]`

```typescript
const positions = await trpc.reference.getOpenPositions.useQuery({ companyId: 1 });
```

---

## Dashboard

### `dashboard.getKPIs`
Get KPI metrics for dashboard.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number }`
**Output**: `{ totalEmployees, presentToday, onLeave, openPositions, toolsAssigned, attendanceRate }`

```typescript
const kpis = await trpc.dashboard.getKPIs.useQuery({ companyId: 1 });
```

### `dashboard.getRecentActivity`
Get recent login/logout activity.

**Type**: `protectedProcedure`
**Input**: `{ companyId: number; limit?: number }`
**Output**: `ActivityLog[]`

```typescript
const activity = await trpc.dashboard.getRecentActivity.useQuery({ 
  companyId: 1,
  limit: 20
});
```

---

## Hierarchy

### `hierarchy.getOrgChart`
Get organizational chart for a manager.

**Type**: `managerProcedure`
**Input**: `{ managerId: number }`
**Output**: `{ directReports: Employee[]; allReports: Employee[] }`

```typescript
const orgChart = await trpc.hierarchy.getOrgChart.useQuery({ managerId: 2 });
```

---

## Error Handling

All procedures return typed errors:

```typescript
try {
  await trpc.companies.list.useQuery();
} catch (error: any) {
  if (error.code === 'UNAUTHORIZED') {
    // User not authenticated
  } else if (error.code === 'FORBIDDEN') {
    // User lacks permission
  } else if (error.code === 'NOT_FOUND') {
    // Resource not found
  } else if (error.code === 'BAD_REQUEST') {
    // Invalid input
  }
}
```

---

## Data Types

### User
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: 'admin' | 'manager' | 'user';
  loginMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

### Employee
```typescript
{
  id: number;
  companyId: number;
  departmentId: number;
  jobRoleId: number;
  managerId: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  dateOfBirth: Date | null;
  employeeCode: string;
  joiningDate: Date;
  status: 'active' | 'on_leave' | 'inactive' | 'terminated';
  profilePhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### LeaveRequest
```typescript
{
  id: number;
  employeeId: number;
  leaveTypeId: number;
  managerId: number | null;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Tool
```typescript
{
  id: number;
  companyId: number;
  serialNumber: string;
  name: string;
  description: string | null;
  status: 'available' | 'assigned' | 'damaged' | 'retired';
  purchaseDate: Date | null;
  purchasePrice: Decimal | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Usage Examples

### Complete Leave Request Workflow

```typescript
// 1. Get leave types
const leaveTypes = await trpc.reference.getLeaveTypes.useQuery({ companyId: 1 });

// 2. Submit leave request
const request = await trpc.leaves.request.useMutation().mutateAsync({
  employeeId: 5,
  leaveTypeId: leaveTypes[0].id,
  startDate: new Date('2026-05-01'),
  endDate: new Date('2026-05-05'),
  days: 5,
  reason: 'Vacation'
});

// 3. Manager approves
const approved = await trpc.leaves.approve.useMutation().mutateAsync({
  requestId: request.id,
  managerId: 2,
  notes: 'Approved'
});

// 4. Check updated balance
const balance = await trpc.leaves.getBalance.useQuery({ 
  employeeId: 5,
  year: 2026
});
```

### Employee Hierarchy Navigation

```typescript
// Get manager's org chart
const orgChart = await trpc.hierarchy.getOrgChart.useQuery({ managerId: 2 });

// View all subordinates
const allReports = orgChart.allReports;

// Get details for specific employee
const employee = await trpc.employees.getById.useQuery({ id: allReports[0].id });
```

### Dashboard Metrics

```typescript
// Get all KPIs at once
const kpis = await trpc.dashboard.getKPIs.useQuery({ companyId: 1 });

// Get recent activity
const activity = await trpc.dashboard.getRecentActivity.useQuery({ 
  companyId: 1,
  limit: 10
});

// Combine for dashboard display
const dashboardData = { ...kpis, recentActivity: activity };
```
