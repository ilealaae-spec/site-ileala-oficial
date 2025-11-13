import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Admin() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
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
    featured: false,
  });

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product created!' : 'Produto criado!');
      utils.products.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product updated!' : 'Produto atualizado!');
      utils.products.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product deleted!' : 'Produto excluído!');
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
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
      featured: false,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      nameEN: product.nameEN || '',
      namePT: product.namePT || '',
      descriptionEN: product.descriptionEN || '',
      descriptionPT: product.descriptionPT || '',
      price: (product.price / 100).toString(),
      imageUrl: product.imageUrl || '',
      collection: product.collection || '',
      category: product.category || '',
      stock: product.stock.toString(),
      featured: product.featured === 1,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceInFils = Math.round(parseFloat(formData.price) * 100);
    
    // Generate slug from nameEN
    const slug = formData.nameEN.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    const productData = {
      name: formData.nameEN,
      slug,
      nameEN: formData.nameEN,
      namePT: formData.namePT,
      descriptionEN: formData.descriptionEN || undefined,
      descriptionPT: formData.descriptionPT || undefined,
      price: priceInFils,
      imageUrl: formData.imageUrl || undefined,
      collection: formData.collection || undefined,
      category: formData.category || undefined,
      stock: parseInt(formData.stock),
      featured: formData.featured ? 1 : 0,
    };

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        data: productData,
      });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this product?' : 'Excluir este produto?')) {
      deleteMutation.mutate({ id });
    }
  };

  const formatPrice = (price: number) => {
    const aed = price / 100;
    return `${aed.toFixed(2)} AED`;
  };

  // Check if user is admin
  if (!user) {
    setLocation('/');
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Access Denied' : 'Acesso Negado'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'en' 
              ? 'You do not have permission to access this page.' 
              : 'Você não tem permissão para acessar esta página.'}
          </p>
          <Button onClick={() => setLocation('/')}>
            {language === 'en' ? 'Go Home' : 'Ir para Início'}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            {language === 'en' ? 'Product Management' : 'Gerenciamento de Produtos'}
          </h1>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Add Product' : 'Adicionar Produto'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {products?.map((product) => (
            <Card key={product.id} className="p-6">
              <div className="flex gap-6">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.nameEN}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{product.nameEN}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.namePT}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                    <span>Stock: {product.stock}</span>
                    {product.collection && <span>Collection: {product.collection}</span>}
                    {product.featured === 1 && (
                      <span className="text-green-600 font-semibold">Featured</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Product Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct 
                  ? (language === 'en' ? 'Edit Product' : 'Editar Produto')
                  : (language === 'en' ? 'Add Product' : 'Adicionar Produto')
                }
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameEN">Name (English) *</Label>
                  <Input
                    id="nameEN"
                    required
                    value={formData.nameEN}
                    onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="namePT">Nome (Português) *</Label>
                  <Input
                    id="namePT"
                    required
                    value={formData.namePT}
                    onChange={(e) => setFormData({ ...formData, namePT: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descriptionEN">Description (English)</Label>
                <Textarea
                  id="descriptionEN"
                  value={formData.descriptionEN}
                  onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="descriptionPT">Descrição (Português)</Label>
                <Textarea
                  id="descriptionPT"
                  value={formData.descriptionPT}
                  onChange={(e) => setFormData({ ...formData, descriptionPT: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (AED) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/product.webp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collection">Collection</Label>
                  <Input
                    id="collection"
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    editingProduct ? 'Update' : 'Create'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
