/**
 * Chat Loading State - React Suspense Loading Boundary
 * Displayed while the chat page is loading (RSC streaming)
 */
export default function ChatLoading() {
  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-900/80 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dark-700 animate-pulse" />
          <div className="w-24 h-5 rounded bg-dark-700 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-8 rounded-lg bg-dark-700 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-72 bg-dark-900 border-r border-dark-700/50 p-3">
          <div className="w-full h-10 rounded-lg bg-dark-800 animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-4 h-4 rounded bg-dark-700 animate-pulse" />
              <div className="flex-1">
                <div className="w-full h-4 rounded bg-dark-700 animate-pulse mb-1" />
                <div className="w-16 h-3 rounded bg-dark-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 animate-pulse mb-4" />
          <div className="w-48 h-6 rounded bg-dark-800 animate-pulse mb-2" />
          <div className="w-72 h-4 rounded bg-dark-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
