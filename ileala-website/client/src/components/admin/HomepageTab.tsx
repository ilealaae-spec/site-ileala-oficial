import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import {
  Loader2, Plus, Edit, Trash2, Image as ImageIcon, Video,
  LayoutGrid, ArrowUp, ArrowDown, Upload, Database, Layout
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function HomepageTab() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('slides');
  const utils = trpc.useUtils();

  const seedMutation = (trpc as any).homepageSeed.run.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message || (language === 'en' ? 'Content seeded successfully!' : 'Conteúdo populado com sucesso!'));
      // Invalidate all queries to refresh data
      utils.heroSlides.list.invalidate();
      utils.homepageVideos.list.invalidate();
      utils.homepageCards.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || (language === 'en' ? 'Failed to seed content' : 'Falha ao popular conteúdo'));
    },
  });

  const handleSeed = () => {
    if (confirm(language === 'en'
      ? 'This will populate the database with default content (only if empty). Continue?'
      : 'Isso vai popular o banco com o conteúdo padrão (apenas se estiver vazio). Continuar?')) {
      seedMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-sage-900 mb-2">
            {language === 'en' ? 'Homepage Management' : 'Gerenciar Homepage'}
          </h2>
          <p className="text-sage-600">
            {language === 'en'
              ? 'Manage hero slides, videos, and cards displayed on the homepage'
              : 'Gerencie slides, vídeos e cards exibidos na página inicial'}
          </p>
        </div>
        <Button
          onClick={handleSeed}
          variant="outline"
          disabled={seedMutation.isPending}
          className="flex items-center gap-2"
        >
          {seedMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {language === 'en' ? 'Load Default Content' : 'Carregar Conteúdo Padrão'}
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="slides" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {language === 'en' ? 'Hero Slides' : 'Slides Hero'}
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            {language === 'en' ? 'Videos' : 'Vídeos'}
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            {language === 'en' ? 'About Cards' : 'Cards About'}
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            {language === 'en' ? 'Page Banners' : 'Banners'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides">
          <HeroSlidesSection />
        </TabsContent>

        <TabsContent value="videos">
          <VideosSection />
        </TabsContent>

        <TabsContent value="cards">
          <CardsSection />
        </TabsContent>

        <TabsContent value="banners">
          <PageBannersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Hero Slides Section
function HeroSlidesSection() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    altText: '',
    titleEN: '',
    titlePT: '',
    subtitleEN: '',
    subtitlePT: '',
    linkUrl: '',
    displayOrder: 0,
    active: 1,
  });

  const utils = trpc.useUtils();
  const { data: slides, isLoading } = trpc.heroSlides.list.useQuery();

  const createMutation = trpc.heroSlides.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Slide created!' : 'Slide criado!');
      utils.heroSlides.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.heroSlides.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Slide updated!' : 'Slide atualizado!');
      utils.heroSlides.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.heroSlides.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Slide deleted!' : 'Slide excluído!');
      utils.heroSlides.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      setFormData({ ...formData, imageUrl: data.url });
      setIsUploading(false);
      toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      altText: '',
      titleEN: '',
      titlePT: '',
      subtitleEN: '',
      subtitlePT: '',
      linkUrl: '',
      displayOrder: 0,
      active: 1,
    });
    setEditingSlide(null);
  };

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    setFormData({
      imageUrl: slide.imageUrl || '',
      altText: slide.altText || '',
      titleEN: slide.titleEN || '',
      titlePT: slide.titlePT || '',
      subtitleEN: slide.subtitleEN || '',
      subtitlePT: slide.subtitlePT || '',
      linkUrl: slide.linkUrl || '',
      displayOrder: slide.displayOrder || 0,
      active: slide.active ?? 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this slide?' : 'Excluir este slide?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image' : 'Selecione uma imagem');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `hero-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const moveSlide = (slide: any, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? slide.displayOrder - 1 : slide.displayOrder + 1;
    updateMutation.mutate({ id: slide.id, displayOrder: newOrder });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? `${slides?.length || 0} slides configured`
            : `${slides?.length || 0} slides configurados`}
        </p>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Slide' : 'Adicionar Slide'}
        </Button>
      </div>

      <div className="grid gap-4">
        {slides?.map((slide: any, index: number) => (
          <Card key={slide.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveSlide(slide, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveSlide(slide, 'down')}
                  disabled={index === (slides?.length || 0) - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.altText || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {slide.active ? (language === 'en' ? 'Active' : 'Ativo') : (language === 'en' ? 'Inactive' : 'Inativo')}
                  </span>
                  <span className="text-xs text-muted-foreground">Order: {slide.displayOrder}</span>
                </div>
                <p className="font-medium truncate">{slide.titleEN || slide.titlePT || 'No title'}</p>
                <p className="text-sm text-muted-foreground truncate">{slide.subtitleEN || slide.subtitlePT || 'No subtitle'}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(slide)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(slide.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {(!slides || slides.length === 0) && (
          <Card className="p-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {language === 'en' ? 'No hero slides yet' : 'Nenhum slide ainda'}
            </p>
            <p className="text-muted-foreground mb-4">
              {language === 'en' ? 'Add slides to create a carousel on the homepage' : 'Adicione slides para criar um carrossel na homepage'}
            </p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlide
                ? (language === 'en' ? 'Edit Slide' : 'Editar Slide')
                : (language === 'en' ? 'Add Slide' : 'Adicionar Slide')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Image' : 'Imagem'} *</Label>
              <div className="mt-2 flex gap-4 items-start">
                <div className="w-48 h-32 rounded border overflow-hidden bg-muted flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                  </Button>
                  <Input
                    placeholder={language === 'en' ? 'Or paste image URL' : 'Ou cole a URL da imagem'}
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="altText">{language === 'en' ? 'Alt Text' : 'Texto Alt'}</Label>
              <Input
                id="altText"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                placeholder={language === 'en' ? 'Description for accessibility' : 'Descrição para acessibilidade'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleEN">{language === 'en' ? 'Title (English)' : 'Título (Inglês)'}</Label>
                <Input
                  id="titleEN"
                  value={formData.titleEN}
                  onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="titlePT">{language === 'en' ? 'Title (Portuguese)' : 'Título (Português)'}</Label>
                <Input
                  id="titlePT"
                  value={formData.titlePT}
                  onChange={(e) => setFormData({ ...formData, titlePT: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subtitleEN">{language === 'en' ? 'Subtitle (English)' : 'Subtítulo (Inglês)'}</Label>
                <Textarea
                  id="subtitleEN"
                  value={formData.subtitleEN}
                  onChange={(e) => setFormData({ ...formData, subtitleEN: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="subtitlePT">{language === 'en' ? 'Subtitle (Portuguese)' : 'Subtítulo (Português)'}</Label>
                <Textarea
                  id="subtitlePT"
                  value={formData.subtitlePT}
                  onChange={(e) => setFormData({ ...formData, subtitlePT: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkUrl">{language === 'en' ? 'Link URL (optional)' : 'URL do Link (opcional)'}</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/collections"
                />
              </div>
              <div>
                <Label htmlFor="displayOrder">{language === 'en' ? 'Display Order' : 'Ordem de Exibição'}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
              />
              <Label>{language === 'en' ? 'Active' : 'Ativo'}</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !formData.imageUrl}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

// Videos Section
function VideosSection() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  const [formData, setFormData] = useState({
    videoUrl: '',
    thumbnailUrl: '',
    titleEN: '',
    titlePT: '',
    descriptionEN: '',
    descriptionPT: '',
    displayOrder: 0,
    active: 1,
  });

  const utils = trpc.useUtils();
  const { data: videos, isLoading } = trpc.homepageVideos.list.useQuery();

  const createMutation = trpc.homepageVideos.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Video added!' : 'Vídeo adicionado!');
      utils.homepageVideos.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.homepageVideos.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Video updated!' : 'Vídeo atualizado!');
      utils.homepageVideos.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.homepageVideos.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Video deleted!' : 'Vídeo excluído!');
      utils.homepageVideos.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      videoUrl: '',
      thumbnailUrl: '',
      titleEN: '',
      titlePT: '',
      descriptionEN: '',
      descriptionPT: '',
      displayOrder: 0,
      active: 1,
    });
    setEditingVideo(null);
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl || '',
      titleEN: video.titleEN || '',
      titlePT: video.titlePT || '',
      descriptionEN: video.descriptionEN || '',
      descriptionPT: video.descriptionPT || '',
      displayOrder: video.displayOrder || 0,
      active: video.active ?? 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this video?' : 'Excluir este vídeo?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, ...formData });
    } else {
      createMutation.mutate(formData);
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
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? `${videos?.length || 0} videos configured`
            : `${videos?.length || 0} vídeos configurados`}
        </p>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Video' : 'Adicionar Vídeo'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {videos?.map((video: any) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded ${video.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {video.active ? (language === 'en' ? 'Active' : 'Ativo') : (language === 'en' ? 'Inactive' : 'Inativo')}
              </span>
            </div>
            <div className="p-3">
              <p className="font-medium truncate">{video.titleEN || video.titlePT || 'Video ' + video.displayOrder}</p>
              <p className="text-xs text-muted-foreground truncate">{video.videoUrl}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(video)}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(video.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {(!videos || videos.length === 0) && (
          <Card className="col-span-full p-12 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {language === 'en' ? 'No videos yet' : 'Nenhum vídeo ainda'}
            </p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVideo
                ? (language === 'en' ? 'Edit Video' : 'Editar Vídeo')
                : (language === 'en' ? 'Add Video' : 'Adicionar Vídeo')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="videoUrl">{language === 'en' ? 'Video URL' : 'URL do Vídeo'} *</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="/videos/video1.mp4 or https://..."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' ? 'Local path (e.g., /videos/video1.mp4) or external URL' : 'Caminho local (ex: /videos/video1.mp4) ou URL externa'}
              </p>
            </div>

            <div>
              <Label htmlFor="thumbnailUrl">{language === 'en' ? 'Thumbnail URL (optional)' : 'URL da Thumbnail (opcional)'}</Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="/images/thumb.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleEN">{language === 'en' ? 'Title (English)' : 'Título (Inglês)'}</Label>
                <Input
                  id="titleEN"
                  value={formData.titleEN}
                  onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="titlePT">{language === 'en' ? 'Title (Portuguese)' : 'Título (Português)'}</Label>
                <Input
                  id="titlePT"
                  value={formData.titlePT}
                  onChange={(e) => setFormData({ ...formData, titlePT: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayOrder">{language === 'en' ? 'Display Order' : 'Ordem'}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active === 1}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
                  />
                  <Label>{language === 'en' ? 'Active' : 'Ativo'}</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !formData.videoUrl}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

// Cards Section
function CardsSection() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    titleEN: '',
    titlePT: '',
    linkUrl: '',
    displayOrder: 0,
    active: 1,
  });

  const utils = trpc.useUtils();
  const { data: cards, isLoading } = trpc.homepageCards.list.useQuery();

  const createMutation = trpc.homepageCards.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Card added!' : 'Card adicionado!');
      utils.homepageCards.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.homepageCards.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Card updated!' : 'Card atualizado!');
      utils.homepageCards.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.homepageCards.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Card deleted!' : 'Card excluído!');
      utils.homepageCards.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      setFormData({ ...formData, imageUrl: data.url });
      setIsUploading(false);
      toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      titleEN: '',
      titlePT: '',
      linkUrl: '',
      displayOrder: 0,
      active: 1,
    });
    setEditingCard(null);
  };

  const handleEdit = (card: any) => {
    setEditingCard(card);
    setFormData({
      imageUrl: card.imageUrl || '',
      titleEN: card.titleEN || '',
      titlePT: card.titlePT || '',
      linkUrl: card.linkUrl || '',
      displayOrder: card.displayOrder || 0,
      active: card.active ?? 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this card?' : 'Excluir este card?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image' : 'Selecione uma imagem');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `card-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? `${cards?.length || 0} cards configured`
            : `${cards?.length || 0} cards configurados`}
        </p>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Card' : 'Adicionar Card'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards?.map((card: any) => (
          <Card key={card.id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {card.imageUrl ? (
                <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LayoutGrid className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded ${card.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {card.active ? (language === 'en' ? 'Active' : 'Ativo') : (language === 'en' ? 'Inactive' : 'Inativo')}
              </span>
            </div>
            <div className="p-3">
              <p className="font-medium truncate">{language === 'en' ? card.titleEN : card.titlePT}</p>
              <p className="text-xs text-muted-foreground">{card.linkUrl}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(card)}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(card.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {(!cards || cards.length === 0) && (
          <Card className="col-span-full p-12 text-center">
            <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {language === 'en' ? 'No cards yet' : 'Nenhum card ainda'}
            </p>
            <p className="text-muted-foreground">
              {language === 'en' ? 'These are the "About Us" section cards' : 'Estes são os cards da seção "Sobre Nós"'}
            </p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard
                ? (language === 'en' ? 'Edit Card' : 'Editar Card')
                : (language === 'en' ? 'Add Card' : 'Adicionar Card')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Image' : 'Imagem'} *</Label>
              <div className="mt-2 flex gap-4 items-start">
                <div className="w-24 h-24 rounded border overflow-hidden bg-muted flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                  <Input
                    placeholder="Or paste URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleEN">{language === 'en' ? 'Title (EN)' : 'Título (EN)'} *</Label>
                <Input
                  id="titleEN"
                  value={formData.titleEN}
                  onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="titlePT">{language === 'en' ? 'Title (PT)' : 'Título (PT)'} *</Label>
                <Input
                  id="titlePT"
                  value={formData.titlePT}
                  onChange={(e) => setFormData({ ...formData, titlePT: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkUrl">{language === 'en' ? 'Link URL' : 'URL do Link'} *</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="/about"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayOrder">{language === 'en' ? 'Order' : 'Ordem'}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active === 1}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
                  />
                  <Label>{language === 'en' ? 'Active' : 'Ativo'}</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !formData.imageUrl || !formData.titleEN || !formData.titlePT || !formData.linkUrl}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

// Page Banners Section
function PageBannersSection() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageOptions = [
    { slug: 'collections', labelEN: 'Collections', labelPT: 'Coleções' },
    { slug: 'table-essentials', labelEN: 'Table Essentials', labelPT: 'Essenciais de Mesa' },
    { slug: 'pet-collection', labelEN: 'Pet Collection', labelPT: 'Coleção Pet' },
    { slug: 'accessories', labelEN: 'Accessories', labelPT: 'Acessórios' },
    { slug: 'home-accents', labelEN: 'Home Accents', labelPT: 'Decoração' },
    { slug: 'napkin-rings', labelEN: 'Napkin Rings', labelPT: 'Porta Guardanapos' },
    { slug: 'about', labelEN: 'About', labelPT: 'Sobre' },
  ];

  const [formData, setFormData] = useState({
    pageSlug: '',
    imageUrl: '',
    altText: '',
    titleEN: '',
    titlePT: '',
    subtitleEN: '',
    subtitlePT: '',
    overlayOpacity: 30,
    active: 1,
  });

  const utils = trpc.useUtils();
  const { data: banners, isLoading } = (trpc as any).pageBanners.list.useQuery();

  const createMutation = (trpc as any).pageBanners.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Banner created!' : 'Banner criado!');
      utils.pageBanners.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = (trpc as any).pageBanners.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Banner updated!' : 'Banner atualizado!');
      utils.pageBanners.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = (trpc as any).pageBanners.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Banner deleted!' : 'Banner excluído!');
      utils.pageBanners.list.invalidate();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const seedMutation = (trpc as any).pageBanners.seed.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message || (language === 'en' ? 'Banners seeded!' : 'Banners populados!'));
      utils.pageBanners.list.invalidate();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      setFormData({ ...formData, imageUrl: data.url });
      setIsUploading(false);
      toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      pageSlug: '',
      imageUrl: '',
      altText: '',
      titleEN: '',
      titlePT: '',
      subtitleEN: '',
      subtitlePT: '',
      overlayOpacity: 30,
      active: 1,
    });
    setEditingBanner(null);
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      pageSlug: banner.pageSlug || '',
      imageUrl: banner.imageUrl || '',
      altText: banner.altText || '',
      titleEN: banner.titleEN || '',
      titlePT: banner.titlePT || '',
      subtitleEN: banner.subtitleEN || '',
      subtitlePT: banner.subtitlePT || '',
      overlayOpacity: banner.overlayOpacity ?? 30,
      active: banner.active ?? 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this banner?' : 'Excluir este banner?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image' : 'Selecione uma imagem');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `banner-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSeed = () => {
    if (confirm(language === 'en'
      ? 'This will populate default banners for all pages (only if empty). Continue?'
      : 'Isso vai popular os banners padrão de todas as páginas (apenas se estiver vazio). Continuar?')) {
      seedMutation.mutate();
    }
  };

  const getPageLabel = (slug: string) => {
    const page = pageOptions.find(p => p.slug === slug);
    return page ? (language === 'en' ? page.labelEN : page.labelPT) : slug;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {language === 'en'
              ? `${banners?.length || 0} page banners configured`
              : `${banners?.length || 0} banners de página configurados`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'en'
              ? 'These are the large hero images on each page'
              : 'Estas são as imagens grandes no topo de cada página'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seedMutation.isPending}>
            {seedMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {language === 'en' ? 'Load Defaults' : 'Carregar Padrão'}
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Add Banner' : 'Adicionar Banner'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {banners?.map((banner: any) => (
          <Card key={banner.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-48 h-28 rounded overflow-hidden bg-muted flex-shrink-0">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.altText || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-medium">
                    {getPageLabel(banner.pageSlug)}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {banner.active ? (language === 'en' ? 'Active' : 'Ativo') : (language === 'en' ? 'Inactive' : 'Inativo')}
                  </span>
                </div>
                <p className="font-medium truncate">{banner.titleEN || banner.titlePT || 'No title'}</p>
                <p className="text-sm text-muted-foreground truncate">{banner.subtitleEN || banner.subtitlePT || 'No subtitle'}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(banner)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(banner.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {(!banners || banners.length === 0) && (
          <Card className="p-12 text-center">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {language === 'en' ? 'No page banners yet' : 'Nenhum banner ainda'}
            </p>
            <p className="text-muted-foreground mb-4">
              {language === 'en'
                ? 'Click "Load Defaults" to populate banners for all pages, or add them manually'
                : 'Clique em "Carregar Padrão" para popular os banners de todas as páginas, ou adicione manualmente'}
            </p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner
                ? (language === 'en' ? 'Edit Page Banner' : 'Editar Banner')
                : (language === 'en' ? 'Add Page Banner' : 'Adicionar Banner')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pageSlug">{language === 'en' ? 'Page' : 'Página'} *</Label>
              <select
                id="pageSlug"
                value={formData.pageSlug}
                onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                required
                disabled={!!editingBanner}
              >
                <option value="">{language === 'en' ? 'Select a page' : 'Selecione uma página'}</option>
                {pageOptions.map(page => (
                  <option key={page.slug} value={page.slug}>
                    {language === 'en' ? page.labelEN : page.labelPT}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>{language === 'en' ? 'Banner Image' : 'Imagem do Banner'} *</Label>
              <div className="mt-2 flex gap-4 items-start">
                <div className="w-48 h-32 rounded border overflow-hidden bg-muted flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                  </Button>
                  <Input
                    placeholder={language === 'en' ? 'Or paste image URL' : 'Ou cole a URL da imagem'}
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="altText">{language === 'en' ? 'Alt Text' : 'Texto Alt'}</Label>
              <Input
                id="altText"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                placeholder={language === 'en' ? 'Description for accessibility' : 'Descrição para acessibilidade'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleEN">{language === 'en' ? 'Title (English)' : 'Título (Inglês)'}</Label>
                <Input
                  id="titleEN"
                  value={formData.titleEN}
                  onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="titlePT">{language === 'en' ? 'Title (Portuguese)' : 'Título (Português)'}</Label>
                <Input
                  id="titlePT"
                  value={formData.titlePT}
                  onChange={(e) => setFormData({ ...formData, titlePT: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subtitleEN">{language === 'en' ? 'Subtitle (English)' : 'Subtítulo (Inglês)'}</Label>
                <Textarea
                  id="subtitleEN"
                  value={formData.subtitleEN}
                  onChange={(e) => setFormData({ ...formData, subtitleEN: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="subtitlePT">{language === 'en' ? 'Subtitle (Portuguese)' : 'Subtítulo (Português)'}</Label>
                <Textarea
                  id="subtitlePT"
                  value={formData.subtitlePT}
                  onChange={(e) => setFormData({ ...formData, subtitlePT: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
              />
              <Label>{language === 'en' ? 'Active' : 'Ativo'}</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !formData.imageUrl || !formData.pageSlug}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
