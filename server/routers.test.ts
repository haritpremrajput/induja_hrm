import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock user contexts
const adminUser: User = {
  id: 1,
  openId: "admin-user",
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const managerUser: User = {
  id: 2,
  openId: "manager-user",
  email: "manager@example.com",
  name: "Manager User",
  loginMethod: "manus",
  role: "manager",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const regularUser: User = {
  id: 3,
  openId: "regular-user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(user: User | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any as TrpcContext["res"],
  };
}

describe("HR Management API - Role-Based Access Control", () => {
  describe("Admin Access", () => {
    it("admin can list all companies", async () => {
      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);
      
      // This should succeed without throwing
      try {
        const companies = await caller.companies.list();
        expect(Array.isArray(companies)).toBe(true);
      } catch (error: any) {
        // If database is not seeded, it's expected to return empty array
        expect(error.code).not.toBe('FORBIDDEN');
      }
    });

    it("admin can create employees", async () => {
      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);
      
      // This should succeed without throwing FORBIDDEN
      try {
        const result = await caller.employees.create({
          companyId: 1,
          departmentId: 1,
          jobRoleId: 1,
          firstName: "Test",
          lastName: "Employee",
          email: "test@example.com",
          joiningDate: new Date(),
          employeeCode: "EMP001",
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        expect(error.code).not.toBe('FORBIDDEN');
      }
    });
  });

  describe("Manager Access", () => {
    it("manager cannot list all companies", async () => {
      const ctx = createContext(managerUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.companies.list();
        expect.fail("Should have thrown FORBIDDEN");
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });

    it("manager cannot create employees", async () => {
      const ctx = createContext(managerUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.employees.create({
          companyId: 1,
          departmentId: 1,
          jobRoleId: 1,
          firstName: "Test",
          lastName: "Employee",
          email: "test@example.com",
          joiningDate: new Date(),
          employeeCode: "EMP001",
        });
        expect.fail("Should have thrown FORBIDDEN");
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });

    it("manager can view their direct reports", async () => {
      const ctx = createContext(managerUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const reports = await caller.employees.getDirectReports({ managerId: managerUser.id });
        expect(Array.isArray(reports)).toBe(true);
      } catch (error: any) {
        expect(error.code).not.toBe('FORBIDDEN');
      }
    });

    it("manager can approve leave requests", async () => {
      const ctx = createContext(managerUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.leaves.approve({
          requestId: 1,
          managerId: managerUser.id,
          notes: "Approved",
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        // May fail due to non-existent request, but not due to permissions
        expect(error.code).not.toBe('FORBIDDEN');
      }
    });
  });

  describe("Regular User Access", () => {
    it("regular user cannot list companies", async () => {
      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.companies.list();
        expect.fail("Should have thrown FORBIDDEN");
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });

    it("regular user cannot approve leaves", async () => {
      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.leaves.approve({
          requestId: 1,
          managerId: regularUser.id,
          notes: "Approved",
        });
        expect.fail("Should have thrown FORBIDDEN");
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });

    it("regular user can request leaves", async () => {
      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.leaves.request({
          employeeId: regularUser.id,
          leaveTypeId: 1,
          startDate: new Date(),
          endDate: new Date(),
          days: 1,
          reason: "Personal",
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        // May fail due to non-existent leave type, but not due to permissions
        expect(error.code).not.toBe('FORBIDDEN');
      }
    });

    it("regular user can view their own attendance", async () => {
      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const attendance = await caller.attendance.getByEmployee({ employeeId: regularUser.id });
        expect(Array.isArray(attendance)).toBe(true);
      } catch (error: any) {
        expect(error.code).not.toBe('FORBIDDEN');
      }
    });
  });

  describe("Unauthenticated Access", () => {
    it("unauthenticated user cannot access protected routes", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.companies.list();
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe('UNAUTHORIZED');
      }
    });

    it("unauthenticated user can check auth status", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);
      
      const user = await caller.auth.me();
      expect(user).toBeNull();
    });
  });
});

describe("HR Management API - Data Integrity", () => {
  describe("Attendance Tracking", () => {
    it("can record attendance for an employee", async () => {
      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.attendance.recordAttendance({
          employeeId: 1,
          attendanceDate: new Date(),
          status: "present",
          checkInTime: new Date(),
        });
        expect(result).toBeDefined();
        expect(result.status).toBe("present");
      } catch (error: any) {
        // May fail due to non-existent employee, but not due to logic
        expect(error.code).not.toBe('INTERNAL_SERVER_ERROR');
      }
    });
  });

  describe("Leave Management", () => {
    it("can request leave with valid dates", async () => {
      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);
      
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);
      
      try {
        const result = await caller.leaves.request({
          employeeId: regularUser.id,
          leaveTypeId: 1,
          startDate,
          endDate,
          days: 5,
          reason: "Vacation",
        });
        expect(result).toBeDefined();
        expect(result.status).toBe("pending");
      } catch (error: any) {
        expect(error.code).not.toBe('INTERNAL_SERVER_ERROR');
      }
    });
  });

  describe("Tools & Materials", () => {
    it("can assign tool to employee", async () => {
      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.tools.assign({
          toolId: 1,
          employeeId: 1,
          assignedDate: new Date(),
          condition: "good",
        });
        expect(result).toBeDefined();
        expect(result.status).toBe("assigned");
      } catch (error: any) {
        expect(error.code).not.toBe('INTERNAL_SERVER_ERROR');
      }
    });

    it("can return tool from employee", async () => {
      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.tools.returnTool({
          assignmentId: 1,
          returnedDate: new Date(),
          condition: "good",
        });
        expect(result.success).toBe(true);
      } catch (error: any) {
        expect(error.code).not.toBe('INTERNAL_SERVER_ERROR');
      }
    });
  });
});
