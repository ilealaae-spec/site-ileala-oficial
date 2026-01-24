import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Star, Upload, X, ChevronUp, ChevronDown, Eye, EyeOff, Download, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// Default artisans data (same as About.tsx)
const defaultArtisans = [
  {
    name: 'Mr. Zeeshan',
    photoUrl: '/images/artisans/zeeshan.webp',
    specialty: 'Master Tailor',
    location: 'Pakistan',
    bioEN: 'From Pakistan, I built my career over more than twenty years, working in prestigious establishments in my country. About a year and a half ago, I arrived in Dubai — a new chapter, full of challenges and achievements. Today I am part of the ILE ALA atelier, where I can apply my experience and continue evolving every day. I take pride in the work I do and the quality we deliver. I hope to keep growing and contributing with the same commitment and dedication.',
    bioPT: 'Sou do Paquistão e construí minha carreira ao longo de mais de vinte anos, trabalhando em grandes lugares no meu país. Há cerca de um ano e meio, cheguei a Dubai — uma nova etapa, cheia de desafios e conquistas. Hoje faço parte do ateliê ILE ALA, onde posso aplicar minha experiência e continuar evoluindo todos os dias. Tenho orgulho do trabalho que realizo e da qualidade que entregamos. Espero seguir crescendo e contribuindo com o mesmo compromisso e dedicação.',
    displayOrder: 1,
  },
  {
    name: 'Mr. Sarajuddin',
    photoUrl: '/images/artisans/sarajuddin.webp',
    specialty: 'Master Tailor',
    location: 'India',
    bioEN: 'From India to Dubai, I brought with me two decades of an art cultivated with patience and devotion. I came especially to be part of the ILE ALA atelier — an opportunity I honor with every stitch, every seam. My family remains in India, but my heart is divided between two worlds: the home I left behind and the dream I build here. Perfection is not just a goal — it is the path I have chosen to walk. Each piece that passes through my hands carries not only technique, but the essence of who I am and where I come from.',
    bioPT: 'Da Índia para Dubai, trouxe comigo duas décadas de uma arte cultivada com paciência e devoção. Vim especialmente para fazer parte do ateliê ILE ALA — uma oportunidade que honro a cada ponto, a cada costura. Minha família permanece na Índia, mas meu coração está dividido entre dois mundos: o lar que deixei e o sonho que construo aqui. A perfeição não é apenas um objetivo — é o caminho que escolhi trilhar. Cada peça que passa por minhas mãos carrega não apenas técnica, mas a essência de quem sou e de onde vim.',
    displayOrder: 2,
  },
  {
    name: 'Ge',
    photoUrl: '/images/artisans/ge.webp',
    specialty: 'Production & Finishing Manager',
    location: 'Madagascar',
    bioEN: 'I am the bridge between creation and delivery, between dream and reality. I guide, organize, and care for every detail so that each piece leaves the atelier not just perfect, but fragrant, wrapped in care, and ready to touch the heart of those who receive it. Without finishing, art remains incomplete — and this is where my work finds meaning. I am the guardian of excellence, the last hand to touch each creation before it finds its destiny. ILE ALA cannot function without sewing, but it also cannot function without those who ensure everything is impeccable. This is my mission, and I fulfill it with pride every day.',
    bioPT: 'Sou a ponte entre a criação e a entrega, entre o sonho e a realidade. Oriento, organizo e cuido de cada detalhe para que cada peça saia do ateliê não apenas perfeita, mas perfumada, envolvida em cuidado e pronta para tocar o coração de quem a recebe. Sem a finalização, a arte permanece incompleta — e é aqui que meu trabalho ganha sentido. Sou a guardiã da excelência, a última mão que toca cada criação antes que ela encontre seu destino. A ILE ALA não funciona sem a costura, mas também não funciona sem quem garante que tudo esteja impecável. Essa é minha missão, e a cumpro com orgulho todos os dias.',
    displayOrder: 3,
  },
  {
    name: 'Lola',
    photoUrl: '/images/artisans/lola.webp',
    specialty: 'Master of Embroidery',
    location: 'Madagascar',
    bioEN: 'Lola is the soul behind ILE ALA\'s exquisite napkin rings. With hands that move like poetry and eyes that see perfection in every detail, she transforms simple beads and threads into small masterpieces. Her embroidery is not just craft—it is art born from devotion. Each napkin ring she creates carries the warmth of her smile, the rhythm of her island, and the promise that beauty can be both delicate and eternal. In Madagascar, where tradition meets the ocean breeze, Lola stitches dreams into reality.',
    bioPT: 'Lola é a alma por trás dos requintados porta-guardanapos da ILE ALA. Com mãos que se movem como poesia e olhos que enxergam perfeição em cada detalhe, ela transforma simples contas e fios em pequenas obras-primas. Seu bordado não é apenas artesanato—é arte nascida da devoção. Cada porta-guardanapo que ela cria carrega o calor do seu sorriso, o ritmo da sua ilha e a promessa de que a beleza pode ser ao mesmo tempo delicada e eterna. Em Madagascar, onde a tradição encontra a brisa do oceano, Lola costura sonhos na realidade.',
    displayOrder: 4,
  },
  {
    name: 'Emily',
    photoUrl: '/images/artisans/emily.webp',
    specialty: 'Atelier & Showroom Caretaker',
    location: 'Madagascar',
    bioEN: 'Emily is the invisible hand that keeps the heart of ILE ALA beating in perfect rhythm. She is the guardian of cleanliness, the keeper of order, and the quiet force that transforms every corner into a sanctuary of beauty. Every morning, before the first stitch is sewn, before the first thread is chosen, Emily ensures that the atelier and showroom shine with impeccable care. Her work is not seen in the final product, but it is felt in every breath of fresh air, every spotless surface, every organized space. She creates the peace that allows artisans to focus on their craft, the harmony that reflects the brand\'s excellence, and the serenity that makes perfection possible. From Madagascar to Dubai, Emily brings the warmth of her island and the devotion of her heart, ensuring that every day begins with the promise of perfection.',
    bioPT: 'Emily é a mão invisível que mantém o coração da ILE ALA batendo em ritmo perfeito. Ela é a guardiã da limpeza, a zeladora da ordem e a força silenciosa que transforma cada canto em um santuário de beleza. Todas as manhãs, antes que o primeiro ponto seja costurado, antes que o primeiro fio seja escolhido, Emily garante que o ateliê e o showroom brilhem com cuidado impecável. Seu trabalho não é visto no produto final, mas é sentido em cada sopro de ar fresco, em cada superfície imaculada, em cada espaço organizado. Ela cria a paz que permite aos artesãos se concentrarem em seu ofício, a harmonia que reflete a excelência da marca e a serenidade que torna a perfeição possível. De Madagascar para Dubai, Emily traz o calor de sua ilha e a devoção de seu coração, garantindo que cada dia comece com a promessa de perfeição.',
    displayOrder: 5,
  },
  {
    name: 'Ajay',
    photoUrl: '/images/artisans/ajay.webp',
    specialty: 'India Representative & Cultural Ambassador',
    location: 'Jaipur, India',
    bioEN: 'Ajay is the bridge between ILE ALA and the soul of India. Based in Jaipur, he is our trusted guide, our friend, and the eyes through which we discover the treasures of Indian craftsmanship. Extremely helpful, reliable, and deeply connected to his culture, Ajay leads us to the most authentic corners of India — where fabrics are born from ancient techniques, where block prints tell stories, where ikats dance with color, and where embroidery is a language passed down through generations. He discovers everything ILE ALA needs: raw materials, artisans, dyeing workshops, textile factories. With Ajay, we don\'t just source materials; we immerse ourselves in culture, learn stories, and build relationships rooted in trust. Ajay is the confidence we carry in India.',
    bioPT: 'Ajay é a ponte entre a ILE ALA e a alma da Índia. Baseado em Jaipur, ele é nosso guia de confiança, nosso amigo e os olhos através dos quais descobrimos os tesouros do artesanato indiano. Extremamente prestativo, confiável e profundamente conectado à sua cultura, Ajay nos leva aos cantos mais autênticos da Índia — onde os tecidos nascem de técnicas ancestrais, onde os block prints contam histórias, onde os ikats dançam com cor e onde o bordado é uma linguagem transmitida por gerações. Ele descobre tudo o que a ILE ALA precisa: matérias-primas, artesãos, oficinas de tingimento, fábricas de tecidos. Com Ajay, não apenas adquirimos materiais; mergulhamos na cultura, aprendemos histórias e construímos relacionamentos enraizados em confiança. Ajay é a confiança que carregamos na Índia.',
    displayOrder: 6,
  },
  {
    name: 'Moët Chandon',
    photoUrl: '/images/artisans/moet.webp',
    specialty: 'Director of Creative Calm & Harmony',
    location: 'Coton de Tuléar',
    bioEN: 'Moët Chandon is the heart of ILE ALA — a four-pawed Director of Calm who supervises fabrics, approves softness, and ensures serenity remains woven into every stitch. Between naps and watchful glances, she teaches us that inspiration is born from silence and beauty flourishes in peace. At ILE ALA, she is not just our muse — she is the Director of Calm, the golden guardian who reminds us that even silence can shine. Her presence transforms the atelier into a sanctuary where creativity flows effortlessly, where every thread is touched by grace, and where the art of living beautifully begins with a gentle pause. Named after the champagne that celebrates life\'s finest moments, Moët Chandon embodies the elegance, joy, and timeless sophistication that define ILE ALA. She is the soul that keeps our hearts light and our hands steady — proof that luxury is not only what we create, but how we feel while creating it.',
    bioPT: 'Moët Chandon é o coração da ILE ALA — uma Diretora de Calma de quatro patas que supervisiona tecidos, aprova maciez e garante que a serenidade permaneça tecida em cada ponto. Entre cochilos e olhares atentos, ela nos ensina que a inspiração nasce do silêncio e a beleza floresce na paz. Na ILE ALA, ela não é apenas nossa musa — é a Diretora de Calma, a guardiã dourada que nos lembra que até o silêncio pode brilhar. Sua presença transforma o ateliê em um santuário onde a criatividade flui sem esforço, onde cada fio é tocado pela graça e onde a arte de viver com beleza começa com uma pausa gentil. Batizada em homenagem ao champanhe que celebra os melhores momentos da vida, Moët Chandon personifica a elegância, a alegria e a sofisticação atemporal que definem a ILE ALA. Ela é a alma que mantém nossos corações leves e nossas mãos firmes — prova de que o luxo não é apenas o que criamos, mas como nos sentimos ao criar.',
    displayOrder: 7,
  },
];

export default function ArtisansTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

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
    active: true,
    displayOrder: 0,
  });

  const utils = trpc.useUtils();
  const { data: artisans, isLoading } = trpc.cms.artisans.list.useQuery();

  const createMutation = trpc.cms.artisans.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Artisan created!' : 'Artesao criado!');
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
      toast.success(language === 'en' ? 'Artisan updated!' : 'Artesao atualizado!');
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
      toast.success(language === 'en' ? 'Artisan deleted!' : 'Artesao excluido!');
      utils.cms.artisans.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadImageMutation = trpc.admin.uploadImage.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
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
      active: true,
      displayOrder: artisans?.length || 0,
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
      active: artisan.active === 1,
      displayOrder: artisan.displayOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'en' ? 'Delete this artisan?' : 'Excluir este artesao?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      featured: formData.featured ? 1 : 0,
      active: formData.active ? 1 : 0,
    };

    if (editingArtisan) {
      updateMutation.mutate({ id: editingArtisan.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleMoveUp = (artisan: any) => {
    const currentOrder = artisan.displayOrder || 0;
    if (currentOrder > 0) {
      updateMutation.mutate({
        id: artisan.id,
        displayOrder: currentOrder - 1,
      });
    }
  };

  const handleMoveDown = (artisan: any, maxOrder: number) => {
    const currentOrder = artisan.displayOrder || 0;
    if (currentOrder < maxOrder) {
      updateMutation.mutate({
        id: artisan.id,
        displayOrder: currentOrder + 1,
      });
    }
  };

  const handleToggleActive = (artisan: any) => {
    updateMutation.mutate({
      id: artisan.id,
      active: artisan.active === 1 ? 0 : 1,
    });
  };

  const handleLoadDefaults = async () => {
    if (!window.confirm(
      language === 'en'
        ? 'This will add all default artisans. Continue?'
        : 'Isso vai adicionar todos os artesaos padrao. Continuar?'
    )) {
      return;
    }

    for (const artisan of defaultArtisans) {
      await createMutation.mutateAsync({
        ...artisan,
        featured: 0,
        active: 1,
      });
    }

    toast.success(
      language === 'en'
        ? 'Default artisans loaded!'
        : 'Artesaos padrao carregados!'
    );
  };

  // Sort artisans by displayOrder
  const sortedArtisans = artisans ? [...artisans].sort((a: any, b: any) =>
    (a.displayOrder || 0) - (b.displayOrder || 0)
  ) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'en' ? 'Artisans Management' : 'Gerenciar Artesaos'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Manage artisan profiles displayed on the About page'
              : 'Gerencie os perfis de artesaos exibidos na pagina Sobre'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en'
              ? `${sortedArtisans.length} artisans total`
              : `${sortedArtisans.length} artesaos no total`}
          </p>
        </div>
        <div className="flex gap-2">
          {sortedArtisans.length === 0 && (
            <Button variant="outline" onClick={handleLoadDefaults}>
              <Download className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Load Defaults' : 'Carregar Padrao'}
            </Button>
          )}
          <Button onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Add Artisan' : 'Adicionar Artesao'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          {language === 'en'
            ? 'Use the arrows to reorder artisans. Click the eye icon to show/hide. Click on a card to expand and see all details.'
            : 'Use as setas para reordenar os artesaos. Clique no olho para mostrar/ocultar. Clique no card para expandir e ver todos os detalhes.'}
        </p>
      </Card>

      {/* Artisans List */}
      <div className="space-y-4">
        {sortedArtisans.map((artisan: any, index: number) => (
          <Card
            key={artisan.id}
            className={`p-4 transition-all ${artisan.active !== 1 ? 'opacity-60 bg-gray-50' : ''} ${expandedCard === artisan.id ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="flex gap-4">
              {/* Order Controls */}
              <div className="flex flex-col justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleMoveUp(artisan)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="text-center text-sm font-medium text-muted-foreground">
                  {artisan.displayOrder || 0}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleMoveDown(artisan, sortedArtisans.length - 1)}
                  disabled={index === sortedArtisans.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Photo */}
              <div className="flex-shrink-0">
                {artisan.photoUrl ? (
                  <img
                    src={artisan.photoUrl}
                    alt={artisan.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No photo</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setExpandedCard(expandedCard === artisan.id ? null : artisan.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{artisan.name}</h3>
                  {artisan.featured === 1 && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                  {artisan.active !== 1 && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {language === 'en' ? 'Hidden' : 'Oculto'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-primary font-medium">
                  {artisan.specialty} {artisan.location && `• ${artisan.location}`}
                </p>

                {/* Expanded Details */}
                {expandedCard === artisan.id && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Bio (English)</Label>
                        <p className="text-sm mt-1 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                          {artisan.bioEN || '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Bio (Portuguese)</Label>
                        <p className="text-sm mt-1 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                          {artisan.bioPT || '-'}
                        </p>
                      </div>
                    </div>
                    {(artisan.email || artisan.phone) && (
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {artisan.email && <span>Email: {artisan.email}</span>}
                        {artisan.phone && <span>Phone: {artisan.phone}</span>}
                      </div>
                    )}
                    {artisan.socialMedia && (
                      <div className="text-sm text-muted-foreground">
                        Social: {artisan.socialMedia}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(artisan)}
                  title={artisan.active === 1 ? 'Hide' : 'Show'}
                >
                  {artisan.active === 1 ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(artisan)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(artisan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedArtisans.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {language === 'en'
              ? 'No artisans yet. Add your first artisan or load the default ones.'
              : 'Nenhum artesao ainda. Adicione seu primeiro artesao ou carregue os padrao.'}
          </p>
          <Button variant="outline" onClick={handleLoadDefaults}>
            <Download className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Load Default Artisans' : 'Carregar Artesaos Padrao'}
          </Button>
        </Card>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtisan
                ? (language === 'en' ? 'Edit Artisan' : 'Editar Artesao')
                : (language === 'en' ? 'Add Artisan' : 'Adicionar Artesao')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">
                {language === 'en' ? 'Basic Information' : 'Informacoes Basicas'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{language === 'en' ? 'Name' : 'Nome'} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder={language === 'en' ? 'Full name' : 'Nome completo'}
                  />
                </div>

                <div>
                  <Label htmlFor="specialty">{language === 'en' ? 'Specialty / Role' : 'Especialidade / Cargo'}</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder={language === 'en' ? 'e.g., Master Tailor' : 'ex: Mestre Alfaiate'}
                  />
                </div>

                <div>
                  <Label htmlFor="location">{language === 'en' ? 'Location / Origin' : 'Localizacao / Origem'}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={language === 'en' ? 'e.g., Pakistan' : 'ex: Paquistao'}
                  />
                </div>

                <div>
                  <Label htmlFor="displayOrder">{language === 'en' ? 'Display Order' : 'Ordem de Exibicao'}</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">
                {language === 'en' ? 'Photo' : 'Foto'}
              </h3>

              <div className="flex gap-4 items-start">
                {formData.photoUrl && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={formData.photoUrl}
                      alt={formData.name || 'Artisan photo'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setUploadingPhoto(true);
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
                              photoUrl: result.url
                            });
                          };
                          reader.readAsDataURL(file);
                        } catch (error) {
                          console.error('Upload error:', error);
                        } finally {
                          setUploadingPhoto(false);
                        }
                      }}
                    />
                    {uploadingPhoto ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500 mt-2">
                          {language === 'en' ? 'Click to upload photo' : 'Clique para enviar foto'}
                        </span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'en'
                      ? 'Recommended: Square image, at least 400x400px'
                      : 'Recomendado: Imagem quadrada, pelo menos 400x400px'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">
                {language === 'en' ? 'Biography' : 'Biografia'}
              </h3>

              <div>
                <Label htmlFor="bioEN">{language === 'en' ? 'Bio (English)' : 'Bio (Ingles)'}</Label>
                <Textarea
                  id="bioEN"
                  value={formData.bioEN}
                  onChange={(e) => setFormData({ ...formData, bioEN: e.target.value })}
                  rows={4}
                  placeholder={language === 'en' ? 'Write the artisan biography in English...' : 'Escreva a biografia do artesao em ingles...'}
                />
              </div>

              <div>
                <Label htmlFor="bioPT">{language === 'en' ? 'Bio (Portuguese)' : 'Bio (Portugues)'}</Label>
                <Textarea
                  id="bioPT"
                  value={formData.bioPT}
                  onChange={(e) => setFormData({ ...formData, bioPT: e.target.value })}
                  rows={4}
                  placeholder={language === 'en' ? 'Write the artisan biography in Portuguese...' : 'Escreva a biografia do artesao em portugues...'}
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">
                {language === 'en' ? 'Contact (Optional)' : 'Contato (Opcional)'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="socialMedia">
                  {language === 'en' ? 'Social Media' : 'Redes Sociais'}
                </Label>
                <Input
                  id="socialMedia"
                  value={formData.socialMedia}
                  onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                  placeholder="@instagram, facebook.com/page"
                />
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">
                {language === 'en' ? 'Settings' : 'Configuracoes'}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active" className="cursor-pointer">
                    {language === 'en' ? 'Show on website' : 'Mostrar no site'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'When enabled, this artisan appears on the About page' : 'Quando ativado, este artesao aparece na pagina Sobre'}
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
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
                  {language === 'en' ? 'Featured Artisan (shows star icon)' : 'Artesao em Destaque (mostra icone de estrela)'}
                </Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
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
                  ? (language === 'en' ? 'Update Artisan' : 'Atualizar Artesao')
                  : (language === 'en' ? 'Create Artisan' : 'Criar Artesao')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
