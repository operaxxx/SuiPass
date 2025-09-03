import { createFileRoute } from '@tanstack/react-router'
import { LayoutRoute } from './__root'
import { useState } from 'react'
import { Settings, User, Shield, Bell, Database, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { addToast } = useToast()

  const settingsTabs = [
    { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
    { id: 'account', label: 'Account', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'storage', label: 'Storage', icon: <Database className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
  ]

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Settings Saved',
      description: 'Your settings have been saved successfully',
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic application preferences and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-lock">Auto-lock vault</Label>
                      <p className="text-sm text-gray-600">Automatically lock vault after inactivity</p>
                    </div>
                    <Switch id="auto-lock" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lock-timeout">Lock timeout (minutes)</Label>
                    <Input id="lock-timeout" type="number" defaultValue="15" min="1" max="120" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="clipboard">Clear clipboard</Label>
                      <p className="text-sm text-gray-600">Automatically clear clipboard after copying passwords</p>
                    </div>
                    <Switch id="clipboard" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clipboard-timeout">Clipboard timeout (seconds)</Label>
                    <Input id="clipboard-timeout" type="number" defaultValue="30" min="5" max="300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Your Name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select id="timezone" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup">Enable backup</Label>
                      <p className="text-sm text-gray-600">Automatically backup your vault data</p>
                    </div>
                    <Switch id="backup" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="biometric">Biometric authentication</Label>
                      <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                    </div>
                    <Switch id="biometric" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-factor authentication</Label>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Badge variant="secondary">Setup Required</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="master-password">Change master password</Label>
                      <p className="text-sm text-gray-600">Update your vault master password</p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emergency-access">Emergency access</Label>
                      <p className="text-sm text-gray-600">Allow trusted contacts to access your vault</p>
                    </div>
                    <Switch id="emergency-access" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="security-alerts">Security alerts</Label>
                      <p className="text-sm text-gray-600">Get notified about security events</p>
                    </div>
                    <Switch id="security-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-reminders">Backup reminders</Label>
                      <p className="text-sm text-gray-600">Remind me to backup my vault</p>
                    </div>
                    <Switch id="backup-reminders" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="updates">Update notifications</Label>
                      <p className="text-sm text-gray-600">Notify about app updates</p>
                    </div>
                    <Switch id="updates" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'storage' && (
            <Card>
              <CardHeader>
                <CardTitle>Storage Settings</CardTitle>
                <CardDescription>
                  Manage your data storage and sync preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync">Auto-sync</Label>
                      <p className="text-sm text-gray-600">Automatically sync across devices</p>
                    </div>
                    <Switch id="sync" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="offline-mode">Offline mode</Label>
                      <p className="text-sm text-gray-600">Allow offline access to vaults</p>
                    </div>
                    <Switch id="offline-mode" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Storage Usage</Label>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                    </div>
                    <p className="text-sm text-gray-600">33% of 100MB used</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compression">Data compression</Label>
                      <p className="text-sm text-gray-600">Compress vault data to save space</p>
                    </div>
                    <Switch id="compression" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 bg-white border rounded mb-2"></div>
                        <span className="text-xs">Light</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 bg-gray-800 rounded mb-2"></div>
                        <span className="text-xs">Dark</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center border-blue-500">
                        <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-800 rounded mb-2"></div>
                        <span className="text-xs">Auto</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view">Compact view</Label>
                      <p className="text-sm text-gray-600">Use more compact interface</p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations">Animations</Label>
                      <p className="text-sm text-gray-600">Enable interface animations</p>
                    </div>
                    <Switch id="animations" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/settings')({
  component: () => (
    <LayoutRoute>
      <SettingsPage />
    </LayoutRoute>
  ),
})