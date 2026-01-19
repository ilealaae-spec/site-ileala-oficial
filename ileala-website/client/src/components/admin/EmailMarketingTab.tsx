import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit, Trash2, Mail, Send, Users, Eye, Image, Download, List } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EmailMarketingTab() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isRecipientsOpen, setIsRecipientsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipientType: 'newsletter' as 'newsletter' | 'all_customers' | 'specific',
  });

  const utils = trpc.useUtils();
  const { data: campaigns, isLoading } = trpc.emailCampaigns.list.useQuery();

  const { data: recipientCount } = trpc.emailCampaigns.getRecipientCount.useQuery(
    { recipientType: formData.recipientType as 'newsletter' | 'all_customers' },
    { enabled: formData.recipientType !== 'specific' }
  );

  // Query to get recipients list
  const { data: recipientsList, isLoading: isLoadingRecipients } = trpc.emailCampaigns.getRecipientsList.useQuery(
    { recipientType: formData.recipientType as 'newsletter' | 'all_customers' },
    { enabled: isRecipientsOpen && formData.recipientType !== 'specific' }
  );

  // Image upload mutation
  const uploadImageMutation = (trpc.products as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      // Insert image HTML into content
      const imageHtml = `<img src="${data.url}" alt="Email image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      setFormData(prev => ({
        ...prev,
        content: prev.content + '\n' + imageHtml + '\n'
      }));
      toast.success(language === 'en' ? 'Image uploaded!' : 'Imagem enviada!');
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsUploading(false);
    },
  });

  const createMutation = trpc.emailCampaigns.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Campaign created!' : 'Campanha criada!');
      utils.emailCampaigns.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.emailCampaigns.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Campaign updated!' : 'Campanha atualizada!');
      utils.emailCampaigns.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.emailCampaigns.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Campaign deleted!' : 'Campanha excluida!');
      utils.emailCampaigns.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendMutation = trpc.emailCampaigns.send.useMutation({
    onSuccess: (data) => {
      toast.success(
        language === 'en'
          ? `Campaign sent! ${data.sentCount} emails delivered, ${data.failedCount} failed.`
          : `Campanha enviada! ${data.sentCount} emails entregues, ${data.failedCount} falharam.`
      );
      utils.emailCampaigns.list.invalidate();
      setIsSendConfirmOpen(false);
      setSelectedCampaign(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSendConfirmOpen(false);
    },
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      content: '',
      recipientType: 'newsletter',
    });
    setEditingCampaign(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCampaign) {
      updateMutation.mutate({
        id: editingCampaign.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      subject: campaign.subject,
      content: campaign.content,
      recipientType: campaign.recipientType,
    });
    setIsDialogOpen(true);
  };

  const handlePreview = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsPreviewOpen(true);
  };

  const handleSendClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsSendConfirmOpen(true);
  };

  const confirmSend = () => {
    if (selectedCampaign) {
      sendMutation.mutate({ id: selectedCampaign.id });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Por favor, selecione uma imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'Imagem deve ter menos de 5MB');
      return;
    }

    setIsUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadImageMutation.mutate({
        fileName: `email-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download recipients list as CSV
  const handleDownloadRecipients = () => {
    if (!recipientsList?.recipients || recipientsList.recipients.length === 0) {
      toast.error(language === 'en' ? 'No recipients to download' : 'Nenhum destinatario para baixar');
      return;
    }

    const csv = [
      ['Email', 'Name'],
      ...recipientsList.recipients.map((r: any) => [r.email, r.name || ''])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-recipients-${formData.recipientType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(language === 'en' ? 'CSV downloaded!' : 'CSV baixado!');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: language === 'en' ? 'Draft' : 'Rascunho',
      sending: language === 'en' ? 'Sending' : 'Enviando',
      sent: language === 'en' ? 'Sent' : 'Enviado',
      failed: language === 'en' ? 'Failed' : 'Falhou',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getRecipientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      newsletter: language === 'en' ? 'Newsletter Subscribers' : 'Inscritos na Newsletter',
      all_customers: language === 'en' ? 'All Customers' : 'Todos os Clientes',
      specific: language === 'en' ? 'Specific Emails' : 'Emails Especificos',
    };
    return labels[type] || type;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'en' ? 'Email Marketing' : 'Email Marketing'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Create and send marketing emails to your customers'
              : 'Crie e envie emails de marketing para seus clientes'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'New Campaign' : 'Nova Campanha'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Campaigns' : 'Total de Campanhas'}
              </p>
              <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Sent Campaigns' : 'Campanhas Enviadas'}
              </p>
              <p className="text-2xl font-bold">
                {campaigns?.filter((c: any) => c.status === 'sent').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Emails Sent' : 'Total de Emails Enviados'}
              </p>
              <p className="text-2xl font-bold">
                {campaigns?.reduce((acc: number, c: any) => acc + (c.sentCount || 0), 0) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'en' ? 'Campaigns' : 'Campanhas'}
        </h3>

        {!campaigns || campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'en' ? 'No campaigns yet' : 'Nenhuma campanha ainda'}</p>
            <p className="text-sm">
              {language === 'en'
                ? 'Create your first email campaign to engage with your customers'
                : 'Crie sua primeira campanha de email para engajar seus clientes'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign: any) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium">{campaign.subject}</h4>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{getRecipientTypeLabel(campaign.recipientType)}</span>
                    {campaign.status === 'sent' && (
                      <>
                        <span>|</span>
                        <span>
                          {language === 'en' ? 'Sent:' : 'Enviados:'} {campaign.sentCount}
                        </span>
                        {campaign.failedCount > 0 && (
                          <span className="text-red-500">
                            {language === 'en' ? 'Failed:' : 'Falharam:'} {campaign.failedCount}
                          </span>
                        )}
                      </>
                    )}
                    <span>|</span>
                    <span>
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePreview(campaign)}
                    title={language === 'en' ? 'Preview' : 'Visualizar'}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {campaign.status === 'draft' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(campaign)}
                        title={language === 'en' ? 'Edit' : 'Editar'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSendClick(campaign)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Send' : 'Enviar'}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate({ id: campaign.id })}
                    className="text-destructive hover:text-destructive"
                    title={language === 'en' ? 'Delete' : 'Excluir'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign
                ? (language === 'en' ? 'Edit Campaign' : 'Editar Campanha')
                : (language === 'en' ? 'New Campaign' : 'Nova Campanha')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="recipientType">
                {language === 'en' ? 'Recipients' : 'Destinatarios'}
              </Label>
              <Select
                value={formData.recipientType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, recipientType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newsletter">
                    {language === 'en' ? 'Newsletter Subscribers' : 'Inscritos na Newsletter'}
                  </SelectItem>
                  <SelectItem value="all_customers">
                    {language === 'en' ? 'All Customers (Verified)' : 'Todos os Clientes (Verificados)'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {recipientCount && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en'
                      ? `${recipientCount.count} recipients will receive this email`
                      : `${recipientCount.count} destinatarios receberao este email`}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRecipientsOpen(true)}
                  >
                    <List className="w-4 h-4 mr-1" />
                    {language === 'en' ? 'View List' : 'Ver Lista'}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="subject">
                {language === 'en' ? 'Subject' : 'Assunto'} *
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={language === 'en' ? 'New Collection Available!' : 'Nova Colecao Disponivel!'}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">
                {language === 'en' ? 'Content' : 'Conteudo'} *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={language === 'en'
                  ? 'Write your email content here... You can use basic HTML for formatting.'
                  : 'Escreva o conteudo do seu email aqui... Voce pode usar HTML basico para formatacao.'}
                rows={10}
                required
              />

              {/* Image Upload */}
              <div className="flex items-center gap-4 mt-2">
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
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Uploading...' : 'Enviando...'}
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Add Image' : 'Adicionar Imagem'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Max 5MB (JPG, PNG, GIF)' : 'Max 5MB (JPG, PNG, GIF)'}
                </p>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {language === 'en'
                  ? 'Tip: Use <b>bold</b>, <i>italic</i>, <br> for line breaks, and <p> for paragraphs.'
                  : 'Dica: Use <b>negrito</b>, <i>italico</i>, <br> para quebras de linha, e <p> para paragrafos.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCampaign
                  ? (language === 'en' ? 'Update' : 'Atualizar')
                  : (language === 'en' ? 'Create Campaign' : 'Criar Campanha')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Email Preview' : 'Visualizacao do Email'}
            </DialogTitle>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Subject:' : 'Assunto:'}
                </p>
                <p className="font-medium">{selectedCampaign.subject}</p>
              </div>

              <div className="border rounded-lg p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedCampaign.content }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recipients List Dialog */}
      <Dialog open={isRecipientsOpen} onOpenChange={setIsRecipientsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === 'en' ? 'Recipients List' : 'Lista de Destinatarios'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary and Download */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">
                  {formData.recipientType === 'newsletter'
                    ? (language === 'en' ? 'Newsletter Subscribers' : 'Inscritos na Newsletter')
                    : (language === 'en' ? 'All Verified Customers' : 'Todos os Clientes Verificados')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {recipientsList?.count || 0} {language === 'en' ? 'recipients' : 'destinatarios'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadRecipients}
                disabled={!recipientsList?.recipients || recipientsList.recipients.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Download CSV' : 'Baixar CSV'}
              </Button>
            </div>

            {/* Recipients List */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                {isLoadingRecipients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : recipientsList?.recipients && recipientsList.recipients.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">#</th>
                        <th className="text-left p-3 text-sm font-medium">Email</th>
                        <th className="text-left p-3 text-sm font-medium">
                          {language === 'en' ? 'Name' : 'Nome'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipientsList.recipients.map((recipient: any, index: number) => (
                        <tr key={recipient.email} className="border-t hover:bg-muted/50">
                          <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="p-3 text-sm font-medium">{recipient.email}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {recipient.name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>{language === 'en' ? 'No recipients found' : 'Nenhum destinatario encontrado'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={isSendConfirmOpen} onOpenChange={setIsSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Send Campaign?' : 'Enviar Campanha?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en'
                ? 'This will send the email to all selected recipients. This action cannot be undone.'
                : 'Isso enviara o email para todos os destinatarios selecionados. Esta acao nao pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSend}
              disabled={sendMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Sending...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Send Now' : 'Enviar Agora'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
