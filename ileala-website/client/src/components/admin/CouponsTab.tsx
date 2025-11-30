import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Ticket, Copy } from 'lucide-react';
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

export default function CouponsTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchaseAmount: '0',
    maxUses: '0',
    validFrom: '',
    validUntil: '',
    active: true,
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
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, ...data });
    } else {
      createMutation.mutate(data);
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
      return `${(coupon.discountValue / 100).toFixed(2)} AED`;
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
          coupons.map((coupon) => (
            <Card key={coupon.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sage-100 rounded-lg">
                  <Ticket className="w-6 h-6 text-sage-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg font-mono">{coupon.code}</h3>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-lg font-semibold text-sage-700">
                      {formatDiscount(coupon)} {language === 'en' ? 'OFF' : 'DESC'}
                    </p>
                    
                    {coupon.minPurchaseAmount > 0 && (
                      <p className="text-muted-foreground">
                        {language === 'en' ? 'Min:' : 'Mín:'} {(coupon.minPurchaseAmount / 100).toFixed(2)} AED
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
