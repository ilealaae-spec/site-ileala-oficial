import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Loader2, Download, Search, Users, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Customers() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers, isLoading } = trpc.admin.customers.list.useQuery();

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchQuery) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter((customer: any) =>
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!customers) return { total: 0, verified: 0, unverified: 0 };
    
    return {
      total: customers.length,
      verified: customers.filter((c: any) => c.emailVerified === 1).length,
      unverified: customers.filter((c: any) => c.emailVerified === 0).length,
    };
  }, [customers]);

  // Export to CSV
  const exportToCSV = () => {
    if (!customers || customers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'City', 'Country', 'Email Verified', 'Created At'];
    const rows = customers.map((customer: any) => [
      customer.name || '',
      customer.email || '',
      customer.phone || '',
      customer.city || '',
      customer.country || '',
      customer.emailVerified === 1 ? 'Yes' : 'No',
      customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ileala-customers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Customer list exported successfully!');
  };

  // Export emails only (for mailing list)
  const exportEmailsOnly = () => {
    if (!customers || customers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    // Get verified emails only
    const verifiedEmails = customers
      .filter((c: any) => c.emailVerified === 1)
      .map((c: any) => c.email)
      .filter(Boolean);

    if (verifiedEmails.length === 0) {
      toast.error('No verified emails to export');
      return;
    }

    // Create CSV with emails only
    const csvContent = ['Email', ...verifiedEmails].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ileala-mailing-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${verifiedEmails.length} verified emails exported!`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'en' ? 'Customer Management' : 'Gerenciamento de Clientes'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'View and manage your customer database' 
            : 'Visualize e gerencie sua base de clientes'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Total Customers' : 'Total de Clientes'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Verified Emails' : 'Emails Verificados'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Unverified' : 'Não Verificados'}
            </CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unverified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'en' ? 'Search by name, email, or phone...' : 'Buscar por nome, email ou telefone...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                onClick={exportEmailsOnly}
                variant="outline"
                className="flex-1 md:flex-none"
              >
                <Mail className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Export Emails' : 'Exportar Emails'}
              </Button>
              <Button 
                onClick={exportToCSV}
                className="flex-1 md:flex-none"
              >
                <Download className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Export All' : 'Exportar Tudo'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Customer List' : 'Lista de Clientes'}
          </CardTitle>
          <CardDescription>
            {filteredCustomers.length} {language === 'en' ? 'customers found' : 'clientes encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'en' ? 'Name' : 'Nome'}</TableHead>
                  <TableHead>{language === 'en' ? 'Email' : 'Email'}</TableHead>
                  <TableHead>{language === 'en' ? 'Phone' : 'Telefone'}</TableHead>
                  <TableHead>{language === 'en' ? 'Location' : 'Localização'}</TableHead>
                  <TableHead>{language === 'en' ? 'Status' : 'Status'}</TableHead>
                  <TableHead>{language === 'en' ? 'Joined' : 'Cadastro'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {language === 'en' ? 'No customers found' : 'Nenhum cliente encontrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>
                        {customer.city && customer.country 
                          ? `${customer.city}, ${customer.country}`
                          : customer.country || customer.city || '-'}
                      </TableCell>
                      <TableCell>
                        {customer.emailVerified === 1 ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {language === 'en' ? 'Verified' : 'Verificado'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            {language === 'en' ? 'Unverified' : 'Não Verificado'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.createdAt 
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
