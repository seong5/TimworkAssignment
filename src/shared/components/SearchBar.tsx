import { Search } from 'lucide-react'
import { Button } from './Button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  label?: string
  clearButtonLabel?: string
  searchButtonLabel?: string
  onSearch?: (value: string) => void
}

export function SearchBar({
  value,
  onChange,
  placeholder = '검색',
  id = 'search',
  label,
  clearButtonLabel = '검색어 지우기',
  searchButtonLabel = '검색',
  onSearch,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label={label ?? placeholder}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            aria-label={clearButtonLabel}
            className="absolute right-2 top-1/2 min-w-0 -translate-y-1/2 px-2 py-1 text-gray-400 hover:text-gray-600"
          >
            ×
          </Button>
        )}
      </div>
      <Button type="submit" variant="primary" size="md" icon={<Search className="h-4 w-4" />}>
        {searchButtonLabel}
      </Button>
    </form>
  )
}
