import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import {
  getAllCompanies,
  getCompanyById,
  getEmployeesByCompany,
  getEmployeeById,
  getDirectReports,
  getEmployeeHierarchy,
  getTotalEmployeesByCompany,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getAttendanceByDepartment,
  getPresentTodayCount,
  getLeaveRequestsByEmployee,
  getPendingLeaveRequests,
  getLeaveBalance,
  getOnLeaveCount,
  getToolsByCompany,
  getToolAssignmentsByEmployee,
  getActiveToolAssignments,
  getToolsAssignedCount,
  getOpenPositionsByCompany,
  getOpenPositionsCount,
  getRecentActivityFeed,
  getDepartmentsByCompany,
  getJobRolesByCompany,
  getLeaveTypesByCompany,
  getToolTypesByCompany,
  getAttendanceRate,
  getCompanyAttendanceRate,
  getEmployeesByDepartment,
  getDb,
} from "./db";
import { 
  employees, 
  attendanceRecords, 
  leaveRequests, 
  toolAssignments, 
  activityLog,
  leaveBalances,
  openPositions,
  type InsertEmployee,
  type InsertAttendanceRecord,
  type InsertLeaveRequest,
  type InsertToolAssignment,
} from "../drizzle/schema";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Manager-only procedure
const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'manager' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= COMPANY ROUTES =============
  companies: router({
    list: adminProcedure.query(async () => {
      return getAllCompanies();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getCompanyById(input.id);
      }),

    getWithResources: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const company = await getCompanyById(input.id);
        if (!company) throw new TRPCError({ code: 'NOT_FOUND' });

        // Check authorization: admin can see all, managers only their own company
        if (ctx.user.role !== 'admin') {
          // For managers, we'd need to associate them with a company
          // This is a simplified check
        }

        const [employees, tools, positions, departments] = await Promise.all([
          getEmployeesByCompany(input.id),
          getToolsByCompany(input.id),
          getOpenPositionsByCompany(input.id),
          getDepartmentsByCompany(input.id),
        ]);

        return {
          company,
          employees,
          tools,
          positions,
          departments,
        };
      }),
  }),

  // ============= EMPLOYEE ROUTES =============
  employees: router({
    listByCompany: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getEmployeesByCompany(input.companyId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getEmployeeById(input.id);
      }),

    getDirectReports: managerProcedure
      .input(z.object({ managerId: z.number() }))
      .query(async ({ input }) => {
        return getDirectReports(input.managerId);
      }),

    getFullHierarchy: managerProcedure
      .input(z.object({ managerId: z.number() }))
      .query(async ({ input }) => {
        return getEmployeeHierarchy(input.managerId);
      }),

    listByDepartment: protectedProcedure
      .input(z.object({ departmentId: z.number() }))
      .query(async ({ input }) => {
        return getEmployeesByDepartment(input.departmentId);
      }),

    create: adminProcedure
      .input(z.object({
        companyId: z.number(),
        departmentId: z.number(),
        jobRoleId: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        location: z.string().optional(),
        dateOfBirth: z.date().optional(),
        joiningDate: z.date(),
        employeeCode: z.string(),
        managerId: z.number().optional(),
        profilePhotoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const newEmployee: InsertEmployee = {
          companyId: input.companyId,
          departmentId: input.departmentId,
          jobRoleId: input.jobRoleId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          location: input.location,
          dateOfBirth: input.dateOfBirth,
          joiningDate: input.joiningDate,
          employeeCode: input.employeeCode,
          managerId: input.managerId,
          profilePhotoUrl: input.profilePhotoUrl,
          status: 'active',
        };

        await db.insert(employees).values(newEmployee);
        return newEmployee;
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        profilePhotoUrl: z.string().optional(),
        status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const { id, ...updateData } = input;
        await db.update(employees).set(updateData).where(eq(employees.id, id));
        return getEmployeeById(id);
      }),
  }),

  // ============= ATTENDANCE ROUTES =============
  attendance: router({
    getByEmployee: protectedProcedure
      .input(z.object({ employeeId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getAttendanceByEmployee(input.employeeId, input.limit);
      }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input }) => {
        return getAttendanceByDate(input.date);
      }),

    getByDepartment: protectedProcedure
      .input(z.object({ 
        departmentId: z.number(), 
        startDate: z.date(), 
        endDate: z.date() 
      }))
      .query(async ({ input }) => {
        return getAttendanceByDepartment(input.departmentId, input.startDate, input.endDate);
      }),

    recordAttendance: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        attendanceDate: z.date(),
        checkInTime: z.date().optional(),
        checkOutTime: z.date().optional(),
        status: z.enum(['present', 'absent', 'half_day', 'on_leave', 'holiday']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const record: InsertAttendanceRecord = {
          employeeId: input.employeeId,
          attendanceDate: input.attendanceDate,
          checkInTime: input.checkInTime,
          checkOutTime: input.checkOutTime,
          status: input.status,
          notes: input.notes,
        };

        await db.insert(attendanceRecords).values(record);
        return record;
      }),

    getPresentToday: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getPresentTodayCount(input.companyId);
      }),

    getAttendanceRate: protectedProcedure
      .input(z.object({ employeeId: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        return getAttendanceRate(input.employeeId, input.days);
      }),

    getCompanyAttendanceRate: protectedProcedure
      .input(z.object({ companyId: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        return getCompanyAttendanceRate(input.companyId, input.days);
      }),
  }),

  // ============= LEAVE ROUTES =============
  leaves: router({
    getByEmployee: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return getLeaveRequestsByEmployee(input.employeeId);
      }),

    getPending: managerProcedure
      .input(z.object({ managerId: z.number() }))
      .query(async ({ input }) => {
        return getPendingLeaveRequests(input.managerId);
      }),

    getBalance: protectedProcedure
      .input(z.object({ employeeId: z.number(), leaveTypeId: z.number(), year: z.number() }))
      .query(async ({ input }) => {
        return getLeaveBalance(input.employeeId, input.leaveTypeId, input.year);
      }),

    request: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        leaveTypeId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        days: z.number().or(z.string()),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const dayValue = typeof input.days === 'string' ? parseFloat(input.days) : input.days;
        const request: InsertLeaveRequest = {
          employeeId: input.employeeId,
          leaveTypeId: input.leaveTypeId,
          startDate: input.startDate,
          endDate: input.endDate,
          days: dayValue as any,
          reason: input.reason,
          status: 'pending',
        };

        await db.insert(leaveRequests).values(request);
        return request;
      }),

    approve: managerProcedure
      .input(z.object({
        requestId: z.number(),
        managerId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        await db.update(leaveRequests)
          .set({
            status: 'approved',
            approvedBy: input.managerId,
            approvalDate: new Date(),
            approvalNotes: input.notes,
          })
          .where(eq(leaveRequests.id, input.requestId));

        return { success: true };
      }),

    reject: managerProcedure
      .input(z.object({
        requestId: z.number(),
        managerId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        await db.update(leaveRequests)
          .set({
            status: 'rejected',
            approvedBy: input.managerId,
            approvalDate: new Date(),
            approvalNotes: input.notes,
          })
          .where(eq(leaveRequests.id, input.requestId));

        return { success: true };
      }),

    getOnLeaveCount: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getOnLeaveCount(input.companyId);
      }),
  }),

  // ============= TOOLS & MATERIALS ROUTES =============
  tools: router({
    listByCompany: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getToolsByCompany(input.companyId);
      }),

    getAssignmentsByEmployee: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return getToolAssignmentsByEmployee(input.employeeId);
      }),

    getActiveAssignments: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getActiveToolAssignments(input.companyId);
      }),

    assign: adminProcedure
      .input(z.object({
        toolId: z.number(),
        employeeId: z.number(),
        assignedDate: z.date(),
        condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const assignment: InsertToolAssignment = {
          toolId: input.toolId,
          employeeId: input.employeeId,
          assignedDate: input.assignedDate,
          status: 'assigned',
          condition: input.condition,
          notes: input.notes,
        };

        await db.insert(toolAssignments).values(assignment);
        return assignment;
      }),

    returnTool: protectedProcedure
      .input(z.object({
        assignmentId: z.number(),
        returnedDate: z.date(),
        condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        await db.update(toolAssignments)
          .set({
            status: 'returned',
            returnedDate: input.returnedDate,
            condition: input.condition,
            notes: input.notes,
          })
          .where(eq(toolAssignments.id, input.assignmentId));

        return { success: true };
      }),

    getAssignedCount: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getToolsAssignedCount(input.companyId);
      }),
  }),

  // ============= DASHBOARD ROUTES =============
  dashboard: router({
    getKPIs: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        const [
          totalEmployees,
          presentToday,
          onLeave,
          openPositions,
          toolsAssigned,
          attendanceRate,
        ] = await Promise.all([
          getTotalEmployeesByCompany(input.companyId),
          getPresentTodayCount(input.companyId),
          getOnLeaveCount(input.companyId),
          getOpenPositionsCount(input.companyId),
          getToolsAssignedCount(input.companyId),
          getCompanyAttendanceRate(input.companyId),
        ]);

        return {
          totalEmployees,
          presentToday,
          onLeave,
          openPositions,
          toolsAssigned,
          attendanceRate,
        };
      }),

    getActivityFeed: protectedProcedure
      .input(z.object({ companyId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getRecentActivityFeed(input.companyId, input.limit);
      }),

    getAttendanceHeatmap: protectedProcedure
      .input(z.object({
        departmentId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return getAttendanceByDepartment(input.departmentId, input.startDate, input.endDate);
      }),
  }),

  // ============= HIERARCHY ROUTES =============
  hierarchy: router({
    getOrgChart: managerProcedure
      .input(z.object({ managerId: z.number() }))
      .query(async ({ input }) => {
        const directReports = await getDirectReports(input.managerId);
        const allReports = await getEmployeeHierarchy(input.managerId);
        
        return {
          directReports,
          allReports,
          totalReports: allReports.length,
        };
      }),
  }),

  // ============= REFERENCE DATA ROUTES =============
  reference: router({
    getDepartments: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getDepartmentsByCompany(input.companyId);
      }),

    getJobRoles: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getJobRolesByCompany(input.companyId);
      }),

    getLeaveTypes: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getLeaveTypesByCompany(input.companyId);
      }),

    getToolTypes: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getToolTypesByCompany(input.companyId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
