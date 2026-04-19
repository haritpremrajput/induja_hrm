import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { Plus, Search, Wrench } from 'lucide-react';

export default function Tools() {
  const [selectedCompanyId] = useState(1); // TODO: Make dynamic
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tools, isLoading } = trpc.tools.listByCompany.useQuery(
    { companyId: selectedCompanyId },
    { enabled: !!selectedCompanyId }
  );

  const { data: assignments } = trpc.tools.getActiveAssignments.useQuery(
    { companyId: selectedCompanyId },
    { enabled: !!selectedCompanyId }
  );

  const filteredTools = tools?.filter(tool =>
    tool.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'available':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'assigned':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'damaged':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'retired':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return baseClass;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tools...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools & Materials</h1>
          <p className="text-muted-foreground mt-2">Manage tools and materials inventory</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold">{tools?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Tools</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{tools?.filter(t => t.status === 'available').length || 0}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{assignments?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{tools?.filter(t => t.status === 'damaged').length || 0}</p>
              <p className="text-xs text-muted-foreground">Damaged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by serial number..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tools Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Serial Number</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Purchase Date</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{tool.serialNumber}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(tool.status)}>
                          {tool.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {tool.purchaseDate ? new Date(tool.purchaseDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {tool.purchasePrice ? `$${parseFloat(tool.purchasePrice.toString()).toFixed(2)}` : '-'}
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
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No tools found matching your search' : 'No tools found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
