import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Building2, Users, Wrench } from 'lucide-react';
import { useState } from 'react';

export default function Companies() {
  const { data: companies, isLoading } = trpc.companies.list.useQuery();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const { data: companyDetails } = trpc.companies.getWithResources.useQuery(
    { id: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading companies...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground mt-2">Manage all companies and their resources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companies && companies.length > 0 ? (
                  companies.map((company) => (
                    <Button
                      key={company.id}
                      variant={selectedCompanyId === company.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCompanyId(company.id)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{company.name}</span>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No companies found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Details */}
        {selectedCompanyId && companyDetails && (
          <div className="lg:col-span-2 space-y-4">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>{companyDetails.company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium">{companyDetails.company.code}</p>
                </div>
                {companyDetails.company.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{companyDetails.company.location}</p>
                  </div>
                )}
                {companyDetails.company.industry && (
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{companyDetails.company.industry}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resources Overview */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-teal-600" />
                    <p className="text-2xl font-bold">{companyDetails.employees.length}</p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wrench className="h-6 w-6 mx-auto mb-2 text-teal-600" />
                    <p className="text-2xl font-bold">{companyDetails.tools.length}</p>
                    <p className="text-xs text-muted-foreground">Tools</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Building2 className="h-6 w-6 mx-auto mb-2 text-teal-600" />
                    <p className="text-2xl font-bold">{companyDetails.positions.length}</p>
                    <p className="text-xs text-muted-foreground">Open Positions</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Departments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Departments</CardTitle>
              </CardHeader>
              <CardContent>
                {companyDetails.departments.length > 0 ? (
                  <div className="space-y-2">
                    {companyDetails.departments.map((dept) => (
                      <div key={dept.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">{dept.code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No departments</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
