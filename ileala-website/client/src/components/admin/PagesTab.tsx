import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { Loader2, Save, Upload, Image as ImageIcon, FileText, Phone, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function PagesTab() {
  const { language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Contact Page Settings
  const { data: contactHeroImage, refetch: refetchContactHeroImage } = trpc.settings.get.useQuery({ key: 'contact-hero-image' });
  const { data: contactHeroTitleEN } = trpc.settings.get.useQuery({ key: 'contact-hero-title-en' });
  const { data: contactHeroTitlePT } = trpc.settings.get.useQuery({ key: 'contact-hero-title-pt' });
  const { data: contactHeroSubtitleEN } = trpc.settings.get.useQuery({ key: 'contact-hero-subtitle-en' });
  const { data: contactHeroSubtitlePT } = trpc.settings.get.useQuery({ key: 'contact-hero-subtitle-pt' });

  // About Page Settings
  const { data: aboutHeroImage, refetch: refetchAboutHeroImage } = trpc.settings.get.useQuery({ key: 'about-hero-image' });
  const { data: aboutHeroTitleEN } = trpc.settings.get.useQuery({ key: 'about-hero-title-en' });
  const { data: aboutHeroTitlePT } = trpc.settings.get.useQuery({ key: 'about-hero-title-pt' });
  const { data: aboutHeroSubtitleEN } = trpc.settings.get.useQuery({ key: 'about-hero-subtitle-en' });
  const { data: aboutHeroSubtitlePT } = trpc.settings.get.useQuery({ key: 'about-hero-subtitle-pt' });

  // Form states for Contact
  const [contactTitleEN, setContactTitleEN] = useState('');
  const [contactTitlePT, setContactTitlePT] = useState('');
  const [contactSubtitleEN, setContactSubtitleEN] = useState('');
  const [contactSubtitlePT, setContactSubtitlePT] = useState('');

  // Form states for About
  const [aboutTitleEN, setAboutTitleEN] = useState('');
  const [aboutTitlePT, setAboutTitlePT] = useState('');
  const [aboutSubtitleEN, setAboutSubtitleEN] = useState('');
  const [aboutSubtitlePT, setAboutSubtitlePT] = useState('');

  // Initialize form values when data loads
  useState(() => {
    if (contactHeroTitleEN?.value) setContactTitleEN(contactHeroTitleEN.value);
    if (contactHeroTitlePT?.value) setContactTitlePT(contactHeroTitlePT.value);
    if (contactHeroSubtitleEN?.value) setContactSubtitleEN(contactHeroSubtitleEN.value);
    if (contactHeroSubtitlePT?.value) setContactSubtitlePT(contactHeroSubtitlePT.value);
    if (aboutHeroTitleEN?.value) setAboutTitleEN(aboutHeroTitleEN.value);
    if (aboutHeroTitlePT?.value) setAboutTitlePT(aboutHeroTitlePT.value);
    if (aboutHeroSubtitleEN?.value) setAboutSubtitleEN(aboutHeroSubtitleEN.value);
    if (aboutHeroSubtitlePT?.value) setAboutSubtitlePT(aboutHeroSubtitlePT.value);
  });

  const updateSettingMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Setting saved!' : 'Configuração salva!');
      utils.settings.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Upload mutation
  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      if (uploadingFor === 'contact-hero') {
        updateSettingMutation.mutate({ key: 'contact-hero-image', value: data.url });
        refetchContactHeroImage();
      } else if (uploadingFor === 'about-hero') {
        updateSettingMutation.mutate({ key: 'about-hero-image', value: data.url });
        refetchAboutHeroImage();
      }
      setIsUploading(false);
      setUploadingFor(null);
    },
    onError: (error: any) => {
      setIsUploading(false);
      setUploadingFor(null);
      toast.error(error.message || (language === 'en' ? 'Failed to upload image' : 'Erro ao enviar imagem'));
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, settingKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'Imagem deve ter menos de 5MB');
      return;
    }

    setIsUploading(true);
    setUploadingFor(settingKey);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data without the prefix (data:image/xxx;base64,)
      const base64Data = result.split(',')[1];
      uploadMutation.mutate({
        fileName: `${settingKey}-${Date.now()}-${file.name}`,
        fileData: base64Data,
        contentType: file.type,
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      setUploadingFor(null);
      toast.error(language === 'en' ? 'Failed to read file' : 'Erro ao ler arquivo');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveContactSettings = () => {
    if (contactTitleEN) {
      updateSettingMutation.mutate({ key: 'contact-hero-title-en', value: contactTitleEN });
    }
    if (contactTitlePT) {
      updateSettingMutation.mutate({ key: 'contact-hero-title-pt', value: contactTitlePT });
    }
    if (contactSubtitleEN) {
      updateSettingMutation.mutate({ key: 'contact-hero-subtitle-en', value: contactSubtitleEN });
    }
    if (contactSubtitlePT) {
      updateSettingMutation.mutate({ key: 'contact-hero-subtitle-pt', value: contactSubtitlePT });
    }
  };

  const handleSaveAboutSettings = () => {
    if (aboutTitleEN) {
      updateSettingMutation.mutate({ key: 'about-hero-title-en', value: aboutTitleEN });
    }
    if (aboutTitlePT) {
      updateSettingMutation.mutate({ key: 'about-hero-title-pt', value: aboutTitlePT });
    }
    if (aboutSubtitleEN) {
      updateSettingMutation.mutate({ key: 'about-hero-subtitle-en', value: aboutSubtitleEN });
    }
    if (aboutSubtitlePT) {
      updateSettingMutation.mutate({ key: 'about-hero-subtitle-pt', value: aboutSubtitlePT });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {language === 'en' ? 'Pages Settings' : 'Configurações de Páginas'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Customize hero images and texts for each page'
            : 'Personalize imagens e textos do hero de cada página'}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Contact Page */}
        <AccordionItem value="contact" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{language === 'en' ? 'Contact Page' : 'Página de Contato'}</h3>
                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Hero image and texts' : 'Imagem e textos do hero'}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-6">
              {/* Hero Image */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {language === 'en' ? 'Hero Image' : 'Imagem do Hero'}
                </Label>
                <div className="flex items-start gap-4">
                  <div className="w-48 h-28 rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
                    {contactHeroImage?.value ? (
                      <img src={contactHeroImage.value} alt="Contact Hero" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'contact-hero')}
                      className="hidden"
                      id="contact-hero-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('contact-hero-upload')?.click()}
                      disabled={isUploading && uploadingFor === 'contact-hero'}
                    >
                      {isUploading && uploadingFor === 'contact-hero' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'en' ? 'Recommended: 1920x600px' : 'Recomendado: 1920x600px'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Title (English)' : 'Título (Inglês)'}</Label>
                  <Input
                    value={contactTitleEN || contactHeroTitleEN?.value || ''}
                    onChange={(e) => setContactTitleEN(e.target.value)}
                    placeholder="Contact Us"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Title (Portuguese)' : 'Título (Português)'}</Label>
                  <Input
                    value={contactTitlePT || contactHeroTitlePT?.value || ''}
                    onChange={(e) => setContactTitlePT(e.target.value)}
                    placeholder="Fale Conosco"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Subtitle (English)' : 'Subtítulo (Inglês)'}</Label>
                  <Input
                    value={contactSubtitleEN || contactHeroSubtitleEN?.value || ''}
                    onChange={(e) => setContactSubtitleEN(e.target.value)}
                    placeholder="We'd love to hear from you"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Subtitle (Portuguese)' : 'Subtítulo (Português)'}</Label>
                  <Input
                    value={contactSubtitlePT || contactHeroSubtitlePT?.value || ''}
                    onChange={(e) => setContactSubtitlePT(e.target.value)}
                    placeholder="Adoraríamos ouvir de você"
                  />
                </div>
              </div>

              <Button onClick={handleSaveContactSettings} disabled={updateSettingMutation.isPending}>
                {updateSettingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Save Contact Settings' : 'Salvar Configurações de Contato'}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* About Page */}
        <AccordionItem value="about" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{language === 'en' ? 'About Page' : 'Página Sobre'}</h3>
                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Hero image and texts' : 'Imagem e textos do hero'}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-6">
              {/* Hero Image */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {language === 'en' ? 'Hero Image' : 'Imagem do Hero'}
                </Label>
                <div className="flex items-start gap-4">
                  <div className="w-48 h-28 rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
                    {aboutHeroImage?.value ? (
                      <img src={aboutHeroImage.value} alt="About Hero" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'about-hero')}
                      className="hidden"
                      id="about-hero-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('about-hero-upload')?.click()}
                      disabled={isUploading && uploadingFor === 'about-hero'}
                    >
                      {isUploading && uploadingFor === 'about-hero' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'en' ? 'Recommended: 1920x600px' : 'Recomendado: 1920x600px'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Title (English)' : 'Título (Inglês)'}</Label>
                  <Input
                    value={aboutTitleEN || aboutHeroTitleEN?.value || ''}
                    onChange={(e) => setAboutTitleEN(e.target.value)}
                    placeholder="About Us"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Title (Portuguese)' : 'Título (Português)'}</Label>
                  <Input
                    value={aboutTitlePT || aboutHeroTitlePT?.value || ''}
                    onChange={(e) => setAboutTitlePT(e.target.value)}
                    placeholder="Sobre Nós"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Subtitle (English)' : 'Subtítulo (Inglês)'}</Label>
                  <Input
                    value={aboutSubtitleEN || aboutHeroSubtitleEN?.value || ''}
                    onChange={(e) => setAboutSubtitleEN(e.target.value)}
                    placeholder="Our story and mission"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Subtitle (Portuguese)' : 'Subtítulo (Português)'}</Label>
                  <Input
                    value={aboutSubtitlePT || aboutHeroSubtitlePT?.value || ''}
                    onChange={(e) => setAboutSubtitlePT(e.target.value)}
                    placeholder="Nossa história e missão"
                  />
                </div>
              </div>

              <Button onClick={handleSaveAboutSettings} disabled={updateSettingMutation.isPending}>
                {updateSettingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Save About Settings' : 'Salvar Configurações de Sobre'}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              {language === 'en' ? 'How it works' : 'Como funciona'}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {language === 'en'
                ? 'Upload hero images and customize titles/subtitles for each page. Changes are applied immediately after saving.'
                : 'Faça upload de imagens hero e personalize títulos/subtítulos de cada página. As alterações são aplicadas imediatamente após salvar.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
