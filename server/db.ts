import { eq, and, or, desc, asc, gte, lte, like, inArray, isNull, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  companies,
  departments,
  employees,
  jobRoles,
  attendanceRecords,
  leaveTypes,
  leaveBalances,
  leaveRequests,
  toolTypes,
  tools,
  toolAssignments,
  openPositions,
  activityLog,
  type Company,
  type Employee,
  type AttendanceRecord,
  type LeaveRequest,
  type ToolAssignment,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= COMPANY QUERIES =============

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(asc(companies.name));
}

export async function getCompanyById(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============= EMPLOYEE QUERIES =============

export async function getEmployeesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.companyId, companyId)).orderBy(asc(employees.firstName));
}

export async function getEmployeeById(employeeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getEmployeesByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.departmentId, departmentId)).orderBy(asc(employees.firstName));
}

export async function getDirectReports(managerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.managerId, managerId)).orderBy(asc(employees.firstName));
}

export async function getEmployeeHierarchy(employeeId: number): Promise<Employee[]> {
  const db = await getDb();
  if (!db) return [];
  
  const allReports: Employee[] = [];
  const queue = [employeeId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;
    
    const reports = await db.select().from(employees).where(eq(employees.managerId, currentId));
    allReports.push(...reports);
    queue.push(...reports.map(r => r.id));
  }
  
  return allReports;
}

export async function getTotalEmployeesByCompany(companyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(employees).where(eq(employees.companyId, companyId));
  return result.length;
}

// ============= ATTENDANCE QUERIES =============

export async function getAttendanceByEmployee(employeeId: number, limit: number = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendanceRecords)
    .where(eq(attendanceRecords.employeeId, employeeId))
    .orderBy(desc(attendanceRecords.attendanceDate))
    .limit(limit);
}

export async function getAttendanceByDate(attendanceDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const dateStr = attendanceDate.toISOString().split('T')[0];
  return db.select().from(attendanceRecords)
    .where(eq(attendanceRecords.attendanceDate, dateStr as any))
    .orderBy(desc(attendanceRecords.createdAt));
}

export async function getAttendanceByDepartment(departmentId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const deptEmployees = await db.select({ id: employees.id }).from(employees)
    .where(eq(employees.departmentId, departmentId));
  
  const empIds = deptEmployees.map(e => e.id);
  if (empIds.length === 0) return [];
  
  return db.select().from(attendanceRecords)
    .where(and(
      inArray(attendanceRecords.employeeId, empIds),
      gte(attendanceRecords.attendanceDate, startStr as any),
      lte(attendanceRecords.attendanceDate, endStr as any)
    ))
    .orderBy(desc(attendanceRecords.attendanceDate));
}

export async function getPresentTodayCount(companyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const companyEmps = await db.select({ id: employees.id }).from(employees)
    .where(eq(employees.companyId, companyId));
  
  const empIds = companyEmps.map(e => e.id);
  if (empIds.length === 0) return 0;
  
  const result = await db.select({ id: attendanceRecords.id }).from(attendanceRecords)
    .where(and(
      inArray(attendanceRecords.employeeId, empIds),
      eq(attendanceRecords.attendanceDate, today as any),
      eq(attendanceRecords.status, 'present')
    ));
  
  return result.length;
}

// ============= LEAVE QUERIES =============

export async function getLeaveRequestsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaveRequests)
    .where(eq(leaveRequests.employeeId, employeeId))
    .orderBy(desc(leaveRequests.createdAt));
}

export async function getPendingLeaveRequests(managerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const reports = await getDirectReports(managerId);
  const reportIds = reports.map(r => r.id);
  
  if (reportIds.length === 0) return [];
  
  return db.select().from(leaveRequests)
    .where(and(
      inArray(leaveRequests.employeeId, reportIds),
      eq(leaveRequests.status, 'pending')
    ))
    .orderBy(desc(leaveRequests.createdAt));
}

export async function getLeaveBalance(employeeId: number, leaveTypeId: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(leaveBalances)
    .where(and(
      eq(leaveBalances.employeeId, employeeId),
      eq(leaveBalances.leaveTypeId, leaveTypeId),
      eq(leaveBalances.year, year)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getOnLeaveCount(companyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const companyEmps = await db.select({ id: employees.id }).from(employees)
    .where(eq(employees.companyId, companyId));
  
  const empIds = companyEmps.map(e => e.id);
  if (empIds.length === 0) return 0;
  
  const result = await db.select({ id: attendanceRecords.id }).from(attendanceRecords)
    .where(and(
      inArray(attendanceRecords.employeeId, empIds),
      eq(attendanceRecords.attendanceDate, today as any),
      eq(attendanceRecords.status, 'on_leave')
    ));
  
  return result.length;
}

// ============= TOOLS & MATERIALS QUERIES =============

export async function getToolsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tools)
    .where(eq(tools.companyId, companyId))
    .orderBy(asc(tools.serialNumber));
}

export async function getToolAssignmentsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(toolAssignments)
    .where(eq(toolAssignments.employeeId, employeeId))
    .orderBy(desc(toolAssignments.assignedDate));
}

export async function getActiveToolAssignments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const companyTools = await db.select({ id: tools.id }).from(tools)
    .where(eq(tools.companyId, companyId));
  
  const toolIds = companyTools.map(t => t.id);
  if (toolIds.length === 0) return [];
  
  return db.select().from(toolAssignments)
    .where(and(
      inArray(toolAssignments.toolId, toolIds),
      eq(toolAssignments.status, 'assigned')
    ));
}

export async function getToolsAssignedCount(companyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const assignments = await getActiveToolAssignments(companyId);
  return assignments.length;
}

// ============= OPEN POSITIONS QUERIES =============

export async function getOpenPositionsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(openPositions)
    .where(and(
      eq(openPositions.companyId, companyId),
      eq(openPositions.status, 'open')
    ))
    .orderBy(asc(openPositions.title));
}

export async function getOpenPositionsCount(companyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const positions = await getOpenPositionsByCompany(companyId);
  return positions.reduce((sum, pos) => sum + pos.numberOfPositions, 0);
}

// ============= ACTIVITY LOG QUERIES =============

export async function getRecentActivityFeed(companyId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const companyEmps = await db.select({ id: employees.id }).from(employees)
    .where(eq(employees.companyId, companyId));
  
  const empIds = companyEmps.map(e => e.id);
  if (empIds.length === 0) return [];
  
  return db.select().from(activityLog)
    .where(inArray(activityLog.employeeId, empIds))
    .orderBy(desc(activityLog.timestamp))
    .limit(limit);
}

// ============= DEPARTMENT QUERIES =============

export async function getDepartmentsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments)
    .where(eq(departments.companyId, companyId))
    .orderBy(asc(departments.name));
}

export async function getDepartmentById(departmentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============= JOB ROLE QUERIES =============

export async function getJobRolesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobRoles)
    .where(eq(jobRoles.companyId, companyId))
    .orderBy(asc(jobRoles.name));
}

export async function getJobRoleById(roleId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobRoles)
    .where(eq(jobRoles.id, roleId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============= LEAVE TYPE QUERIES =============

export async function getLeaveTypesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaveTypes)
    .where(eq(leaveTypes.companyId, companyId))
    .orderBy(asc(leaveTypes.name));
}

// ============= TOOL TYPE QUERIES =============

export async function getToolTypesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(toolTypes)
    .where(eq(toolTypes.companyId, companyId))
    .orderBy(asc(toolTypes.name));
}

// ============= ATTENDANCE RATE CALCULATION =============

export async function getAttendanceRate(employeeId: number, days: number = 30): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const records = await db.select().from(attendanceRecords)
    .where(and(
      eq(attendanceRecords.employeeId, employeeId),
      gte(attendanceRecords.attendanceDate, startStr as any),
      lte(attendanceRecords.attendanceDate, endStr as any)
    ));
  
  if (records.length === 0) return 0;
  
  const presentDays = records.filter(r => r.status === 'present' || r.status === 'half_day').length;
  return Math.round((presentDays / records.length) * 100);
}

export async function getCompanyAttendanceRate(companyId: number, days: number = 30): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const companyEmps = await db.select({ id: employees.id }).from(employees)
    .where(eq(employees.companyId, companyId));
  
  const empIds = companyEmps.map(e => e.id);
  if (empIds.length === 0) return 0;
  
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const records = await db.select().from(attendanceRecords)
    .where(and(
      inArray(attendanceRecords.employeeId, empIds),
      gte(attendanceRecords.attendanceDate, startStr as any),
      lte(attendanceRecords.attendanceDate, endStr as any)
    ));
  
  if (records.length === 0) return 0;
  
  const presentDays = records.filter(r => r.status === 'present' || r.status === 'half_day').length;
  return Math.round((presentDays / records.length) * 100);
}
