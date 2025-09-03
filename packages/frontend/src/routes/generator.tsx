import { createFileRoute } from '@tanstack/react-router'
import { LayoutRoute } from './__root'
import { useState } from 'react'
import { Key, Copy, RefreshCw, Shield, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [strength, setStrength] = useState(0)
  const { addToast } = useToast()

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    let charset = ''
    if (includeUppercase) charset += uppercase
    if (includeLowercase) charset += lowercase
    if (includeNumbers) charset += numbers
    if (includeSymbols) charset += symbols
    
    if (charset === '') {
      addToast({
        type: 'error',
        title: 'No Character Sets Selected',
        description: 'Please select at least one character type',
      })
      return
    }
    
    let generatedPassword = ''
    for (let i = 0; i < length; i++) {
      generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    setPassword(generatedPassword)
    calculateStrength(generatedPassword)
  }

  const calculateStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    setStrength(score)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
        description: 'Password copied successfully',
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy password',
      })
    }
  }

  const getStrengthColor = () => {
    if (strength <= 2) return 'text-red-600'
    if (strength <= 3) return 'text-yellow-600'
    if (strength <= 4) return 'text-orange-600'
    return 'text-green-600'
  }

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Password Generator</h1>
        <p className="text-gray-600 mt-2">
          Create strong, secure passwords for your accounts
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Generator Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Generate Password
              </CardTitle>
              <CardDescription>
                Customize your password settings and generate a secure password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generated Password */}
              <div className="space-y-2">
                <Label htmlFor="generated-password">Generated Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-password"
                    value={password}
                    readOnly
                    placeholder="Click generate to create a password"
                    className="font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="space-y-2">
                  <Label>Password Strength</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          strength <= 2 ? "bg-red-500 w-1/4" :
                          strength <= 3 ? "bg-yellow-500 w-1/2" :
                          strength <= 4 ? "bg-orange-500 w-3/4" :
                          "bg-green-500 w-full"
                        )}
                      />
                    </div>
                    <span className={cn("text-sm font-medium", getStrengthColor())}>
                      {getStrengthText()}
                    </span>
                  </div>
                </div>
              )}

              {/* Length Slider */}
              <div className="space-y-2">
                <Label htmlFor="length">Length: {length}</Label>
                <Input
                  id="length"
                  type="range"
                  min="8"
                  max="32"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Character Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
                  <Switch
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={setIncludeUppercase}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
                  <Switch
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={setIncludeLowercase}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                  <Switch
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
                  <Switch
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={setIncludeSymbols}
                  />
                </div>
              </div>

              <Button onClick={generatePassword} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Use at least 12 characters</h4>
                    <p className="text-sm text-gray-600">Longer passwords are more secure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Mix character types</h4>
                    <p className="text-sm text-gray-600">Combine letters, numbers, and symbols</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Avoid common patterns</h4>
                    <p className="text-sm text-gray-600">Don't use dictionary words or sequences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Use unique passwords</h4>
                    <p className="text-sm text-gray-600">Never reuse passwords across accounts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Strength Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weak (8-11 chars)</span>
                  <Badge variant="destructive">Not Recommended</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fair (12-15 chars)</span>
                  <Badge variant="secondary">Basic</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Good (16-23 chars)</span>
                  <Badge variant="default">Recommended</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Strong (24+ chars)</span>
                  <Badge variant="default" className="bg-green-600">Excellent</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/generator')({
  component: () => (
    <LayoutRoute>
      <PasswordGenerator />
    </LayoutRoute>
  ),
})