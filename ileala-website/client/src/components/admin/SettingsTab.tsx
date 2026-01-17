import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Settings, Save, Zap, Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
  });

  const [isFixingPrices, setIsFixingPrices] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);
  const [debugProducts, setDebugProducts] = useState<any[]>([]);

  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.list.useQuery();
  
  const upsertMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Setting saved!' : 'Configuração salva!');
      utils.settings.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.settings.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Setting deleted!' : 'Configuração excluída!');
      utils.settings.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const fixPricesMutation = trpc.admin.products.fixPricesAndImages.useMutation({
    onSuccess: (data) => {
      setFixResult(data);
      toast.success(language === 'en' ? `Fixed ${data.fixedCount} products!` : `${data.fixedCount} produtos corrigidos!`);
      utils.admin.products.list.invalidate();
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const debugProductsQuery = trpc.admin.products.debugProducts.useQuery(undefined, {
    enabled: false, // Only fetch when manually triggered
  });

  // Default contact settings to create
  const defaultContactSettings = [
    { key: 'contact-phone', value: '+971 50 174 2090', description: 'Phone number displayed on the website', category: 'contact' },
    { key: 'contact-email', value: 'contact@ileala.ae', description: 'Contact email address', category: 'contact' },
    { key: 'contact-address', value: 'Dubai, United Arab Emirates', description: 'Business address', category: 'contact' },
    { key: 'social-instagram', value: 'https://instagram.com/ileala.ae', description: 'Instagram profile URL', category: 'social' },
    { key: 'social-facebook', value: 'https://www.facebook.com/share/17f63HzTAk/?mibextid=wwXIfr', description: 'Facebook page URL', category: 'social' },
    { key: 'site-name', value: 'ILE ALA', description: 'Site name', category: 'general' },
    { key: 'site-url', value: 'www.ileala.ae', description: 'Main website URL', category: 'general' },
  ];

  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);

  const handleCreateDefaultSettings = async () => {
    setIsCreatingDefaults(true);
    let created = 0;
    let skipped = 0;

    for (const setting of defaultContactSettings) {
      // Check if setting already exists
      const exists = settings?.some((s: any) => s.key === setting.key);
      if (exists) {
        skipped++;
        continue;
      }

      try {
        await upsertMutation.mutateAsync(setting);
        created++;
      } catch (error) {
        console.error(`Failed to create setting ${setting.key}:`, error);
      }
    }

    setIsCreatingDefaults(false);
    toast.success(
      language === 'en'
        ? `Created ${created} settings, skipped ${skipped} existing`
        : `Criadas ${created} configurações, puladas ${skipped} existentes`
    );
    utils.settings.list.invalidate();
  };

  // Check if default settings are missing
  const missingDefaults = defaultContactSettings.filter(
    d => !settings?.some((s: any) => s.key === d.key)
  );

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      category: 'general',
    });
    setEditingSetting(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  const handleEdit = (setting: any) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description || '',
      category: setting.category || 'general',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (key: string) => {
    if (window.confirm(
      language === 'en' 
        ? `Delete setting "${key}"?` 
        : `Excluir configuração "${key}"?`
    )) {
      deleteMutation.mutate({ key });
    }
  };

  // Group settings by category
  const groupedSettings = settings?.reduce((acc: any, setting: any) => {
    const cat = setting.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting);
    return acc;
  }, {}) || {};

  const categories = Object.keys(groupedSettings);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'en' ? 'Store Settings' : 'Configurações da Loja'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage global store configuration and preferences' 
              : 'Gerencie configurações globais e preferências da loja'}
          </p>
        </div>
        <div className="flex gap-2">
          {missingDefaults.length > 0 && (
            <Button
              variant="outline"
              onClick={handleCreateDefaultSettings}
              disabled={isCreatingDefaults}
            >
              {isCreatingDefaults ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {language === 'en' ? 'Create Default Settings' : 'Criar Configurações Padrão'}
            </Button>
          )}
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Add Setting' : 'Adicionar Configuração'}
          </Button>
        </div>
      </div>

      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedSettings[category].map((setting: any) => (
                <Card key={setting.key} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1">{setting.key}</h4>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {setting.description}
                        </p>
                      )}
                      <div className="bg-sage-50 p-2 rounded font-mono text-sm break-all">
                        {setting.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {language === 'en' ? 'Updated:' : 'Atualizado:'} {new Date(setting.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(setting)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(setting.key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'en' ? 'No settings yet' : 'Nenhuma configuração ainda'}</p>
            <p className="text-sm mt-2">
              {language === 'en' 
                ? 'Add settings like shipping rates, tax rates, payment methods, etc.' 
                : 'Adicione configurações como taxas de envio, impostos, métodos de pagamento, etc.'}
            </p>
          </div>
        </Card>
      )}

      {/* Database Maintenance Section */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          {language === 'en' ? 'Database Maintenance' : 'Manutenção do Banco de Dados'}
        </h3>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">
                  {language === 'en' ? 'Fix Product Prices & Images' : 'Corrigir Preços e Imagens dos Produtos'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en'
                    ? 'This will convert prices from fils to AED (divide by 100) for products with prices > 1000, sync imageUrl with mainImage, and activate any inactive products.'
                    : 'Isso converterá preços de fils para AED (dividir por 100) para produtos com preços > 1000, sincronizará imageUrl com mainImage, e ativará produtos inativos.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    if (window.confirm(language === 'en'
                      ? 'Are you sure you want to fix prices and images? This action cannot be undone.'
                      : 'Tem certeza que deseja corrigir preços e imagens? Esta ação não pode ser desfeita.'
                    )) {
                      setIsFixingPrices(true);
                      fixPricesMutation.mutate(undefined, {
                        onSettled: () => setIsFixingPrices(false),
                      });
                    }
                  }}
                  disabled={isFixingPrices || fixPricesMutation.isPending}
                >
                  {(isFixingPrices || fixPricesMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wrench className="w-4 h-4 mr-2" />
                  )}
                  {language === 'en' ? 'Run Fix' : 'Executar Correção'}
                </Button>

                {fixResult && fixResult.changes && fixResult.changes.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      {language === 'en'
                        ? `Successfully fixed ${fixResult.fixedCount} products:`
                        : `${fixResult.fixedCount} produtos corrigidos com sucesso:`}
                    </p>
                    <ul className="text-xs text-green-700 space-y-1 max-h-40 overflow-y-auto">
                      {fixResult.changes.map((change: any) => (
                        <li key={change.id}>
                          <strong>{change.name}</strong>: {change.oldPrice} → {change.newPrice} AED
                          {change.imageFixed && ' (image synced)'}
                          {change.activeFixed && ' (activated)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Products Button */}
            <div className="flex items-start gap-3 mt-6 pt-6 border-t">
              <Wrench className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">
                  {language === 'en' ? 'Debug Products' : 'Debug de Produtos'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en'
                    ? 'View all products with their active status, category and collection values.'
                    : 'Ver todos os produtos com seus status ativo, categoria e coleção.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={async () => {
                    const result = await debugProductsQuery.refetch();
                    if (result.data) {
                      setDebugProducts(result.data);
                      toast.success(`Found ${result.data.length} products`);
                    }
                  }}
                  disabled={debugProductsQuery.isFetching}
                >
                  {debugProductsQuery.isFetching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wrench className="w-4 h-4 mr-2" />
                  )}
                  {language === 'en' ? 'Load Products Debug' : 'Carregar Debug de Produtos'}
                </Button>

                {debugProducts.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 max-h-60 overflow-y-auto">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      {language === 'en' ? `${debugProducts.length} products found:` : `${debugProducts.length} produtos encontrados:`}
                    </p>
                    <table className="text-xs text-blue-700 w-full">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left p-1">ID</th>
                          <th className="text-left p-1">Name</th>
                          <th className="text-left p-1">Active</th>
                          <th className="text-left p-1">Category</th>
                          <th className="text-left p-1">Collection</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugProducts.map((p: any) => (
                          <tr key={p.id} className={p.active !== 1 ? 'bg-red-100' : ''}>
                            <td className="p-1">{p.id}</td>
                            <td className="p-1">{p.name}</td>
                            <td className="p-1 font-mono">{String(p.active)}</td>
                            <td className="p-1">{p.category || '-'}</td>
                            <td className="p-1">{p.collection || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSetting
                ? (language === 'en' ? 'Edit Setting' : 'Editar Configuração')
                : (language === 'en' ? 'Add Setting' : 'Adicionar Configuração')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="key">{language === 'en' ? 'Setting Key' : 'Chave da Configuração'} *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="shipping_rate_local"
                required
                disabled={!!editingSetting}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' 
                  ? 'Use lowercase with underscores (e.g., tax_rate, currency)' 
                  : 'Use minúsculas com underscores (ex: taxa_imposto, moeda)'}
              </p>
            </div>

            <div>
              <Label htmlFor="value">{language === 'en' ? 'Value' : 'Valor'} *</Label>
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="25"
                rows={3}
                required
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="description">{language === 'en' ? 'Description' : 'Descrição'}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'en' ? 'What this setting controls' : 'O que esta configuração controla'}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="category">{language === 'en' ? 'Category' : 'Categoria'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                type="submit"
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Save' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
