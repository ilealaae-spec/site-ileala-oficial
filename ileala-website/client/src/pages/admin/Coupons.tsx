import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminCoupons() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const { data: coupons, isLoading, refetch } = trpc.admin.coupons.list.useQuery();
  
  const createMutation = trpc.admin.coupons.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Coupon created!' : 'Cupom criado!');
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.admin.coupons.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Coupon updated!' : 'Cupom atualizado!');
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.admin.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Coupon deleted!' : 'Cupom deletado!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchaseAmount: '0',
    maxUses: '0',
    validUntil: '',
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: '0',
      maxUses: '0',
      validUntil: '',
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountType === 'percentage' 
        ? coupon.discountValue.toString()
        : (coupon.discountValue / 100).toString(),
      minPurchaseAmount: (coupon.minPurchaseAmount / 100).toString(),
      maxUses: coupon.maxUses.toString(),
      validUntil: coupon.validUntil 
        ? new Date(coupon.validUntil).toISOString().split('T')[0]
        : '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: formData.discountType === 'percentage'
        ? parseInt(formData.discountValue)
        : Math.round(parseFloat(formData.discountValue) * 100),
      minPurchaseAmount: Math.round(parseFloat(formData.minPurchaseAmount) * 100),
      maxUses: parseInt(formData.maxUses),
      validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
    };

    if (editingCoupon) {
      updateMutation.mutate({
        id: editingCoupon.id,
        ...couponData,
      });
    } else {
      createMutation.mutate(couponData);
    }
  };

  const handleToggleActive = (coupon: any) => {
    updateMutation.mutate({
      id: coupon.id,
      active: coupon.active === 1 ? 0 : 1,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this coupon?' : 'Deletar este cupom?')) {
      deleteMutation.mutate({ id });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR');
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
          {language === 'en' ? 'Manage Coupons' : 'Gerenciar Cupons'}
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Coupon' : 'Adicionar Cupom'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon
                  ? (language === 'en' ? 'Edit Coupon' : 'Editar Cupom')
                  : (language === 'en' ? 'Add New Coupon' : 'Adicionar Novo Cupom')}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <Label htmlFor="code">{language === 'en' ? 'Coupon Code' : 'Código do Cupom'} *</Label>
                <Input
                  id="code"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME10"
                  disabled={!!editingCoupon}
                />
              </div>

              {/* Discount Type */}
              <div>
                <Label>{language === 'en' ? 'Discount Type' : 'Tipo de Desconto'} *</Label>
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

              {/* Discount Value */}
              <div>
                <Label htmlFor="value">
                  {formData.discountType === 'percentage'
                    ? (language === 'en' ? 'Discount Percentage' : 'Porcentagem de Desconto')
                    : (language === 'en' ? 'Discount Amount (AED)' : 'Valor do Desconto (AED)')} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  required
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? '10' : '50.00'}
                />
              </div>

              {/* Min Purchase */}
              <div>
                <Label htmlFor="minPurchase">
                  {language === 'en' ? 'Minimum Purchase (AED)' : 'Compra Mínima (AED)'}
                </Label>
                <Input
                  id="minPurchase"
                  type="number"
                  step="0.01"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Max Uses */}
              <div>
                <Label htmlFor="maxUses">
                  {language === 'en' ? 'Maximum Uses (0 = unlimited)' : 'Usos Máximos (0 = ilimitado)'}
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Valid Until */}
              <div>
                <Label htmlFor="validUntil">
                  {language === 'en' ? 'Valid Until (optional)' : 'Válido Até (opcional)'}
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'Salvando...'}
                    </>
                  ) : (
                    language === 'en' ? 'Save Coupon' : 'Salvar Cupom'
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
        {coupons?.map((coupon) => (
          <Card key={coupon.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-1">{coupon.code}</h3>
                <p className="text-sm text-muted-foreground">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% ${language === 'en' ? 'OFF' : 'DE DESCONTO'}`
                    : `${(coupon.discountValue / 100).toFixed(2)} AED ${language === 'en' ? 'OFF' : 'DE DESCONTO'}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(coupon)}
              >
                {coupon.active === 1 ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </Button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              {coupon.minPurchaseAmount > 0 && (
                <p>
                  <strong>{language === 'en' ? 'Min. Purchase:' : 'Compra Mín.:'}</strong>{' '}
                  {(coupon.minPurchaseAmount / 100).toFixed(2)} AED
                </p>
              )}
              <p>
                <strong>{language === 'en' ? 'Uses:' : 'Usos:'}</strong>{' '}
                {coupon.usedCount}
                {coupon.maxUses > 0 && ` / ${coupon.maxUses}`}
              </p>
              {coupon.validUntil && (
                <p>
                  <strong>{language === 'en' ? 'Valid Until:' : 'Válido Até:'}</strong>{' '}
                  {formatDate(coupon.validUntil)}
                </p>
              )}
              <p>
                <strong>{language === 'en' ? 'Status:' : 'Status:'}</strong>{' '}
                <span className={coupon.active === 1 ? 'text-green-600' : 'text-red-600'}>
                  {coupon.active === 1 
                    ? (language === 'en' ? 'Active' : 'Ativo')
                    : (language === 'en' ? 'Inactive' : 'Inativo')}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(coupon)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                {language === 'en' ? 'Edit' : 'Editar'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(coupon.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {coupons?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {language === 'en' ? 'No coupons yet' : 'Nenhum cupom ainda'}
          </p>
        </Card>
      )}
    </div>
  );
}
