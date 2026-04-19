import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { useRoute } from 'wouter';
import { Mail, Phone, MapPin, Briefcase, Calendar, User } from 'lucide-react';

export default function EmployeeDetail() {
  const [match, params] = useRoute('/employees/:id');
  const employeeId = params?.id ? parseInt(params.id) : null;

  const { data: employee, isLoading } = trpc.employees.getById.useQuery(
    { id: employeeId! },
    { enabled: !!employeeId }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
  });

  if (!match || !employeeId) {
    return <div className="text-center py-8">Invalid employee ID</div>;
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading employee details...</div>;
  }

  if (!employee) {
    return <div className="text-center py-8">Employee not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{employee.firstName} {employee.lastName}</h1>
          <p className="text-muted-foreground mt-2">{employee.employeeCode}</p>
        </div>
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mx-auto">
                <User className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-center">
                <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                <p className="text-sm text-muted-foreground">{employee.employeeCode}</p>
              </div>
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{employee.email}</p>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{employee.phone}</p>
                  </div>
                )}
                {employee.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{employee.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <Input value={employee.firstName} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <Input value={employee.lastName} disabled />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={employee.email} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input value={employee.phone || ''} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input value={employee.location || ''} disabled />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-teal-600 hover:bg-teal-700">Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  {employee.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  )}
                  {employee.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{employee.location}</p>
                    </div>
                  )}
                  {employee.dateOfBirth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  employee.status === 'active' ? 'bg-green-100 text-green-800' :
                  employee.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                  employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {employee.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joining Date</p>
                <p className="font-medium">{new Date(employee.joiningDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">View Attendance</Button>
            <Button variant="outline" className="w-full">View Leave History</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
