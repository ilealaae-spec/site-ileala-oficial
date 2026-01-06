import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import LazyImage from '@/components/LazyImage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminProducts() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Admin should use admin.products.list to see ALL products (including inactive)
  const utils = trpc.useUtils();
  const { data: products, isLoading, refetch } = trpc.admin.products.list.useQuery();
  
  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: async (data) => {
      console.log('[Admin] createMutation.onSuccess called with:', data);
      toast.success(language === 'en' ? 'Product created!' : 'Produto criado!');
      setIsDialogOpen(false);
      refetch();
      // Invalidate AND refetch public product queries to ensure images appear immediately
      await utils.products.list.invalidate();
      await utils.products.featured.invalidate();
      // Force refetch to ensure fresh data
      await utils.products.list.refetch();
      await utils.products.featured.refetch();
      resetForm();
    },
    onError: (error) => {
      console.error('[Admin] createMutation.onError called with:', error);
      console.error('[Admin] Error details:', {
        message: error.message,
        data: error.data,
        shape: error.shape,
      });
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: async (data) => {
      console.log('[Admin] updateMutation.onSuccess called with:', data);
      toast.success(language === 'en' ? 'Product updated!' : 'Produto atualizado!');
      setIsDialogOpen(false);
      refetch();
      // Invalidate AND refetch public product queries to ensure images appear immediately
      await utils.products.list.invalidate();
      await utils.products.featured.invalidate();
      // Force refetch to ensure fresh data
      await utils.products.list.refetch();
      await utils.products.featured.refetch();
      resetForm();
    },
    onError: (error) => {
      console.error('[Admin] updateMutation.onError called with:', error);
      console.error('[Admin] Error details:', {
        message: error.message,
        data: error.data,
        shape: error.shape,
      });
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product deleted!' : 'Produto deletado!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const uploadImageMutation = trpc.admin.uploadImage.useMutation();

  const [formData, setFormData] = useState({
    nameEN: '',
    namePT: '',
    descriptionEN: '',
    descriptionPT: '',
    price: '',
    imageUrl: '',
    collection: '',
    category: '',
    stock: '',
    featured: 0,
  });

  const resetForm = () => {
    setFormData({
      nameEN: '',
      namePT: '',
      descriptionEN: '',
      descriptionPT: '',
      price: '',
      imageUrl: '',
      collection: '',
      category: '',
      stock: '',
      featured: 0,
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      nameEN: product.nameEN,
      namePT: product.namePT,
      descriptionEN: product.descriptionEN || '',
      descriptionPT: product.descriptionPT || '',
      price: (product.price / 100).toString(),
      imageUrl: product.imageUrl || '',
      collection: product.collection || '',
      category: product.category || '',
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setImagePreview(product.imageUrl || '');
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl;

    // Upload image if a new file was selected
    if (imageFile) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          console.log('[Admin] Uploading image:', {
            fileName: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
          });
          
          const result = await uploadImageMutation.mutateAsync({
            fileName: imageFile.name,
            fileData: base64,
            contentType: imageFile.type,
          });
          
          console.log('[Admin] Image uploaded successfully:', {
            url: result.url,
            key: result.key,
          });
          
          imageUrl = result.url;
          
          // Now submit the product
          submitProduct(imageUrl);
        };
        reader.readAsDataURL(imageFile);
        return;
      } catch (error) {
        console.error('[Admin] Image upload error:', error);
        toast.error(language === 'en' ? 'Image upload failed' : 'Falha no upload da imagem');
        return;
      }
    }

    submitProduct(imageUrl);
  };

  const submitProduct = (imageUrl: string) => {
    // Warn if image URL is from Sanity
    if (imageUrl && imageUrl.includes('cdn.sanity.io')) {
      toast.warning(
        language === 'en' 
          ? 'Warning: Image URL is from Sanity. Please upload a new image to S3.' 
          : 'Aviso: URL da imagem é do Sanity. Por favor, faça upload de uma nova imagem para S3.'
      );
    }

    console.log('[Admin] Submitting product:', {
      editing: !!editingProduct,
      productId: editingProduct?.id,
      imageUrl,
      nameEN: formData.nameEN,
    });

    // Generate slug from nameEN (only for new products)
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();
    };

    const productData = {
      name: formData.nameEN, // Use nameEN as the main name
      slug: editingProduct ? editingProduct.slug : generateSlug(formData.nameEN), // Generate slug for new products
      nameEN: formData.nameEN,
      namePT: formData.namePT,
      descriptionEN: formData.descriptionEN,
      descriptionPT: formData.descriptionPT,
      price: Math.round(parseFloat(formData.price) * 100),
      imageUrl, // Ensure imageUrl is included
      collection: formData.collection,
      category: formData.category,
      stock: parseInt(formData.stock),
      featured: formData.featured,
      active: 1, // Always set active = 1 when creating/updating products
    };

    console.log('[Admin] Product data to save:', {
      ...productData,
      imageUrl, // Log the imageUrl to verify it's being sent
    });

    if (editingProduct) {
      // For updates, include active status from the checkbox
      const activeCheckbox = document.getElementById('active') as HTMLInputElement;
      updateMutation.mutate({
        id: editingProduct.id,
        data: {
          ...productData,
          active: activeCheckbox?.checked ? 1 : 0,
        },
      });
    } else {
      // For new products, always set active = 1
      createMutation.mutate({
        ...productData,
        active: 1,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this product?' : 'Deletar este produto?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'en' ? 'Manage Products' : 'Gerenciar Produtos'}
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Product' : 'Adicionar Produto'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? (language === 'en' ? 'Edit Product' : 'Editar Produto')
                  : (language === 'en' ? 'Add New Product' : 'Adicionar Novo Produto')}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>{language === 'en' ? 'Product Image' : 'Imagem do Produto'}</Label>
                <div className="mt-2">
                  {imagePreview && (
                    <div className="relative w-full h-48 mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({ ...formData, imageUrl: '' });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Upload' : 'Enviar'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'en' ? 'Or paste image URL below' : 'Ou cole a URL da imagem abaixo'}
                  </p>
                  <Input
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* English Name */}
              <div>
                <Label htmlFor="nameEN">{language === 'en' ? 'Name (English)' : 'Nome (Inglês)'} *</Label>
                <Input
                  id="nameEN"
                  required
                  value={formData.nameEN}
                  onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
                />
              </div>

              {/* Portuguese Name */}
              <div>
                <Label htmlFor="namePT">{language === 'en' ? 'Name (Portuguese)' : 'Nome (Português)'} *</Label>
                <Input
                  id="namePT"
                  required
                  value={formData.namePT}
                  onChange={(e) => setFormData({ ...formData, namePT: e.target.value })}
                />
              </div>

              {/* English Description */}
              <div>
                <Label htmlFor="descEN">{language === 'en' ? 'Description (English)' : 'Descrição (Inglês)'}</Label>
                <Textarea
                  id="descEN"
                  value={formData.descriptionEN}
                  onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Portuguese Description */}
              <div>
                <Label htmlFor="descPT">{language === 'en' ? 'Description (Portuguese)' : 'Descrição (Português)'}</Label>
                <Textarea
                  id="descPT"
                  value={formData.descriptionPT}
                  onChange={(e) => setFormData({ ...formData, descriptionPT: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <Label htmlFor="price">{language === 'en' ? 'Price (AED)' : 'Preço (AED)'} *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                {/* Stock */}
                <div>
                  <Label htmlFor="stock">{language === 'en' ? 'Stock' : 'Estoque'} *</Label>
                  <Input
                    id="stock"
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Collection */}
                <div>
                  <Label htmlFor="collection">{language === 'en' ? 'Collection' : 'Coleção'}</Label>
                  <Input
                    id="collection"
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">{language === 'en' ? 'Category' : 'Categoria'}</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured === 1}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured">{language === 'en' ? 'Featured Product' : 'Produto em Destaque'}</Label>
              </div>

              {/* Active Status - Always show as checked for new products, allow editing for existing */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingProduct ? (editingProduct.active === 1) : true}
                  onChange={(e) => {
                    // For new products, always keep active = 1
                    if (!editingProduct) return;
                    // For existing products, allow toggling
                    // Note: active is not in formData, we'll handle it in submitProduct
                  }}
                  disabled={!editingProduct}
                  className="w-4 h-4"
                />
                <Label htmlFor="active">
                  {language === 'en' ? 'Active (visible on site)' : 'Ativo (visível no site)'}
                  {!editingProduct && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({language === 'en' ? 'New products are always active' : 'Novos produtos são sempre ativos'})
                    </span>
                  )}
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending}
                  className="flex-1"
                >
                  {(createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'Salvando...'}
                    </>
                  ) : (
                    language === 'en' ? 'Save Product' : 'Salvar Produto'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.filter((product, index, self) => 
          // Remove duplicates based on ID
          index === self.findIndex((p) => p.id === product.id)
        ).map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="w-full h-48 bg-muted overflow-hidden">
              {product.imageUrl ? (
                <LazyImage
                  src={product.imageUrl}
                  alt={product.nameEN || 'Product image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  {language === 'en' ? 'No image' : 'Sem imagem'}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                {language === 'en' ? product.nameEN : product.namePT}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {product.collection}
              </p>
              <p className="text-lg font-bold text-primary mb-2">
                {(product.price / 100).toFixed(2)} AED
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'en' ? 'Stock' : 'Estoque'}: {product.stock}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(product)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  {language === 'en' ? 'Edit' : 'Editar'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
