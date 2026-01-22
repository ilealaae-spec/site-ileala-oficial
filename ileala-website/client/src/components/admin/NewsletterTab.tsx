import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, Download, Trash2, Search, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function NewsletterTab() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const utils = trpc.useUtils();
  const { data: subscribers, isLoading } = trpc.newsletter.list.useQuery({
    activeOnly: !showInactive,
  });

  const { data: stats } = trpc.newsletter.stats.useQuery();

  const deleteMutation = trpc.newsletter.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Subscriber deleted!' : 'Inscrito removido!');
      utils.newsletter.list.invalidate();
      utils.newsletter.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string | undefined, email: string) => {
    if (!id) {
      toast.error('Cannot delete: subscriber ID is missing');
      return;
    }
    if (confirm(`${language === 'en' ? 'Delete' : 'Remover'} ${email}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleExportCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      toast.error(language === 'en' ? 'No subscribers to export' : 'Nenhum inscrito para exportar');
      return;
    }

    const csv = [
      ['Email', 'Name', 'Subscribed At', 'Status', 'Source'],
      ...subscribers.map(sub => [
        sub.email,
        sub.name || '',
        new Date(sub.subscribedAt).toLocaleDateString(),
        (sub.active === 1 || sub.active === true) ? 'Active' : 'Inactive',
        sub.source,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(language === 'en' ? 'CSV exported!' : 'CSV exportado!');
  };

  const filteredSubscribers = subscribers?.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Subscribers' : 'Total de Inscritos'}
              </p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Active' : 'Ativos'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Inactive' : 'Inativos'}
              </p>
              <p className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === 'en' ? 'Search by email or name...' : 'Buscar por email ou nome...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowInactive(!showInactive)}
              className="flex-1 md:flex-none"
            >
              {showInactive 
                ? (language === 'en' ? 'Show Active Only' : 'Mostrar Apenas Ativos')
                : (language === 'en' ? 'Show All' : 'Mostrar Todos')
              }
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={!subscribers || subscribers.length === 0}
              className="flex-1 md:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Export CSV' : 'Exportar CSV'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Subscribers List */}
      <div className="space-y-2">
        {filteredSubscribers && filteredSubscribers.length > 0 ? (
          filteredSubscribers.map((subscriber) => (
            <Card key={subscriber.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${(subscriber.active === 1 || subscriber.active === true) ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{subscriber.email}</p>
                      {subscriber.name && (
                        <p className="text-sm text-muted-foreground truncate">{subscriber.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded">
                      {subscriber.source}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(subscriber.id, subscriber.email)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {language === 'en' ? 'No subscribers found' : 'Nenhum inscrito encontrado'}
              </p>
              <p className="text-sm">
                {searchTerm 
                  ? (language === 'en' ? 'Try a different search term' : 'Tente outro termo de busca')
                  : (language === 'en' ? 'Subscribers will appear here' : 'Os inscritos aparecerão aqui')
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
