import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Upload, X, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductsTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<Array<{url: string, alt: string}>>([]);
  
  const [formData, setFormData] = useState({
    nameEN: '',
    namePT: '',
    descriptionEN: '',
    descriptionPT: '',
    descriptionEN_full: '',
    descriptionPT_full: '',
    price: '',
    salePrice: '',
    imageUrl: '',
    mainImage: '',
    mainImageAlt: '',
    images: '',
    collection: '',
    category: '',
    stock: '',
    material: '',
    dimensions: '',
    colors: '',
    careInstructionsEN: '',
    careInstructionsPT: '',
    weight: '',
    sku: '',
    inStock: true,
    stockQuantity: '',
    featured: false,
    isNew: false,
    onSale: false,
    seoTitle: '',
    seoDescription: '',
  });

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.products.list.useQuery();
  const { data: collections } = trpc.collections.list.useQuery() as { data: any[] | undefined };
  const { data: categories } = trpc.categories.list.useQuery() as { data: any[] | undefined };
  
  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product created!' : 'Produto criado!');
      utils.products.list.invalidate();
      utils.admin.products.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product updated!' : 'Produto atualizado!');
      utils.products.list.invalidate();
      utils.admin.products.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Product deleted!' : 'Produto excluído!');
      utils.products.list.invalidate();
      utils.admin.products.list.invalidate();
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
      nameEN: '',
      namePT: '',
      descriptionEN: '',
      descriptionPT: '',
      descriptionEN_full: '',
      descriptionPT_full: '',
      price: '',
      salePrice: '',
      imageUrl: '',
      mainImage: '',
      mainImageAlt: '',
      images: '',
      collection: '',
      category: '',
      stock: '',
      material: '',
      dimensions: '',
      colors: '',
      careInstructionsEN: '',
      careInstructionsPT: '',
      weight: '',
      sku: '',
      inStock: true,
      stockQuantity: '',
      featured: false,
      isNew: false,
      onSale: false,
      seoTitle: '',
      seoDescription: '',
    });
    setEditingProduct(null);
    setAdditionalImages([]);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      nameEN: product.nameEN || '',
      namePT: product.namePT || '',
      descriptionEN: product.descriptionEN || '',
      descriptionPT: product.descriptionPT || '',
      descriptionEN_full: product.descriptionEN_full || '',
      descriptionPT_full: product.descriptionPT_full || '',
      price: (product.price / 100).toString(),
      salePrice: product.salePrice ? (product.salePrice / 100).toString() : '',
      imageUrl: product.imageUrl || '',
      mainImage: product.mainImage || '',
      mainImageAlt: product.mainImageAlt || '',
      images: product.images || '',
      collection: product.collection || '',
      category: product.category || '',
      stock: product.stock.toString(),
      material: product.material || '',
      dimensions: product.dimensions || '',
      colors: product.colors || '',
      careInstructionsEN: product.careInstructionsEN || '',
      careInstructionsPT: product.careInstructionsPT || '',
      weight: product.weight ? product.weight.toString() : '',
      sku: product.sku || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '',
      featured: product.featured === 1,
      isNew: product.isNew || false,
      onSale: product.onSale || false,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
    });
    // Parse additional images
    try {
      const parsedImages = product.images ? JSON.parse(product.images) : [];
      setAdditionalImages(Array.isArray(parsedImages) ? parsedImages : []);
    } catch (e) {
      setAdditionalImages([]);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceInFils = Math.round(parseFloat(formData.price) * 100);
    const salePriceInFils = formData.salePrice ? Math.round(parseFloat(formData.salePrice) * 100) : undefined;
    
    // Generate slug from nameEN
    const slug = formData.nameEN.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    const productData = {
      name: formData.nameEN,
      slug,
      nameEN: formData.nameEN,
      namePT: formData.namePT,
      descriptionEN: formData.descriptionEN || undefined,
      descriptionPT: formData.descriptionPT || undefined,
      descriptionEN_full: formData.descriptionEN_full || undefined,
      descriptionPT_full: formData.descriptionPT_full || undefined,
      price: priceInFils,
      salePrice: salePriceInFils,
      imageUrl: formData.imageUrl || undefined,
      mainImage: formData.mainImage || undefined,
      mainImageAlt: formData.mainImageAlt || undefined,
      images: additionalImages.length > 0 ? JSON.stringify(additionalImages) : undefined,
      collection: formData.collection || undefined,
      category: formData.category || undefined,
      stock: parseInt(formData.stock),
      material: formData.material || undefined,
      dimensions: formData.dimensions || undefined,
      colors: formData.colors || undefined,
      careInstructionsEN: formData.careInstructionsEN || undefined,
      careInstructionsPT: formData.careInstructionsPT || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      sku: formData.sku || undefined,
      inStock: formData.inStock,
      stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined,
      featured: formData.featured ? 1 : 0,
      isNew: formData.isNew,
      onSale: formData.onSale,
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
    };

    if (editingProduct) {
      updateMutation.mutate({
        id: Number(editingProduct.id),
        data: productData,
      });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleDelete = (id: number | string) => {
    if (confirm(language === 'en' ? 'Delete this product?' : 'Excluir este produto?')) {
      deleteMutation.mutate({ id: Number(id) });
    }
  };

  const formatPrice = (price: number) => {
    const aed = price / 100;
    return `${aed.toFixed(2)} AED`;
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
          <h2 className="text-2xl font-bold text-sage-900 mb-2">
            {language === 'en' ? 'Product Management' : 'Gerenciamento de Produtos'}
          </h2>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Add, edit, and manage your products' 
              : 'Adicione, edite e gerencie seus produtos'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Product' : 'Adicionar Produto'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="p-6">
              <div className="flex gap-6">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {(product.mainImage || product.imageUrl) ? (
                    <img
                      src={product.mainImage || product.imageUrl}
                      alt={product.mainImageAlt || product.nameEN}
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
                  <div className="flex gap-4 text-sm flex-wrap">
                    <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                    {product.salePrice && (
                      <span className="text-green-600 font-semibold">Sale: {formatPrice(product.salePrice)}</span>
                    )}
                    <span className={product.stock < 10 ? 'text-orange-600 font-semibold' : ''}>
                      Stock: {product.stock}
                    </span>
                    {product.sku && <span>SKU: {product.sku}</span>}
                    {product.collection && <span>Collection: {product.collection}</span>}
                    {product.featured === 1 && (
                      <span className="text-green-600 font-semibold">⭐ Featured</span>
                    )}
                    {product.isNew && (
                      <span className="text-blue-600 font-semibold">🆕 New</span>
                    )}
                    {product.onSale && (
                      <span className="text-red-600 font-semibold">🔥 Sale</span>
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
          ))
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">
                {language === 'en' ? 'No products yet' : 'Nenhum produto ainda'}
              </p>
              <p className="text-sm mb-4">
                {language === 'en' ? 'Start by adding your first product' : 'Comece adicionando seu primeiro produto'}
              </p>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Add Product' : 'Adicionar Produto'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct 
                ? (language === 'en' ? 'Edit Product' : 'Editar Produto')
                : (language === 'en' ? 'Add Product' : 'Adicionar Produto')
              }
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">
                  {language === 'en' ? 'Basic' : 'Básico'}
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  {language === 'en' ? 'Pricing' : 'Preços'}
                </TabsTrigger>
                <TabsTrigger value="images">
                  {language === 'en' ? 'Images' : 'Imagens'}
                </TabsTrigger>
                <TabsTrigger value="specs">
                  {language === 'en' ? 'Specs' : 'Especificações'}
                </TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* BASIC TAB */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameEN">Name (English) *</Label>
                    <Input
                      id="nameEN"
                      value={formData.nameEN}
                      onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="namePT">Nome (Português) *</Label>
                    <Input
                      id="namePT"
                      value={formData.namePT}
                      onChange={(e) => setFormData({ ...formData, namePT: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descriptionEN">Short Description (English)</Label>
                  <Textarea
                    id="descriptionEN"
                    value={formData.descriptionEN}
                    onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                    rows={2}
                    maxLength={160}
                    placeholder="Max 160 characters"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionPT">Descrição Curta (Português)</Label>
                  <Textarea
                    id="descriptionPT"
                    value={formData.descriptionPT}
                    onChange={(e) => setFormData({ ...formData, descriptionPT: e.target.value })}
                    rows={2}
                    maxLength={160}
                    placeholder="Máximo 160 caracteres"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionEN_full">Full Description (English)</Label>
                  <Textarea
                    id="descriptionEN_full"
                    value={formData.descriptionEN_full}
                    onChange={(e) => setFormData({ ...formData, descriptionEN_full: e.target.value })}
                    rows={6}
                    placeholder="Complete product description"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionPT_full">Descrição Completa (Português)</Label>
                  <Textarea
                    id="descriptionPT_full"
                    value={formData.descriptionPT_full}
                    onChange={(e) => setFormData({ ...formData, descriptionPT_full: e.target.value })}
                    rows={6}
                    placeholder="Descrição completa do produto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="collection">Collection</Label>
                    <Select
                      value={formData.collection}
                      onValueChange={(value) => setFormData({ ...formData, collection: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {collections && collections.map((col) => (
                          <SelectItem key={col.id} value={col.slug}>
                            {language === 'en' ? col.nameEN : col.namePT}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories && categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {language === 'en' ? cat.nameEN : cat.namePT}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      ⭐ {language === 'en' ? 'Featured Product' : 'Produto em Destaque'}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isNew" className="cursor-pointer">
                      🆕 {language === 'en' ? 'New Product' : 'Produto Novo'}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="onSale"
                      checked={formData.onSale}
                      onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="onSale" className="cursor-pointer">
                      🔥 {language === 'en' ? 'On Sale' : 'Em Promoção'}
                    </Label>
                  </div>
                </div>
              </TabsContent>

              {/* PRICING TAB */}
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (AED) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="e.g., 390.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price (AED)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="Leave empty if not on sale"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock (Legacy)</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="Actual quantity"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2 h-10">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="inStock" className="cursor-pointer">
                        {language === 'en' ? 'In Stock' : 'Em Estoque'}
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">SKU (Product Code)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., NAPKGREE23X5GREE"
                  />
                </div>
              </TabsContent>

              {/* IMAGES TAB */}
              <TabsContent value="images" className="space-y-6">
                {/* Main Image Upload */}
                <div className="space-y-3">
                  <Label>Main Product Image</Label>
                  <div className="flex gap-4">
                    {formData.mainImage && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={formData.mainImage}
                          alt="Main preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mainImage: '', mainImageAlt: '' })}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingMain}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setUploadingMain(true);
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
                              
                              setFormData({ 
                                ...formData, 
                                mainImage: result.url,
                                mainImageAlt: formData.nameEN || 'Product image'
                              });
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            console.error('Upload error:', error);
                          } finally {
                            setUploadingMain(false);
                          }
                        }}
                      />
                      {uploadingMain ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-2">Upload</span>
                        </>
                      )}
                    </label>
                  </div>
                  <Input
                    placeholder="Alt text for accessibility"
                    value={formData.mainImageAlt}
                    onChange={(e) => setFormData({ ...formData, mainImageAlt: e.target.value })}
                  />
                </div>

                {/* Additional Images */}
                <div className="space-y-3">
                  <Label>Additional Images (up to 10)</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAdditionalImages(additionalImages.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {additionalImages.length < 10 && (
                      <label className="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
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
                                
                                setAdditionalImages([
                                  ...additionalImages,
                                  { url: result.url, alt: formData.nameEN || 'Product image' }
                                ]);
                              };
                              reader.readAsDataURL(file);
                            } catch (error) {
                              console.error('Upload error:', error);
                            }
                          }}
                        />
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Add</span>
                      </label>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* SPECS TAB */}
              <TabsContent value="specs" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., Resin, Rustic Wood"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="e.g., Diameter: 5 cm Height: 3 cm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 0.19"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colors">Available Colors (JSON)</Label>
                    <Input
                      id="colors"
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                      placeholder='["Green", "Gold"]'
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="careInstructionsEN">Care Instructions (English)</Label>
                  <Textarea
                    id="careInstructionsEN"
                    value={formData.careInstructionsEN}
                    onChange={(e) => setFormData({ ...formData, careInstructionsEN: e.target.value })}
                    rows={4}
                    placeholder="Washing and care instructions"
                  />
                </div>

                <div>
                  <Label htmlFor="careInstructionsPT">Instruções de Cuidado (Português)</Label>
                  <Textarea
                    id="careInstructionsPT"
                    value={formData.careInstructionsPT}
                    onChange={(e) => setFormData({ ...formData, careInstructionsPT: e.target.value })}
                    rows={4}
                    placeholder="Instruções de lavagem e cuidado"
                  />
                </div>
              </TabsContent>

              {/* SEO TAB */}
              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    maxLength={60}
                    placeholder="Max 60 characters"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={3}
                    maxLength={160}
                    placeholder="Max 160 characters"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
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
                {editingProduct 
                  ? (language === 'en' ? 'Update' : 'Atualizar')
                  : (language === 'en' ? 'Create' : 'Criar')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
