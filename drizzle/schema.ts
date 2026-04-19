import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  date,
  datetime,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field for admin/manager/employee distinction.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies table - represents different organizations/companies
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Departments table - departments within companies
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Job roles/positions table
 */
export const jobRoles = mysqlTable("jobRoles", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  level: mysqlEnum("level", ["entry", "mid", "senior", "lead", "manager", "director", "executive"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobRole = typeof jobRoles.$inferSelect;
export type InsertJobRole = typeof jobRoles.$inferInsert;

/**
 * Employees table - core employee information
 */
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  departmentId: int("departmentId").notNull(),
  jobRoleId: int("jobRoleId").notNull(),
  managerId: int("managerId"), // Self-referential for hierarchy
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  dateOfBirth: date("dateOfBirth"),
  joiningDate: date("joiningDate").notNull(),
  employeeCode: varchar("employeeCode", { length: 50 }).notNull().unique(),
  profilePhotoUrl: text("profilePhotoUrl"),
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "terminated"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Attendance records - daily check-in and check-out
 */
export const attendanceRecords = mysqlTable("attendanceRecords", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  attendanceDate: date("attendanceDate").notNull(),
  checkInTime: datetime("checkInTime"),
  checkOutTime: datetime("checkOutTime"),
  status: mysqlEnum("status", ["present", "absent", "half_day", "on_leave", "holiday"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;

/**
 * Leave types - different types of leaves (sick, vacation, personal, etc.)
 */
export const leaveTypes = mysqlTable("leaveTypes", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  maxDaysPerYear: int("maxDaysPerYear").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveType = typeof leaveTypes.$inferSelect;
export type InsertLeaveType = typeof leaveTypes.$inferInsert;

/**
 * Leave balances - track leave balance for each employee per leave type
 */
export const leaveBalances = mysqlTable("leaveBalances", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  leaveTypeId: int("leaveTypeId").notNull(),
  year: int("year").notNull(),
  totalDays: decimal("totalDays", { precision: 5, scale: 2 }).notNull(),
  usedDays: decimal("usedDays", { precision: 5, scale: 2 }).default("0").notNull(),
  remainingDays: decimal("remainingDays", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = typeof leaveBalances.$inferInsert;

/**
 * Leave requests - employee leave applications
 */
export const leaveRequests = mysqlTable("leaveRequests", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  leaveTypeId: int("leaveTypeId").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  days: decimal("days", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  approvedBy: int("approvedBy"), // Manager ID
  approvalDate: datetime("approvalDate"),
  approvalNotes: text("approvalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

/**
 * Tools and materials types
 */
export const toolTypes = mysqlTable("toolTypes", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ToolType = typeof toolTypes.$inferSelect;
export type InsertToolType = typeof toolTypes.$inferInsert;

/**
 * Tools and materials inventory
 */
export const tools = mysqlTable("tools", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  toolTypeId: int("toolTypeId").notNull(),
  serialNumber: varchar("serialNumber", { length: 100 }).notNull().unique(),
  purchaseDate: date("purchaseDate"),
  purchasePrice: decimal("purchasePrice", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["available", "assigned", "damaged", "retired"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

/**
 * Tool assignments - track which tools are assigned to which employees
 */
export const toolAssignments = mysqlTable("toolAssignments", {
  id: int("id").autoincrement().primaryKey(),
  toolId: int("toolId").notNull(),
  employeeId: int("employeeId").notNull(),
  assignedDate: date("assignedDate").notNull(),
  returnedDate: date("returnedDate"),
  status: mysqlEnum("status", ["assigned", "returned", "lost", "damaged"]).default("assigned").notNull(),
  condition: mysqlEnum("condition", ["excellent", "good", "fair", "poor"]).default("good"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ToolAssignment = typeof toolAssignments.$inferSelect;
export type InsertToolAssignment = typeof toolAssignments.$inferInsert;

/**
 * Open positions/job openings
 */
export const openPositions = mysqlTable("openPositions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  departmentId: int("departmentId").notNull(),
  jobRoleId: int("jobRoleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  numberOfPositions: int("numberOfPositions").notNull(),
  status: mysqlEnum("status", ["open", "closed", "filled"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OpenPosition = typeof openPositions.$inferSelect;
export type InsertOpenPosition = typeof openPositions.$inferInsert;

/**
 * Login/logout activity feed for dashboard
 */
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  activityType: mysqlEnum("activityType", ["login", "logout", "check_in", "check_out"]).notNull(),
  timestamp: datetime("timestamp").default(new Date()).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
