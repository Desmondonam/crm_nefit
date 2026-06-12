export default function Spinner({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}

export function ErrorMsg({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-red-500 font-medium">Something went wrong</p>
      <p className="text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
