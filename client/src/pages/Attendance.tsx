import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function Attendance() {
  const [selectedCompanyId] = useState(1); // TODO: Make dynamic
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  const { data: departments } = trpc.reference.getDepartments.useQuery(
    { companyId: selectedCompanyId },
    { enabled: !!selectedCompanyId }
  );

  const { data: heatmapData, isLoading: heatmapLoading } = trpc.dashboard.getAttendanceHeatmap.useQuery(
    { departmentId: selectedDepartmentId!, startDate, endDate },
    { enabled: !!selectedDepartmentId }
  );

  const { data: presentToday } = trpc.attendance.getPresentToday.useQuery(
    { companyId: selectedCompanyId }
  );

  // Group attendance data by date for heatmap visualization
  const attendanceByDate = heatmapData?.reduce((acc: any, record) => {
    const dateStr = record.attendanceDate.toString();
    if (!acc[dateStr]) {
      acc[dateStr] = { present: 0, absent: 0, onLeave: 0, total: 0 };
    }
    acc[dateStr].total++;
    if (record.status === 'present' || record.status === 'half_day') {
      acc[dateStr].present++;
    } else if (record.status === 'absent') {
      acc[dateStr].absent++;
    } else if (record.status === 'on_leave') {
      acc[dateStr].onLeave++;
    }
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">Track and manage employee attendance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{presentToday || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-teal-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-ins</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-outs</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <Button
                  key={dept.id}
                  variant={selectedDepartmentId === dept.id ? 'default' : 'outline'}
                  onClick={() => setSelectedDepartmentId(dept.id)}
                  className={selectedDepartmentId === dept.id ? 'bg-teal-600' : ''}
                >
                  {dept.name}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No departments found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Heatmap */}
      {selectedDepartmentId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {heatmapLoading ? (
              <div className="text-center py-8">Loading heatmap data...</div>
            ) : heatmapData && heatmapData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(attendanceByDate).map(([date, stats]: any) => {
                    const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
                    const intensity = percentage > 80 ? 'bg-green-600' :
                                    percentage > 60 ? 'bg-green-400' :
                                    percentage > 40 ? 'bg-yellow-400' :
                                    'bg-red-400';
                    return (
                      <div
                        key={date}
                        className={`p-3 rounded-lg ${intensity} text-white text-center text-xs font-medium cursor-pointer hover:opacity-80 transition`}
                        title={`${date}: ${stats.present}/${stats.total} present`}
                      >
                        <div className="text-xs">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="text-lg font-bold">{Math.round(percentage)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-sm mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>80%+ Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span>40-60% Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span>&lt;40% Present</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No attendance data available</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
