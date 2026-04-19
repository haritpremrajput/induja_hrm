# Induja HRM - User Guide

## Getting Started

### Logging In

1. Click the **Sign In** button on the login screen
2. You'll be redirected to the Manus OAuth portal
3. Enter your credentials
4. You'll be redirected back to the Induja HRM dashboard

### Dashboard Overview

The **Dashboard** is your home page with key metrics:

- **Total Employees**: Total count of employees in your company
- **Present Today**: Employees marked present for today
- **On Leave**: Employees currently on approved leave
- **Open Positions**: Unfilled job openings
- **Tools Assigned**: Tools currently assigned to employees
- **Attendance Rate**: Percentage of employees present

Below the KPIs, you'll see the **Recent Activity** feed showing login/logout events.

---

## Navigation

The sidebar on the left contains links to all modules:

1. **Dashboard** - Home page with KPIs and activity
2. **Companies** - View and manage companies (admin only)
3. **Employees** - View and manage employee records
4. **Attendance** - Track daily attendance and view heatmaps
5. **Leaves** - Request and approve leaves
6. **Tools & Materials** - Manage tool inventory and assignments
7. **Hierarchy** - View organizational structure

Click any item to navigate to that module. The sidebar can be collapsed by clicking the menu icon.

---

## Modules

### Companies (Admin Only)

**View all companies and their resources:**

1. Navigate to **Companies**
2. You'll see a list of all companies
3. Click on a company to view:
   - Associated employees
   - Tools and materials inventory
   - Open positions
   - Department structure

**Note**: Only admins can access this module.

### Employees

**View and manage employee records:**

1. Navigate to **Employees**
2. You'll see a table of employees with:
   - Name, Email, Department
   - Status (Active, On Leave, Inactive, Terminated)
   - Quick action buttons

**Search & Filter:**
- Use the search box to find employees by name or email
- Filter by department using the dropdown

**View Employee Details:**
- Click the **View** button to see full employee profile
- View personal information, employment details, and contact info

**Create New Employee (Admin Only):**
- Click **Add Employee** button
- Fill in required fields:
  - First Name, Last Name
  - Email, Phone (optional)
  - Department, Job Role
  - Joining Date
  - Employee Code

### Attendance

**Track employee attendance:**

1. Navigate to **Attendance**
2. You'll see options to:
   - Record check-in/check-out
   - View attendance history
   - See department attendance heatmap

**Check-In/Check-Out:**
- Click **Check In** to record arrival
- Click **Check Out** to record departure
- Times are automatically recorded

**Attendance History:**
- View your past attendance records
- Filter by date range
- See status (Present, Absent, Half Day, Sick Leave)

**Department Heatmap:**
- Visual representation of attendance by department
- Darker colors indicate higher attendance
- Hover over cells to see specific data

### Leaves

**Request and manage leave:**

1. Navigate to **Leaves**
2. Click **Request Leave** to submit a new request
3. Fill in:
   - Start Date and End Date
   - Leave Type (Sick, Vacation, Personal, etc.)
   - Reason (optional)
4. Click **Submit Request**

**Leave History:**
- View all your leave requests
- See status: Pending, Approved, Rejected, Cancelled
- Icons indicate status:
  - ✓ Green: Approved
  - ✗ Red: Rejected
  - ⏱ Yellow: Pending

**Leave Balance:**
- View remaining days for each leave type
- Shows total, used, and remaining days
- Balances reset annually

**Manager Approval (Managers Only):**
- View team member leave requests
- Click **Approve** or **Reject**
- Add approval notes (optional)
- Approved leaves update employee status to "On Leave"

### Tools & Materials

**Manage tool inventory:**

1. Navigate to **Tools & Materials**
2. You'll see:
   - Total tools count
   - Available, Assigned, Damaged counts
   - Quick stats cards

**Tools Inventory:**
- Table showing all tools with:
  - Serial Number
  - Status (Available, Assigned, Damaged, Retired)
  - Purchase Date
  - Purchase Price

**Search Tools:**
- Use search box to find by serial number
- Filter by status using dropdown

**Assign Tool (Admin Only):**
- Click **Assign** on a tool
- Select employee to assign to
- Set condition (Good, Fair, Damaged)
- Click **Assign**

**Return Tool (Admin Only):**
- Click **Return** on an assigned tool
- Confirm condition upon return
- Tool becomes available again

### Hierarchy

**View organizational structure:**

1. Navigate to **Hierarchy**
2. You'll see:
   - Your direct reports count
   - Total reports (all levels)
   - Organization chart

**Organization Chart:**
- Your name appears at the top
- Direct reports shown below
- Click arrows to expand/collapse subordinates
- Click on any employee to view details

**Team Members List:**
- Table showing all your direct and indirect reports
- Name, Email, Status
- Click **View** to see full profile

---

## User Roles & Permissions

### Admin
- View all companies and resources
- Create and manage employees
- Manage tools and materials
- Approve/reject leaves for any employee
- View system-wide reports
- Access all modules

### Manager
- View only their company
- View direct and indirect reports
- Approve/reject leaves for their team
- Track team attendance
- Access: Dashboard, Employees, Attendance, Leaves, Hierarchy

### User
- View own profile
- Request leaves
- View own attendance
- View assigned tools
- Access: Dashboard, Employees (own profile), Attendance (own), Leaves, Tools

---

## Common Tasks

### Request a Leave

1. Go to **Leaves**
2. Click **Request Leave**
3. Select start and end dates
4. Choose leave type
5. Add reason (optional)
6. Click **Submit Request**
7. Status changes to "Pending"
8. Wait for manager approval

### Check Attendance

1. Go to **Attendance**
2. Click **Check In** when arriving
3. Click **Check Out** when leaving
4. View your attendance history below

### View Team Attendance (Managers)

1. Go to **Attendance**
2. View the department heatmap
3. Darker colors = higher attendance
4. Filter by date range to see trends

### Approve Leave Request (Managers)

1. Go to **Leaves**
2. Scroll to "Leave Requests" section
3. Find the pending request
4. Click **Approve** or **Reject**
5. Add notes if needed
6. Click **Confirm**

### Assign Tool to Employee (Admin)

1. Go to **Tools & Materials**
2. Find the tool in inventory
3. Click **Assign**
4. Select employee
5. Set condition
6. Click **Assign**

### View Employee Details

1. Go to **Employees**
2. Find employee in list
3. Click **View** button
4. See full profile with:
   - Personal information
   - Employment details
   - Contact information
   - Status

---

## Tips & Best Practices

### Dashboard
- Check the dashboard daily for key metrics
- Review recent activity to stay updated
- Use KPIs to monitor team performance

### Attendance
- Check in immediately upon arrival
- Check out before leaving
- Accurate attendance helps with payroll and compliance

### Leaves
- Request leaves in advance when possible
- Provide clear reasons for leave
- Check leave balance before requesting

### Hierarchy
- Use the org chart to understand reporting structure
- Click on team members to view details
- Expand nodes to see full chain of command

### Tools
- Keep track of assigned tools
- Report damaged tools immediately
- Return tools in good condition

---

## Troubleshooting

### Can't Log In?
- Ensure you're using the correct credentials
- Check if your account is active
- Try clearing browser cookies and logging in again

### Can't See Certain Modules?
- Your role may not have access to that module
- Contact your admin for permission changes
- Check your role in your profile

### Leave Request Not Showing?
- Refresh the page
- Ensure you selected valid dates
- Check that leave type is available for your company

### Attendance Not Recording?
- Ensure you have internet connection
- Try checking in again
- Contact your admin if issue persists

### Can't Approve Leave (Managers)?
- Ensure employee is in your reporting hierarchy
- Check that leave request is in "Pending" status
- Verify you have manager role

---

## Support

For issues or questions:

1. Contact your HR administrator
2. Check this guide for common tasks
3. Review the API Reference for technical details
4. Check the Architecture documentation for system design

---

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Open search (coming soon)
- **Ctrl/Cmd + /**: Show help (coming soon)
- **Esc**: Close modals/dialogs

---

## Frequently Asked Questions

**Q: How do I change my password?**
A: Passwords are managed through Manus OAuth. Contact your admin for password reset.

**Q: Can I request leave for someone else?**
A: No, employees must request their own leaves. Managers can only approve/reject.

**Q: How are leave balances calculated?**
A: Balances are set annually per leave type. Used days are deducted when leaves are approved.

**Q: Can I view other employees' attendance?**
A: Managers can view their team's attendance. Admins can view all attendance.

**Q: What happens to tools when an employee leaves?**
A: Tools must be returned. Contact admin to update tool status to "Retired" or reassign.

**Q: How do I export reports?**
A: Report export feature coming soon. Contact admin for manual reports.

**Q: Can I edit employee information?**
A: Only admins can edit employee records. Contact your admin for changes.

**Q: What is the attendance rate percentage?**
A: It's calculated as (Present Days / Total Working Days) × 100 for the period.
