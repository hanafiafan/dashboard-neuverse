import { tagClass } from '@/lib/utils'

interface TagProps {
  value: string
  className?: string
}

export default function Tag({ value, className }: TagProps) {
  return (
    <span className={`tag ${tagClass(value)} ${className || ''}`}>
      {value || '-'}
    </span>
  )
}
