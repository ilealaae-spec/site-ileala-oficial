import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function ArtisansTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bioEN: '',
    bioPT: '',
    photoUrl: '',
    specialty: '',
    location: '',
    email: '',
    phone: '',
    socialMedia: '',
    featured: false,
  });

  const utils = trpc.useUtils();
  const { data: artisans, isLoading } = trpc.cms.artisans.list.useQuery();
  
  const createMutation = trpc.cms.artisans.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Artisan created!' : 'Artesão criado!');
      utils.cms.artisans.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.cms.artisans.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Artisan updated!' : 'Artesão atualizado!');
      utils.cms.artisans.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.cms.artisans.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Artisan deleted!' : 'Artesão excluído!');
      utils.cms.artisans.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      bioEN: '',
      bioPT: '',
      photoUrl: '',
      specialty: '',
      location: '',
      email: '',
      phone: '',
      socialMedia: '',
      featured: false,
    });
    setEditingArtisan(null);
  };

  const handleEdit = (artisan: any) => {
    setEditingArtisan(artisan);
    setFormData({
      name: artisan.name || '',
      bioEN: artisan.bioEN || '',
      bioPT: artisan.bioPT || '',
      photoUrl: artisan.photoUrl || '',
      specialty: artisan.specialty || '',
      location: artisan.location || '',
      email: artisan.email || '',
      phone: artisan.phone || '',
      socialMedia: artisan.socialMedia || '',
      featured: artisan.featured === 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'en' ? 'Delete this artisan?' : 'Excluir este artesão?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      featured: formData.featured ? 1 : 0,
    };

    if (editingArtisan) {
      updateMutation.mutate({ id: editingArtisan.id, ...data });
    } else {
      createMutation.mutate(data);
    }
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
            {language === 'en' ? 'Artisans Management' : 'Gerenciar Artesãos'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Add, edit, and manage artisan profiles' 
              : 'Adicionar, editar e gerenciar perfis de artesãos'}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {language === 'en' ? 'Add Artisan' : 'Adicionar Artesão'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {artisans?.map((artisan: any) => (
          <Card key={artisan.id} className="p-4">
            <div className="flex items-start gap-4">
              {artisan.photoUrl && (
                <img 
                  src={artisan.photoUrl} 
                  alt={artisan.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{artisan.name}</h3>
                  {artisan.featured === 1 && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                {artisan.specialty && (
                  <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
                )}
                {artisan.location && (
                  <p className="text-xs text-muted-foreground">{artisan.location}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(artisan)}
                className="flex-1"
              >
                <Edit className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Edit' : 'Editar'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(artisan.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtisan 
                ? (language === 'en' ? 'Edit Artisan' : 'Editar Artesão')
                : (language === 'en' ? 'Add Artisan' : 'Adicionar Artesão')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">{language === 'en' ? 'Name' : 'Nome'} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialty">{language === 'en' ? 'Specialty' : 'Especialidade'}</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder={language === 'en' ? 'e.g., Ceramics, Textiles' : 'ex: Cerâmica, Têxteis'}
                />
              </div>

              <div>
                <Label htmlFor="bioEN">{language === 'en' ? 'Bio (English)' : 'Bio (Inglês)'}</Label>
                <Textarea
                  id="bioEN"
                  value={formData.bioEN}
                  onChange={(e) => setFormData({ ...formData, bioEN: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="bioPT">{language === 'en' ? 'Bio (Portuguese)' : 'Bio (Português)'}</Label>
                <Textarea
                  id="bioPT"
                  value={formData.bioPT}
                  onChange={(e) => setFormData({ ...formData, bioPT: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="photoUrl">{language === 'en' ? 'Photo URL' : 'URL da Foto'}</Label>
                <Input
                  id="photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">{language === 'en' ? 'Location' : 'Localização'}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{language === 'en' ? 'Phone' : 'Telefone'}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="socialMedia">
                  {language === 'en' ? 'Social Media (JSON)' : 'Redes Sociais (JSON)'}
                </Label>
                <Textarea
                  id="socialMedia"
                  value={formData.socialMedia}
                  onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                  placeholder='{"instagram": "@username", "facebook": "page_url"}'
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, featured: checked as boolean })
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  {language === 'en' ? 'Featured Artisan' : 'Artesão em Destaque'}
                </Label>
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingArtisan 
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
