import { createFileRoute } from '@tanstack/react-router'
import { LayoutRoute } from './__root'
import { Shield, Lock, Key, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function SecurityPage() {
  const securityFeatures = [
    {
      title: 'End-to-End Encryption',
      description: 'All passwords are encrypted with AES-256-GCM before leaving your device',
      status: 'active',
      icon: <Lock className="h-5 w-5" />
    },
    {
      title: 'Zero-Knowledge Architecture',
      description: 'We never have access to your encryption keys or passwords',
      status: 'active',
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: 'Secure Key Derivation',
      description: 'Master keys derived using Argon2id algorithm',
      status: 'active',
      icon: <Key className="h-5 w-5" />
    },
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      status: 'setup',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ]

  const securityTips = [
    {
      title: 'Use Strong Master Password',
      description: 'Create a unique and complex master password that you don\'t use elsewhere',
      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
    },
    {
      title: 'Enable Biometric Authentication',
      description: 'Use fingerprint or face recognition for quick and secure access',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    },
    {
      title: 'Regular Security Audits',
      description: 'Review your account activity and connected devices regularly',
      icon: <Shield className="h-4 w-4 text-blue-600" />
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
        <p className="text-gray-600 mt-2">
          Manage your security settings and review your account protection
        </p>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-muted-foreground mt-1">Good</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">2 devices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2d</div>
            <p className="text-xs text-muted-foreground mt-1">ago</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Security Features</h2>
        <div className="grid gap-4">
          {securityFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={feature.status === 'active' ? 'default' : 'secondary'}
                    className={cn(
                      feature.status === 'active' ? 'bg-green-100 text-green-800' : ''
                    )}
                  >
                    {feature.status === 'active' ? 'Active' : 'Setup Required'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Security Tips</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {securityTips.map((tip) => (
            <Card key={tip.title}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  {tip.icon}
                  <div>
                    <h3 className="font-medium">{tip.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-gray-600 mt-1">Update master password</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Key className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Setup 2FA</h3>
              <p className="text-sm text-gray-600 mt-1">Add two-factor authentication</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Export Data</h3>
              <p className="text-sm text-gray-600 mt-1">Download your encrypted data</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-medium">Emergency Access</h3>
              <p className="text-sm text-gray-600 mt-1">Setup emergency contacts</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/security')({
  component: () => (
    <LayoutRoute>
      <SecurityPage />
    </LayoutRoute>
  ),
})