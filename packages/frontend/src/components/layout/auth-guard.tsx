import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth';
import { Shield, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const navigate = useNavigate();
  const { isConnected, isConnecting } = useAuthStore();

  React.useEffect(() => {
    if (!isConnected && !isConnecting) {
      navigate({ to: redirectTo });
    }
  }, [isConnected, isConnecting, navigate, redirectTo]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please connect your wallet to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-gray-500">
                <Lock className="h-8 w-8" />
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  // Trigger wallet connection
                  const walletButton = document.querySelector('[data-testid="wallet-connect-button"]');
                  if (walletButton instanceof HTMLElement) {
                    walletButton.click();
                  }
                }}
              >
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};