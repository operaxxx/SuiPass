# 本地模式和zkLogin UI原型示例

## 1. 本地模式主界面

```jsx
// LocalModeVault.jsx
import React, { useState } from 'react';
import { ModeIndicator, VaultItem, SearchBar, FabButton } from '../components';

export default function LocalModeVault() {
  const [vaultItems, setVaultItems] = useState([
    {
      id: '1',
      title: 'GitHub',
      url: 'github.com',
      username: 'user@example.com',
      favorite: true,
      type: 'login'
    },
    // 更多本地条目...
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              SuiPass
            </h1>
            <ModeIndicator mode="local" onUpgrade={() => setShowUpgrade(true)} />
          </div>
        </div>
      </header>

      {/* 搜索栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <SearchBar
          placeholder="搜索密码条目..."
          onSearch={(query) => console.log(query)}
        />
      </div>

      {/* 本地模式提示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>本地模式</strong> - 您的密码仅存储在此设备上。
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="font-medium underline hover:text-blue-600 ml-1"
                >
                  启用云同步 →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 密码条目列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaultItems.map((item) => (
            <VaultItem
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* 添加按钮 */}
      <FabButton onClick={() => setShowAddItem(true)} />
    </div>
  );
}
```

## 2. 钱包绑定流程

```jsx
// WalletBindingFlow.jsx
import React, { useState } from 'react';
import { StepIndicator } from '../components';

export default function WalletBindingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const steps = [
    { title: '选择方式', description: '选择如何连接到Sui区块链' },
    { title: '连接账户', description: '连接您的Web2或Web3账户' },
    { title: '数据同步', description: '选择要同步的数据' },
    { title: '完成', description: '设置完成，开始使用' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* 步骤指示器 */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* 步骤内容 */}
        <div className="mt-8">
          {currentStep === 0 && (
            <BindingMethodSelection onSelect={setSelectedMethod} />
          )}
          {currentStep === 1 && selectedMethod === 'zklogin' && (
            <ZkLoginSelection onNext={() => setCurrentStep(2)} />
          )}
          {currentStep === 1 && selectedMethod === 'wallet' && (
            <WalletConnection onNext={() => setCurrentStep(2)} />
          )}
          {currentStep === 2 && (
            <DataSyncOptions onNext={() => setCurrentStep(3)} />
          )}
          {currentStep === 3 && (
            <BindingComplete onFinish={() => console.log('Done')} />
          )}
        </div>
      </div>
    </div>
  );
}

// 绑定方式选择
function BindingMethodSelection({ onSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        选择绑定方式
      </h3>
      
      <div 
        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => onSelect('zklogin')}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              使用Web2账户 (zkLogin)
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              使用Google、Apple等账户快速登录，无需管理私钥
            </p>
          </div>
        </div>
      </div>

      <div 
        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => onSelect('wallet')}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              使用Web3钱包
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              连接Sui Wallet或其他兼容钱包
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// zkLogin提供商选择
function ZkLoginSelection({ onNext }) {
  const providers = [
    { id: 'google', name: 'Google', icon: 'G', color: 'bg-red-500' },
    { id: 'apple', name: 'Apple', icon: '🍎', color: 'bg-gray-800' },
    { id: 'facebook', name: 'Facebook', icon: 'f', color: 'bg-blue-600' },
    { id: 'twitch', name: 'Twitch', icon: 'T', color: 'bg-purple-600' }
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        选择登录提供商
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        选择您用来登录的Web2账户，我们将使用zkLogin技术为您生成Sui地址
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center"
            onClick={() => handleZkLogin(provider.id)}
          >
            <div className={`w-12 h-12 ${provider.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-2`}>
              {provider.icon}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {provider.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 3. zkLogin集成组件

```jsx
// ZkLoginButton.jsx
import React, { useState } from 'react';

export default function ZkLoginButton({ onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (provider) => {
    setIsLoading(true);
    try {
      // 1. 初始化zkLogin
      const zkLogin = new ZkLoginService({
        provider,
        redirectUri: window.location.origin + '/auth/callback'
      });

      // 2. 生成OAuth URL
      const authUrl = await zkLogin.getAuthorizationUrl();
      
      // 3. 重定向到OAuth提供商
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('zkLogin error:', error);
      onError?.(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        使用您现有的账户安全登录
      </p>
      
      <div className="space-y-2">
        <button
          onClick={() => handleLogin('google')}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          onClick={() => handleLogin('apple')}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </button>
      </div>
    </div>
  );
}
```

## 4. 数据同步选项

```jsx
// DataSyncOptions.jsx
import React, { useState } from 'react';

export default function DataSyncOptions({ onNext }) {
  const [syncOption, setSyncOption] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());

  const vaultItems = [
    { id: '1', title: 'GitHub', favorite: true },
    { id: '2', title: 'Google', favorite: true },
    { id: '3', title: 'Facebook', favorite: false },
    { id: '4', title: 'Twitter', favorite: false },
    // 更多条目...
  ];

  const handleItemToggle = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        选择要同步的数据
      </h3>
      
      <div className="space-y-4">
        {/* 同步选项 */}
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="syncOption"
              value="all"
              checked={syncOption === 'all'}
              onChange={(e) => setSyncOption(e.target.value)}
              className="h-4 w-4 text-sui-primary focus:ring-sui-primary border-gray-300"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              <strong>同步所有条目</strong> - 将所有本地密码安全上传到Sui区块链
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="syncOption"
              value="favorites"
              checked={syncOption === 'favorites'}
              onChange={(e) => setSyncOption(e.target.value)}
              className="h-4 w-4 text-sui-primary focus:ring-sui-primary border-gray-300"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              <strong>仅同步收藏夹</strong> - 只同步标记为收藏的重要条目
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="syncOption"
              value="selective"
              checked={syncOption === 'selective'}
              onChange={(e) => setSyncOption(e.target.value)}
              className="h-4 w-4 text-sui-primary focus:ring-sui-primary border-gray-300"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              <strong>手动选择</strong> - 自定义选择要同步的条目
            </span>
          </label>
        </div>

        {/* 手动选择列表 */}
        {syncOption === 'selective' && (
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              选择要同步的条目：
            </p>
            <div className="space-y-2">
              {vaultItems.map((item) => (
                <label key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    className="h-4 w-4 text-sui-primary focus:ring-sui-primary border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {item.title}
                    {item.favorite && (
                      <span className="ml-2 text-yellow-500">★</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 安全提示 */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>端到端加密</strong> - 您的数据在上传前会进行本地加密，
                只有您可以访问。即使我们也无法查看您的密码。
              </p>
            </div>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => onNext()}
            className="px-4 py-2 bg-sui-primary text-white rounded-md hover:bg-sui-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sui-primary"
          >
            开始同步
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 5. 模式切换组件

```jsx
// ModeSwitcher.jsx
import React, { useState } from 'react';

export default function ModeSwitcher({ currentMode, onSwitch }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSwitch = () => {
    if (currentMode === 'local') {
      // 切换到去中心化模式
      onSwitch('decentralized');
    } else {
      // 切换到本地模式需要确认
      setShowConfirm(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSwitch}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          currentMode === 'local'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}
      >
        {currentMode === 'local' ? (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            本地模式
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
            </svg>
            去中心化模式
          </>
        )}
      </button>

      {/* 确认对话框 */}
      {showConfirm && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              切换到本地模式
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              切换到本地模式后，您的数据将不再同步到云端。新设备将无法访问这些数据。
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onSwitch('local');
                  setShowConfirm(false);
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 6. 使用示例

```jsx
// App.jsx - 主应用组件
import React, { useState } from 'react';
import { useVaultStore } from '../stores/vault';
import LocalModeVault from './LocalModeVault';
import DecentralizedModeVault from './DecentralizedModeVault';
import WalletBindingFlow from './WalletBindingFlow';

export default function App() {
  const { mode, setMode } = useVaultStore();
  const [showBinding, setShowBinding] = useState(false);

  // 根据模式渲染不同的界面
  if (showBinding) {
    return <WalletBindingFlow onComplete={() => setShowBinding(false)} />;
  }

  if (mode === 'local') {
    return <LocalModeVault onUpgrade={() => setShowBinding(true)} />;
  }

  return <DecentralizedModeVault />;
}
```