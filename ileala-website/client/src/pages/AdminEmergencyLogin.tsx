import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminEmergencyLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("ceo@ileala.ae");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.user.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Emergency admin credentials
      const EMERGENCY_EMAIL = "ceo@ileala.ae";
      const EMERGENCY_PASSWORD = "IleAla2025!Admin#Emergency";

      if (email === EMERGENCY_EMAIL && password === EMERGENCY_PASSWORD) {
        // Try to login with emergency credentials
        try {
          const result = await loginMutation.mutateAsync({
            email: EMERGENCY_EMAIL,
            password: EMERGENCY_PASSWORD,
          });

          if (result.success) {
            toast.success("Emergency admin access granted!");
            setLocation("/admin");
          } else {
            toast.error("Emergency login failed. Please contact support.");
          }
        } catch (error: any) {
          // If login fails, it means the emergency admin user doesn't exist yet
          // Show message to create it first
          toast.error(
            "Emergency admin user not found. Please create it first using the registration system or contact support.",
            { duration: 5000 }
          );
          console.error("Emergency login error:", error);
        }
      } else {
        toast.error("Invalid emergency credentials");
      }
    } catch (error) {
      console.error("Emergency login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-amber-200">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Emergency Admin Access
          </CardTitle>
          <CardDescription className="text-base">
            🚨 This is a backup login for emergency situations only.
              

            Use this when the main authentication system is unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Emergency Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ceo@ileala.ae"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-amber-300 focus:border-red-500"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Emergency Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter emergency password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-amber-300 focus:border-red-500"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "🚨 Emergency Login"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ <strong>Security Notice:</strong>
            </p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li>This login uses the main authentication system</li>
              <li>Emergency admin user must exist in the database</li>
              <li>Only use when main system is down</li>
              <li>Keep credentials secure and private</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setLocation("/login")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to normal login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
