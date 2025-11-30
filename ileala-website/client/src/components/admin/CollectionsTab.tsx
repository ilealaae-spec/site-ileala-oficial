import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, FolderOpen, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CollectionsTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '',
    nameEN: '',
    namePT: '',
    descriptionEN: '',
    descriptionPT: '',
    imageUrl: '',
    displayOrder: '0',
    active: true,
  });

  const utils = trpc.useUtils();
  const { data: collections, isLoading } = trpc.collections.list.useQuery();
  
  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Collection created!' : 'Coleção criada!');
      utils.collections.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Collection updated!' : 'Coleção atualizada!');
      utils.collections.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Collection deleted!' : 'Coleção excluída!');
      utils.collections.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadImageMutation = trpc.admin.uploadImage.useMutation({
    onSuccess: (data) => {
      toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      slug: '',
      nameEN: '',
      namePT: '',
      descriptionEN: '',
      descriptionPT: '',
      imageUrl: '',
      displayOrder: '0',
      active: true,
    });
    setEditingCollection(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      slug: formData.slug,
      nameEN: formData.nameEN,
      namePT: formData.namePT,
      descriptionEN: formData.descriptionEN || undefined,
      descriptionPT: formData.descriptionPT || undefined,
      imageUrl: formData.imageUrl || undefined,
      displayOrder: parseInt(formData.displayOrder) || 0,
      active: formData.active ? 1 : 0,
    };

    if (editingCollection) {
      updateMutation.mutate({ id: editingCollection.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCollection(category);
    setFormData({
      slug: category.slug,
      nameEN: category.nameEN,
      namePT: category.namePT,
      descriptionEN: category.descriptionEN || '',
      descriptionPT: category.descriptionPT || '',
      imageUrl: category.imageUrl || '',
      displayOrder: category.displayOrder?.toString() || '0',
      active: category.active === 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(
      language === 'en' 
        ? `Delete category "${name}"?` 
        : `Excluir categoria "${name}"?`
    )) {
      deleteMutation.mutate({ id });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];
        
        const result = await uploadImageMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          contentType: file.type,
        });
        
        setFormData(prev => ({ ...prev, imageUrl: result.url }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'en' ? 'Upload failed' : 'Falha no upload');
    } finally {
      setUploading(false);
    }
  };

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
            {language === 'en' ? 'Product Collections' : 'Coleçãos de Produtos'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage product collections and organization' 
              : 'Gerencie categorias e organização de produtos'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Collection' : 'Adicionar Coleção'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections && collections.length > 0 ? (
          collections.map((category) => (
            <Card key={category.id} className="p-6">
              <div className="flex items-start gap-4">
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.nameEN}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-sage-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-sage-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">
                    {language === 'en' ? category.nameEN : category.namePT}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.slug}
                  </p>
                  {category.descriptionEN && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {language === 'en' ? category.descriptionEN : category.descriptionPT}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      category.active === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.active === 1 
                        ? (language === 'en' ? 'Active' : 'Ativa')
                        : (language === 'en' ? 'Inactive' : 'Inativa')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Order' : 'Ordem'}: {category.displayOrder}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.nameEN)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12">
            <div className="text-center text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'en' ? 'No collections yet' : 'Nenhuma categoria ainda'}</p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCollection
                ? (language === 'en' ? 'Edit Collection' : 'Editar Coleção')
                : (language === 'en' ? 'Add Collection' : 'Adicionar Coleção')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="bed-linens"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameEN">{language === 'en' ? 'Name (EN)' : 'Nome (EN)'} *</Label>
                <Input
                  id="nameEN"
                  value={formData.nameEN}
                  onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="namePT">{language === 'en' ? 'Name (PT)' : 'Nome (PT)'} *</Label>
                <Input
                  id="namePT"
                  value={formData.namePT}
                  onChange={(e) => setFormData({ ...formData, namePT: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descriptionEN">{language === 'en' ? 'Description (EN)' : 'Descrição (EN)'}</Label>
              <Textarea
                id="descriptionEN"
                value={formData.descriptionEN}
                onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="descriptionPT">{language === 'en' ? 'Description (PT)' : 'Descrição (PT)'}</Label>
              <Textarea
                id="descriptionPT"
                value={formData.descriptionPT}
                onChange={(e) => setFormData({ ...formData, descriptionPT: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Collection Image' : 'Imagem da Coleção'}</Label>
              {formData.imageUrl ? (
                <div className="relative mt-2 inline-block">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-48 h-48 object-cover rounded-lg border-2 border-sage-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-sage-300 rounded-lg cursor-pointer hover:border-sage-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-sage-400" />
                      <span className="mt-2 text-sm text-sage-600">
                        {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayOrder">{language === 'en' ? 'Display Order' : 'Ordem de Exibição'}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="active">{language === 'en' ? 'Active' : 'Ativa'}</Label>
              </div>
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCollection
                  ? (language === 'en' ? 'Update' : 'Atualizar')
                  : (language === 'en' ? 'Create' : 'Criar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
