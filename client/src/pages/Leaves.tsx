import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

export default function Leaves() {
  const { user } = useAuth();
  const [selectedEmployeeId] = useState(1); // TODO: Make dynamic
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveTypeId: 1,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: leaveTypes } = trpc.reference.getLeaveTypes.useQuery(
    { companyId: 1 },
    { enabled: true }
  );

  const requestLeaveMutation = trpc.leaves.request.useMutation();

  const { data: leaveRequests, isLoading, refetch } = trpc.leaves.getByEmployee.useQuery(
    { employeeId: selectedEmployeeId },
    { enabled: !!selectedEmployeeId }
  );

  useEffect(() => {
    if (requestLeaveMutation.isSuccess) {
      toast.success('Leave request submitted successfully');
      refetch();
    }
    if (requestLeaveMutation.isError) {
      toast.error('Failed to submit leave request');
    }
  }, [requestLeaveMutation.isSuccess, requestLeaveMutation.isError, refetch]);

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      await requestLeaveMutation.mutateAsync({
        employeeId: selectedEmployeeId,
        leaveTypeId: formData.leaveTypeId,
        startDate,
        endDate,
        days,
        reason: formData.reason,
      });

      setFormData({ startDate: '', endDate: '', leaveTypeId: 1, reason: '' });
      setShowRequestForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'approved':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return baseClass;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading leave requests...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaves</h1>
          <p className="text-muted-foreground mt-2">Manage leave requests and approvals</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowRequestForm(!showRequestForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Leave Request Form */}
      {showRequestForm && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="text-lg">New Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Leave Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({...formData, leaveTypeId: parseInt(e.target.value)})}
                >
                  <option value="">Select leave type...</option>
                  {leaveTypes?.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-md text-sm" 
                  rows={3} 
                  placeholder="Enter reason for leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting || !formData.startDate || !formData.endDate}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="outline" onClick={() => setShowRequestForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests && leaveRequests.length > 0 ? (
            <div className="space-y-3">
              {leaveRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.reason || 'No reason provided'}</p>
                    </div>
                  </div>
                  <span className={getStatusBadge(request.status)}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No leave requests found</div>
          )}
        </CardContent>
      </Card>

      {/* Leave Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Sick Leave</p>
              <p className="text-2xl font-bold">10 days</p>
              <p className="text-xs text-muted-foreground mt-1">2 used, 8 remaining</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Vacation</p>
              <p className="text-2xl font-bold">20 days</p>
              <p className="text-xs text-muted-foreground mt-1">5 used, 15 remaining</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Personal</p>
              <p className="text-2xl font-bold">5 days</p>
              <p className="text-xs text-muted-foreground mt-1">1 used, 4 remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
