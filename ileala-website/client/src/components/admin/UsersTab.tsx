import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Loader2, Search, User, Mail, Calendar, Shield } from 'lucide-react';
import { useState } from 'react';

export default function UsersTab() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading } = trpc.users.list.useQuery();

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    regular: users?.filter(u => u.role === 'user').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Users' : 'Total de Usuários'}
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Administrators' : 'Administradores'}
              </p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Regular Users' : 'Usuários Regulares'}
              </p>
              <p className="text-2xl font-bold">{stats.regular}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={language === 'en' ? 'Search by name or email...' : 'Buscar por nome ou email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-2">
        {filteredUsers && filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <User className="w-6 h-6 text-sage-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{user.name || 'No name'}</h3>
                      {user.role === 'admin' && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>📱</span>
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {language === 'en' ? 'Joined' : 'Cadastrado em'}: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {user.address && (
                  <div className="md:text-right text-sm text-muted-foreground md:max-w-xs">
                    <p className="font-medium text-foreground mb-1">
                      {language === 'en' ? 'Address' : 'Endereço'}
                    </p>
                    <p>{user.address}</p>
                    {user.city && <p>{user.city}, {user.state}</p>}
                    {user.country && <p>{user.country}</p>}
                    {user.poBox && <p>PO Box: {user.poBox}</p>}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {language === 'en' ? 'No users found' : 'Nenhum usuário encontrado'}
              </p>
              <p className="text-sm">
                {searchTerm 
                  ? (language === 'en' ? 'Try a different search term' : 'Tente outro termo de busca')
                  : (language === 'en' ? 'Users will appear here' : 'Os usuários aparecerão aqui')
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
