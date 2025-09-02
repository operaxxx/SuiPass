import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/' as any)({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to SuiPass</h1>
          <p className="mt-4 text-lg text-gray-600">
            Decentralized Password Manager on Sui Blockchain
          </p>
        </div>
      </div>
    </div>
  ),
})