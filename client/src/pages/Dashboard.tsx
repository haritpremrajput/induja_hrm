import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, Briefcase, Wrench, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedCompanyId] = useState(1); // TODO: Make this dynamic based on user selection

  // Fetch KPI data
  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.getKPIs.useQuery(
    { companyId: selectedCompanyId },
    { enabled: !!selectedCompanyId }
  );

  // Fetch activity feed
  const { data: activityFeed, isLoading: feedLoading } = trpc.dashboard.getActivityFeed.useQuery(
    { companyId: selectedCompanyId, limit: 10 },
    { enabled: !!selectedCompanyId }
  );

  const KPICard = ({ icon: Icon, label, value, loading }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-teal-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? '-' : value}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          icon={Users}
          label="Total Employees"
          value={kpis?.totalEmployees}
          loading={kpisLoading}
        />
        <KPICard
          icon={UserCheck}
          label="Present Today"
          value={kpis?.presentToday}
          loading={kpisLoading}
        />
        <KPICard
          icon={Calendar}
          label="On Leave"
          value={kpis?.onLeave}
          loading={kpisLoading}
        />
        <KPICard
          icon={Briefcase}
          label="Open Positions"
          value={kpis?.openPositions}
          loading={kpisLoading}
        />
        <KPICard
          icon={Wrench}
          label="Tools Assigned"
          value={kpis?.toolsAssigned}
          loading={kpisLoading}
        />
        <KPICard
          icon={TrendingUp}
          label="Attendance Rate"
          value={kpisLoading ? '-' : `${kpis?.attendanceRate}%`}
          loading={false}
        />
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading activity...</div>
            ) : activityFeed && activityFeed.length > 0 ? (
              activityFeed.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.activityType === 'login' && 'Employee logged in'}
                        {activity.activityType === 'logout' && 'Employee logged out'}
                        {activity.activityType === 'check_in' && 'Employee checked in'}
                        {activity.activityType === 'check_out' && 'Employee checked out'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
