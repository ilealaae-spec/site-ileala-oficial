import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Ticket, Copy, Image, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
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

export default function CouponsTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchaseAmount: '0',
    maxUses: '0',
    validFrom: '',
    validUntil: '',
    active: true,
    // New fields for promotional images and popup
    imageUrl: '',
    showInPopup: false,
    titleEN: '',
    titlePT: '',
    descriptionEN: '',
    descriptionPT: '',
  });

  const utils = trpc.useUtils();
  const { data: coupons, isLoading } = trpc.admin.coupons.list.useQuery();
  
  const createMutation = trpc.admin.coupons.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Coupon created!' : 'Cupom criado!');
      utils.admin.coupons.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.admin.coupons.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Coupon updated!' : 'Cupom atualizado!');
      utils.admin.coupons.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.admin.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Coupon deleted!' : 'Cupom excluído!');
      utils.admin.coupons.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadMutation = trpc.admin.uploadImage.useMutation();

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: '0',
      maxUses: '0',
      validFrom: '',
      validUntil: '',
      active: true,
      imageUrl: '',
      showInPopup: false,
      titleEN: '',
      titlePT: '',
      descriptionEN: '',
      descriptionPT: '',
    });
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: parseInt(formData.discountValue),
      minPurchaseAmount: parseInt(formData.minPurchaseAmount) || 0,
      maxUses: parseInt(formData.maxUses) || 0,
      validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
      active: formData.active ? 1 : 0,
      imageUrl: formData.imageUrl || undefined,
      showInPopup: formData.showInPopup ? 1 : 0,
      titleEN: formData.titleEN || undefined,
      titlePT: formData.titlePT || undefined,
      descriptionEN: formData.descriptionEN || undefined,
      descriptionPT: formData.descriptionPT || undefined,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'A imagem deve ter menos de 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await uploadMutation.mutateAsync({
          base64,
          filename: `coupon-${Date.now()}-${file.name}`,
          contentType: file.type,
        });
        setFormData({ ...formData, imageUrl: result.url });
        toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to upload image' : 'Falha ao enviar imagem');
      setIsUploading(false);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '0',
      maxUses: coupon.maxUses?.toString() || '0',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      active: coupon.active === 1,
      imageUrl: coupon.imageUrl || '',
      showInPopup: coupon.showInPopup === 1,
      titleEN: coupon.titleEN || '',
      titlePT: coupon.titlePT || '',
      descriptionEN: coupon.descriptionEN || '',
      descriptionPT: coupon.descriptionPT || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number, code: string) => {
    if (window.confirm(
      language === 'en' 
        ? `Delete coupon "${code}"?` 
        : `Excluir cupom "${code}"?`
    )) {
      deleteMutation.mutate({ id });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(language === 'en' ? 'Code copied!' : 'Código copiado!');
  };

  const formatDiscount = (coupon: any) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      // Fixed discount is stored directly in AED
      return `${coupon.discountValue.toFixed(2)} AED`;
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
            {language === 'en' ? 'Discount Coupons' : 'Cupons de Desconto'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Create and manage promotional discount codes' 
              : 'Crie e gerencie códigos promocionais de desconto'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Coupon' : 'Adicionar Cupom'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons && coupons.length > 0 ? (
          coupons.map((coupon: any) => (
            <Card key={coupon.id} className={`p-6 ${coupon.showInPopup === 1 ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="flex items-start gap-4">
                {coupon.imageUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={coupon.imageUrl} alt={coupon.code} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-3 bg-sage-100 rounded-lg flex-shrink-0">
                    <Ticket className="w-6 h-6 text-sage-700" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg font-mono">{coupon.code}</h3>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {coupon.showInPopup === 1 && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" title={language === 'en' ? 'Shown in Popup' : 'Exibido no Popup'} />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-lg font-semibold text-sage-700">
                      {formatDiscount(coupon)} {language === 'en' ? 'OFF' : 'DESC'}
                    </p>

                    {coupon.minPurchaseAmount > 0 && (
                      <p className="text-muted-foreground">
                        {language === 'en' ? 'Min:' : 'Mín:'} {coupon.minPurchaseAmount.toFixed(2)} AED
                      </p>
                    )}

                    {coupon.maxUses > 0 && (
                      <p className="text-muted-foreground">
                        {language === 'en' ? 'Uses:' : 'Usos:'} {coupon.usedCount || 0}/{coupon.maxUses}
                      </p>
                    )}

                    {coupon.validUntil && (
                      <p className="text-muted-foreground">
                        {language === 'en' ? 'Expires:' : 'Expira:'} {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        coupon.active === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {coupon.active === 1
                          ? (language === 'en' ? 'Active' : 'Ativo')
                          : (language === 'en' ? 'Inactive' : 'Inativo')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(coupon.id, coupon.code)}
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
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'en' ? 'No coupons yet' : 'Nenhum cupom ainda'}</p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon
                ? (language === 'en' ? 'Edit Coupon' : 'Editar Cupom')
                : (language === 'en' ? 'Add Coupon' : 'Adicionar Cupom')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">{language === 'en' ? 'Coupon Code' : 'Código do Cupom'} *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
                required
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">{language === 'en' ? 'Discount Type' : 'Tipo de Desconto'} *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {language === 'en' ? 'Percentage (%)' : 'Porcentagem (%)'}
                    </SelectItem>
                    <SelectItem value="fixed">
                      {language === 'en' ? 'Fixed Amount (AED)' : 'Valor Fixo (AED)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage' 
                    ? (language === 'en' ? 'Percentage' : 'Porcentagem')
                    : (language === 'en' ? 'Amount (fils)' : 'Valor (fils)')} *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? '10' : '1000'}
                  required
                />
                {formData.discountType === 'fixed' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    1 AED = 100 fils
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchaseAmount">{language === 'en' ? 'Min Purchase (fils)' : 'Compra Mín (fils)'}</Label>
                <Input
                  id="minPurchaseAmount"
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="maxUses">{language === 'en' ? 'Max Uses (0 = unlimited)' : 'Usos Máx (0 = ilimitado)'}</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">{language === 'en' ? 'Valid From' : 'Válido De'}</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">{language === 'en' ? 'Valid Until' : 'Válido Até'}</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="active">{language === 'en' ? 'Active' : 'Ativo'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInPopup"
                  checked={formData.showInPopup}
                  onChange={(e) => setFormData({ ...formData, showInPopup: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showInPopup" className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {language === 'en' ? 'Show in Welcome Popup' : 'Mostrar no Popup de Boas-vindas'}
                </Label>
              </div>
            </div>

            {/* Promotional Image */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                {language === 'en' ? 'Promotional Image (optional)' : 'Imagem Promocional (opcional)'}
              </h4>
              <div className="space-y-3">
                {formData.imageUrl && (
                  <div className="relative w-full max-w-xs">
                    <img
                      src={formData.imageUrl}
                      alt="Coupon"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'en' ? 'Uploading...' : 'Enviando...'}
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en' ? 'Recommended: 400x200px, max 5MB' : 'Recomendado: 400x200px, máx 5MB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Popup Text Customization */}
            {formData.showInPopup && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3">
                  {language === 'en' ? 'Popup Text (shown when this coupon is in popup)' : 'Texto do Popup (exibido quando este cupom está no popup)'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titleEN">Title (EN)</Label>
                    <Input
                      id="titleEN"
                      value={formData.titleEN}
                      onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                      placeholder="Welcome to ILE ALA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="titlePT">Título (PT)</Label>
                    <Input
                      id="titlePT"
                      value={formData.titlePT}
                      onChange={(e) => setFormData({ ...formData, titlePT: e.target.value })}
                      placeholder="Bem-vindo à ILE ALA"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="descriptionEN">Description (EN)</Label>
                    <Textarea
                      id="descriptionEN"
                      value={formData.descriptionEN}
                      onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                      placeholder="Subscribe and get an exclusive discount..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionPT">Descrição (PT)</Label>
                    <Textarea
                      id="descriptionPT"
                      value={formData.descriptionPT}
                      onChange={(e) => setFormData({ ...formData, descriptionPT: e.target.value })}
                      placeholder="Inscreva-se e ganhe um desconto exclusivo..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

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
                {editingCoupon
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
