import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Loader2, Shield, Lock, Monitor, History, AlertTriangle, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SecurityTab() {
  const { language } = useLanguage();
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');

  const utils = trpc.useUtils();
  
  // Fetch data
  const { data: auditLogs, isLoading: auditLoading } = trpc.auth.getAuditLogs.useQuery({ limit: 50, offset: 0 });
  const { data: loginHistory, isLoading: loginLoading } = trpc.auth.getLoginHistory.useQuery({ days: 30 });
  const { data: activeSessions, isLoading: sessionsLoading } = trpc.auth.getActiveSessions.useQuery();

  // Mutations
  const setup2FAMutation = trpc.auth.setup2FA.useMutation({
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShow2FADialog(true);
      toast.success(language === 'en' ? '2FA setup initiated!' : 'Configuração 2FA iniciada!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const enable2FAMutation = trpc.auth.enable2FA.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes || []);
      setShow2FADialog(false);
      toast.success(language === 'en' ? '2FA enabled successfully!' : '2FA ativado com sucesso!');
      utils.auth.getActiveSessions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verify2FAMutation = trpc.auth.verify2FA.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes || []);
      toast.success(language === 'en' ? '2FA verified!' : '2FA verificado!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const terminateSessionMutation = trpc.auth.terminateSession.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Session terminated!' : 'Sessão encerrada!');
      utils.auth.getActiveSessions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const terminateAllSessionsMutation = trpc.auth.terminateAllSessions.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'All sessions terminated!' : 'Todas as sessões encerradas!');
      // Redirect to login after terminating all sessions
      window.location.href = '/admin/login';
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading = auditLoading || loginLoading || sessionsLoading;

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {language === 'en' ? 'Security Center' : 'Central de Segurança'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Manage security settings, view audit logs, and monitor account activity' 
            : 'Gerencie configurações de segurança, visualize logs de auditoria e monitore atividades da conta'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Audit Logs' : 'Logs de Auditoria'}
              </p>
              <p className="text-2xl font-bold">{auditLogs?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <History className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Login History' : 'Histórico de Login'}
              </p>
              <p className="text-2xl font-bold">{loginHistory?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Monitor className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Active Sessions' : 'Sessões Ativas'}
              </p>
              <p className="text-2xl font-bold">{activeSessions?.sessions?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? '2FA Status' : 'Status 2FA'}
              </p>
              <p className="text-sm font-semibold text-orange-600">
                {language === 'en' ? 'Not Enabled' : 'Não Ativado'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {language === 'en' ? 'Two-Factor Authentication (2FA)' : 'Autenticação de Dois Fatores (2FA)'}
            </h3>
          </div>
          <Button
            onClick={() => setup2FAMutation.mutate()}
            disabled={setup2FAMutation.isPending}
          >
            {setup2FAMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {language === 'en' ? 'Enable 2FA' : 'Ativar 2FA'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Add an extra layer of security to your account by requiring a verification code in addition to your password.'
            : 'Adicione uma camada extra de segurança à sua conta exigindo um código de verificação além da sua senha.'}
        </p>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {language === 'en' ? 'Active Sessions' : 'Sessões Ativas'}
            </h3>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm(language === 'en' 
                ? 'Are you sure you want to terminate all sessions? You will be logged out.' 
                : 'Tem certeza que deseja encerrar todas as sessões? Você será desconectado.')) {
                terminateAllSessionsMutation.mutate();
              }
            }}
            disabled={terminateAllSessionsMutation.isPending}
          >
            {terminateAllSessionsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {language === 'en' ? 'Terminate All' : 'Encerrar Todas'}
          </Button>
        </div>

        <div className="space-y-3">
          {activeSessions?.sessions && activeSessions.sessions.length > 0 ? (
            activeSessions.sessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.browser} on {session.os}</p>
                    <p className="text-sm text-muted-foreground">
                      IP: {session.ip} • {session.deviceType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Last active:' : 'Última atividade:'} {new Date(session.lastActivityAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => terminateSessionMutation.mutate({ sessionId: session.sessionToken })}
                  disabled={terminateSessionMutation.isPending}
                >
                  {language === 'en' ? 'Terminate' : 'Encerrar'}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'en' ? 'No active sessions' : 'Nenhuma sessão ativa'}
            </p>
          )}
        </div>
      </Card>

      {/* Login History */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {language === 'en' ? 'Login History (Last 30 Days)' : 'Histórico de Login (Últimos 30 Dias)'}
          </h3>
        </div>

        <div className="space-y-2">
          {loginHistory && loginHistory.length > 0 ? (
            loginHistory.slice(0, 20).map((login: any) => (
              <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {login.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {login.browser} on {login.os}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IP: {login.ip} • {new Date(login.createdAt).toLocaleString()}
                    </p>
                    {!login.success && login.failureReason && (
                      <p className="text-xs text-red-600">{login.failureReason}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  login.success 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {login.success 
                    ? (language === 'en' ? 'Success' : 'Sucesso')
                    : (language === 'en' ? 'Failed' : 'Falhou')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'en' ? 'No login history' : 'Nenhum histórico de login'}
            </p>
          )}
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {language === 'en' ? 'Audit Logs (Last 50 Actions)' : 'Logs de Auditoria (Últimas 50 Ações)'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Action' : 'Ação'}
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Entity' : 'Entidade'}
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'User' : 'Usuário'}
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Date' : 'Data'}
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log: any) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.action === 'create' ? 'bg-green-100 text-green-700' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'delete' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm">{log.entity}</td>
                    <td className="py-2 px-3 text-sm">User #{log.userId}</td>
                    <td className="py-2 px-3 text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-sm text-muted-foreground">
                    {language === 'en' ? 'No audit logs' : 'Nenhum log de auditoria'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Set Up Two-Factor Authentication' : 'Configurar Autenticação de Dois Fatores'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en'
                ? 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)'
                : 'Escaneie este código QR com seu aplicativo autenticador (Google Authenticator, Authy, etc.)'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}

            {secret && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en' ? 'Manual entry code:' : 'Código de entrada manual:'}
                </p>
                <code className="text-sm font-mono">{secret}</code>
              </div>
            )}

            {/* Verification Code Input */}
            {qrCode && backupCodes.length === 0 && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-medium mb-2">
                    {language === 'en' ? 'Enter the 6-digit code from your authenticator app:' : 'Digite o código de 6 dígitos do seu aplicativo autenticador:'}
                  </label>
                  <input
                    id="verification-code"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-2 border rounded-lg text-center text-2xl font-mono tracking-widest"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (verificationCode.length === 6) {
                      enable2FAMutation.mutate({ token: verificationCode });
                    } else {
                      toast.error(language === 'en' ? 'Please enter a 6-digit code' : 'Por favor, digite um código de 6 dígitos');
                    }
                  }}
                  disabled={enable2FAMutation.isPending || verificationCode.length !== 6}
                  className="w-full"
                >
                  {enable2FAMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {language === 'en' ? 'Verify & Enable 2FA' : 'Verificar e Ativar 2FA'}
                </Button>
              </div>
            )}

            {backupCodes.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="font-semibold text-yellow-900">
                    {language === 'en' ? 'Backup Codes' : 'Códigos de Backup'}
                  </p>
                </div>
                <p className="text-sm text-yellow-800 mb-2">
                  {language === 'en'
                    ? 'Save these codes in a safe place. You can use them to access your account if you lose your device.'
                    : 'Salve estes códigos em um lugar seguro. Você pode usá-los para acessar sua conta se perder seu dispositivo.'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm font-mono bg-white p-2 rounded">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
