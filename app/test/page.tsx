'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tailwind CSS Test</h1>
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-3">Card Component</h2>
          <p className="text-gray-700 mb-4">If you can see this styled properly, Tailwind is working!</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Test Button
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="text-red-800 font-semibold">Red Box</h3>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-green-800 font-semibold">Green Box</h3>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="text-yellow-800 font-semibold">Yellow Box</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
