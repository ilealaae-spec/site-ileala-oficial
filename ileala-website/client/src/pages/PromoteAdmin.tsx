import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PromoteAdmin() {
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const promoteMutation = trpc.admin.promoteToAdmin.useMutation({
    onSuccess: (data) => {
      setResult({ success: true, message: data.message });
      toast.success('Successfully promoted to admin!');
    },
    onError: (error) => {
      setResult({ success: false, message: error.message });
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    promoteMutation.mutate({ email, secret });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Promote to Admin
          </h2>
          <p className="text-sm text-gray-600">
            Enter your email and the secret code to become an admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="secret">Secret Code</Label>
            <Input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret code"
              required
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={promoteMutation.isPending}
          >
            {promoteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Promoting...
              </>
            ) : (
              'Promote to Admin'
            )}
          </Button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
            </div>
            {result.success && (
              <div className="mt-4">
                <Button
                  onClick={() => window.location.href = '/admin'}
                  className="w-full"
                >
                  Go to Admin Panel
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </Card>
    </div>
  );
}
