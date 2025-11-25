import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Upload, Trash2, Search, FolderOpen, Image as ImageIcon } from 'lucide-react';
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

export default function MediaTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    filename: '',
    originalName: '',
    url: '',
    mimeType: 'image/jpeg',
    size: '',
    alt: '',
    caption: '',
    folder: 'general',
  });

  const utils = trpc.useUtils();
  
  // Fetch media files
  const { data: mediaFiles, isLoading } = trpc.media?.list?.useQuery() || { data: [], isLoading: false };

  const createMutation = trpc.media?.create?.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Media file added!' : 'Arquivo de mídia adicionado!');
      utils.media?.list?.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.media?.delete?.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Media file deleted!' : 'Arquivo de mídia excluído!');
      utils.media?.list?.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      filename: '',
      originalName: '',
      url: '',
      mimeType: 'image/jpeg',
      size: '',
      alt: '',
      caption: '',
      folder: 'general',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mediaData = {
      filename: formData.filename,
      originalName: formData.originalName || formData.filename,
      url: formData.url,
      mimeType: formData.mimeType,
      size: parseInt(formData.size) || 0,
      alt: formData.alt || undefined,
      caption: formData.caption || undefined,
      folder: formData.folder,
    };

    createMutation.mutate(mediaData);
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'en' ? 'Delete this file?' : 'Excluir este arquivo?')) {
      deleteMutation.mutate({ id });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Filter media files
  const filteredMedia = mediaFiles?.filter((file: any) => {
    const matchesSearch = !searchQuery || 
      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.alt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    
    return matchesSearch && matchesFolder;
  }) || [];

  // Get unique folders
  const folders = ['all', ...new Set(mediaFiles?.map((f: any) => f.folder) || [])];

  // Group by folder
  const mediaByFolder = filteredMedia.reduce((acc: any, file: any) => {
    const folder = file.folder || 'general';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(file);
    return acc;
  }, {});

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
            {language === 'en' ? 'Media Library' : 'Biblioteca de Mídia'}
          </h2>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Manage your images and files' 
              : 'Gerencie suas imagens e arquivos'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Upload className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Media' : 'Adicionar Mídia'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search files...' : 'Buscar arquivos...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {folders.map((folder) => (
              <SelectItem key={folder} value={folder}>
                {folder === 'all' 
                  ? (language === 'en' ? 'All Folders' : 'Todas as Pastas')
                  : folder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            {language === 'en' ? 'Total Files' : 'Total de Arquivos'}
          </div>
          <div className="text-2xl font-bold">{mediaFiles?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            {language === 'en' ? 'Folders' : 'Pastas'}
          </div>
          <div className="text-2xl font-bold">{folders.length - 1}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            {language === 'en' ? 'Filtered' : 'Filtrados'}
          </div>
          <div className="text-2xl font-bold">{filteredMedia.length}</div>
        </Card>
      </div>

      {/* Media Grid */}
      {selectedFolder === 'all' ? (
        // Show by folder
        Object.keys(mediaByFolder).map((folder) => (
          <div key={folder} className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FolderOpen className="w-5 h-5" />
              {folder}
              <span className="text-sm text-muted-foreground font-normal">
                ({mediaByFolder[folder].length} {language === 'en' ? 'files' : 'arquivos'})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {mediaByFolder[folder].map((file: any) => (
                <MediaCard 
                  key={file.id} 
                  file={file} 
                  onDelete={handleDelete}
                  formatFileSize={formatFileSize}
                  language={language}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        // Show flat grid
        <div className="grid grid-cols-4 gap-4">
          {filteredMedia.map((file: any) => (
            <MediaCard 
              key={file.id} 
              file={file} 
              onDelete={handleDelete}
              formatFileSize={formatFileSize}
              language={language}
            />
          ))}
        </div>
      )}

      {filteredMedia.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {language === 'en' ? 'No media files found' : 'Nenhum arquivo de mídia encontrado'}
            </p>
            <p className="text-sm mb-4">
              {language === 'en' ? 'Start by adding your first file' : 'Comece adicionando seu primeiro arquivo'}
            </p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Upload className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Media' : 'Adicionar Mídia'}
            </Button>
          </div>
        </Card>
      )}

      {/* Add Media Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Add Media File' : 'Adicionar Arquivo de Mídia'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">File URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                placeholder="https://cdn.sanity.io/images/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filename">Filename *</Label>
                <Input
                  id="filename"
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                  required
                  placeholder="image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="originalName">Original Name</Label>
                <Input
                  id="originalName"
                  value={formData.originalName}
                  onChange={(e) => setFormData({ ...formData, originalName: e.target.value })}
                  placeholder="My Image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mimeType">MIME Type *</Label>
                <Select value={formData.mimeType} onValueChange={(value) => setFormData({ ...formData, mimeType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">image/jpeg</SelectItem>
                    <SelectItem value="image/png">image/png</SelectItem>
                    <SelectItem value="image/webp">image/webp</SelectItem>
                    <SelectItem value="image/gif">image/gif</SelectItem>
                    <SelectItem value="application/pdf">application/pdf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Size (bytes)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="folder">Folder</Label>
              <Select value={formData.folder} onValueChange={(value) => setFormData({ ...formData, folder: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">general</SelectItem>
                  <SelectItem value="products">products</SelectItem>
                  <SelectItem value="artisans">artisans</SelectItem>
                  <SelectItem value="banners">banners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="Description for accessibility"
              />
            </div>

            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={2}
                placeholder="Optional caption"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {language === 'en' ? 'Add' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Media Card Component
function MediaCard({ file, onDelete, formatFileSize, language }: any) {
  const isImage = file.mimeType.startsWith('image/');

  return (
    <Card className="overflow-hidden group relative">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={file.url}
            alt={file.alt || file.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate" title={file.filename}>
          {file.filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
        {file.alt && (
          <p className="text-xs text-muted-foreground truncate mt-1" title={file.alt}>
            {file.alt}
          </p>
        )}
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(file.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
