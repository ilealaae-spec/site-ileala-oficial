import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CategoriesTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
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
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const uploadImageMutation = trpc.admin.uploadImage.useMutation();
  
  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Category created!' : 'Categoria criada!');
      utils.categories.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Category updated!' : 'Categoria atualizada!');
      utils.categories.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Category deleted!' : 'Categoria excluída!');
      utils.categories.list.invalidate();
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
    setEditingCategory(null);
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

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
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
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/xxx;base64, prefix
          
          const result = await uploadImageMutation.mutateAsync({
            fileName: file.name,
            contentType: file.type,
            fileData: base64Data,
          });
          setFormData(prev => ({ ...prev, imageUrl: result.url }));
          toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
        } catch (error: any) {
          console.error('Upload error:', error);
          toast.error(error?.message || (language === 'en' ? 'Upload failed' : 'Falha no upload'));
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error(language === 'en' ? 'Failed to read file' : 'Falha ao ler arquivo');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('File read error:', error);
      toast.error(language === 'en' ? 'Upload failed' : 'Falha no upload');
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
            {language === 'en' ? 'Product Categories' : 'Categorias de Produtos'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage product categories and organization' 
              : 'Gerencie categorias e organização de produtos'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Category' : 'Adicionar Categoria'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories && categories.length > 0 ? (
          categories.map((category) => (
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
              <p>{language === 'en' ? 'No categories yet' : 'Nenhuma categoria ainda'}</p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? (language === 'en' ? 'Edit Category' : 'Editar Categoria')
                : (language === 'en' ? 'Add Category' : 'Adicionar Categoria')}
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
              <Label>{language === 'en' ? 'Category Image' : 'Imagem da Categoria'}</Label>
              {formData.imageUrl ? (
                <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  ) : (
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                      </p>
                    </div>
                  )}
                </div>
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
                {editingCategory
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
