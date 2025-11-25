import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, FileText, Code, Image as ImageIcon, Download, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { translations } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ContentTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const [formData, setFormData] = useState({
    key: '',
    contentType: 'text',
    contentEN: '',
    contentPT: '',
    metadata: '',
  });

  const utils = trpc.useUtils();
  const { data: contents, isLoading } = trpc.cms.content.list.useQuery();
  
  const upsertMutation = trpc.cms.content.upsert.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Content saved!' : 'Conteúdo salvo!');
      utils.cms.content.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.cms.content.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Content deleted!' : 'Conteúdo excluído!');
      utils.cms.content.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      key: '',
      contentType: 'text',
      contentEN: '',
      contentPT: '',
      metadata: '',
    });
    setEditingContent(null);
  };

  const handleEdit = (content: any) => {
    setEditingContent(content);
    setFormData({
      key: content.key || '',
      contentType: content.contentType || 'text',
      contentEN: content.contentEN || '',
      contentPT: content.contentPT || '',
      metadata: content.metadata || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'en' ? 'Delete this content?' : 'Excluir este conteúdo?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  // Flatten nested object to dot notation
  const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    const flattened: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        flattened[newKey] = value;
      } else if (Array.isArray(value)) {
        // Skip arrays (testimonials)
        continue;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(flattened, flattenObject(value, newKey));
      }
    }
    
    return flattened;
  };

  const handleImportFromI18n = async () => {
    if (!window.confirm(language === 'en' 
      ? 'Import all translations from i18n? This will add all content entries.'
      : 'Importar todas as traduções do i18n? Isso adicionará todas as entradas de conteúdo.')) {
      return;
    }

    setIsImporting(true);
    
    try {
      const enFlat = flattenObject(translations.en);
      const ptFlat = flattenObject(translations.pt);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const key of Object.keys(enFlat)) {
        try {
          await upsertMutation.mutateAsync({
            key,
            contentType: 'text',
            contentEN: enFlat[key],
            contentPT: ptFlat[key] || enFlat[key],
            metadata: JSON.stringify({ category: key.split('.')[0], imported: true }),
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import ${key}:`, error);
          errorCount++;
        }
      }
      
      toast.success(language === 'en'
        ? `Imported ${successCount} entries! ${errorCount > 0 ? `(${errorCount} errors)` : ''}`
        : `${successCount} entradas importadas! ${errorCount > 0 ? `(${errorCount} erros)` : ''}`);
      
      utils.cms.content.list.invalidate();
    } catch (error) {
      toast.error(language === 'en' ? 'Import failed!' : 'Falha na importação!');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(language === 'en'
      ? 'Delete ALL content entries? This cannot be undone!'
      : 'Excluir TODAS as entradas de conteúdo? Isso não pode ser desfeito!')) {
      return;
    }

    try {
      for (const content of contents || []) {
        await deleteMutation.mutateAsync({ id: content.id });
      }
      toast.success(language === 'en' ? 'All content deleted!' : 'Todo o conteúdo excluído!');
      utils.cms.content.list.invalidate();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to clear content!' : 'Falha ao limpar conteúdo!');
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'html':
      case 'markdown':
        return <Code className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; pt: string }> = {
      text: { en: 'Text', pt: 'Texto' },
      html: { en: 'HTML', pt: 'HTML' },
      markdown: { en: 'Markdown', pt: 'Markdown' },
      image: { en: 'Image', pt: 'Imagem' },
    };
    return labels[type]?.[language] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'en' ? 'Content Management' : 'Gerenciar Conteúdo'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage editable site content and text' 
              : 'Gerenciar conteúdo e textos editáveis do site'}
          </p>
        </div>
        <div className="flex gap-2">
          {(!contents || contents.length === 0) && (
            <Button 
              onClick={handleImportFromI18n}
              disabled={isImporting}
              variant="outline"
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {language === 'en' ? 'Import from i18n' : 'Importar do i18n'}
            </Button>
          )}
          {contents && contents.length > 0 && (
            <Button 
              onClick={handleClearAll}
              variant="destructive"
              size="sm"
            >
              <Trash className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Clear All' : 'Limpar Tudo'}
            </Button>
          )}
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Add Content' : 'Adicionar Conteúdo'}
          </Button>
        </div>
      </div>

      {(!contents || contents.length === 0) && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'No content yet' : 'Nenhum conteúdo ainda'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'en'
              ? 'Click "Import from i18n" to get started with all existing translations!'
              : 'Clique em "Importar do i18n" para começar com todas as traduções existentes!'}
          </p>
        </Card>
      )}

      <div className="grid gap-4">
        {contents?.map((content: any) => (
          <Card key={content.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getContentTypeIcon(content.contentType)}
                  <h3 className="font-semibold">{content.key}</h3>
                  <span className="text-xs px-2 py-1 bg-secondary rounded">
                    {getContentTypeLabel(content.contentType)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {content.contentEN && (
                    <div>
                      <p className="text-muted-foreground mb-1">English:</p>
                      <p className="line-clamp-2">{content.contentEN}</p>
                    </div>
                  )}
                  {content.contentPT && (
                    <div>
                      <p className="text-muted-foreground mb-1">Português:</p>
                      <p className="line-clamp-2">{content.contentPT}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(content)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(content.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent 
                ? (language === 'en' ? 'Edit Content' : 'Editar Conteúdo')
                : (language === 'en' ? 'Add Content' : 'Adicionar Conteúdo')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="key">
                  {language === 'en' ? 'Content Key' : 'Chave do Conteúdo'} *
                </Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder={language === 'en' ? 'e.g., about-hero-title' : 'ex: about-hero-title'}
                  required
                  disabled={!!editingContent}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' 
                    ? 'Unique identifier for this content (cannot be changed after creation)'
                    : 'Identificador único para este conteúdo (não pode ser alterado após criação)'}
                </p>
              </div>

              <div>
                <Label htmlFor="contentType">
                  {language === 'en' ? 'Content Type' : 'Tipo de Conteúdo'} *
                </Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      {language === 'en' ? 'Text' : 'Texto'}
                    </SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="image">
                      {language === 'en' ? 'Image URL' : 'URL de Imagem'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contentEN">
                  {language === 'en' ? 'Content (English)' : 'Conteúdo (Inglês)'}
                </Label>
                <Textarea
                  id="contentEN"
                  value={formData.contentEN}
                  onChange={(e) => setFormData({ ...formData, contentEN: e.target.value })}
                  rows={5}
                  placeholder={
                    formData.contentType === 'image' 
                      ? 'https://example.com/image.jpg'
                      : language === 'en' ? 'Enter content...' : 'Digite o conteúdo...'
                  }
                />
              </div>

              <div>
                <Label htmlFor="contentPT">
                  {language === 'en' ? 'Content (Portuguese)' : 'Conteúdo (Português)'}
                </Label>
                <Textarea
                  id="contentPT"
                  value={formData.contentPT}
                  onChange={(e) => setFormData({ ...formData, contentPT: e.target.value })}
                  rows={5}
                  placeholder={
                    formData.contentType === 'image' 
                      ? 'https://example.com/image.jpg'
                      : language === 'en' ? 'Enter content...' : 'Digite o conteúdo...'
                  }
                />
              </div>

              <div>
                <Label htmlFor="metadata">
                  {language === 'en' ? 'Metadata (JSON)' : 'Metadados (JSON)'}
                </Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  rows={3}
                  placeholder='{"author": "John Doe", "category": "about"}'
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' 
                    ? 'Optional JSON data for additional information'
                    : 'Dados JSON opcionais para informações adicionais'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button 
                type="submit" 
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {language === 'en' ? 'Save' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
