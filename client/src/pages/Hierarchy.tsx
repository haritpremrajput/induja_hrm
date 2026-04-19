import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Hierarchy() {
  const { user } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // For managers, show their hierarchy
  const managerId = user?.id || 1; // TODO: Get actual manager ID from user

  const { data: orgChart, isLoading } = trpc.hierarchy.getOrgChart.useQuery(
    { managerId },
    { enabled: !!managerId }
  );

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const HierarchyNode = ({ employee, level = 0 }: any) => (
    <div key={employee.id} className="ml-4">
      <div className="flex items-center gap-2 py-2">
        {employee.subordinates && employee.subordinates.length > 0 && (
          <button
            onClick={() => toggleNode(employee.id)}
            className="p-1 hover:bg-muted rounded"
          >
            {expandedNodes.has(employee.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <div className="flex-1 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
          <p className="font-medium">{employee.firstName} {employee.lastName}</p>
          <p className="text-xs text-muted-foreground">{employee.email}</p>
        </div>
      </div>
      {expandedNodes.has(employee.id) && employee.subordinates && employee.subordinates.length > 0 && (
        <div className="border-l-2 border-muted ml-2">
          {employee.subordinates.map((sub: any) => (
            <HierarchyNode key={sub.id} employee={sub} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading organizational hierarchy...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hierarchy</h1>
        <p className="text-muted-foreground mt-2">View organizational structure and reporting relationships</p>
      </div>

      {/* Hierarchy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold">{orgChart?.directReports.length || 0}</p>
              <p className="text-xs text-muted-foreground">Direct Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold">{orgChart?.totalReports || 0}</p>
              <p className="text-xs text-muted-foreground">Total Reports (All Levels)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Span of Control</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {orgChart && orgChart.directReports.length > 0 ? (
            <div className="space-y-2">
              <div className="p-3 border-2 border-teal-600 rounded-lg bg-teal-50">
                <p className="font-medium text-teal-900">{user?.name}</p>
                <p className="text-xs text-teal-700">{user?.email}</p>
              </div>
              <div className="ml-4">
                {orgChart.directReports.map((report) => (
                  <HierarchyNode key={report.id} employee={report} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No direct reports found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {orgChart && orgChart.allReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgChart.allReports.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{member.firstName} {member.lastName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{member.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' :
                          member.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                          member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {member.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No team members found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
