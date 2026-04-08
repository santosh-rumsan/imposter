import { cn, getInitial } from '../lib/utils'

interface PlayerAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-20 h-20 text-3xl',
}

export function PlayerAvatar({ name, size = 'md', className }: PlayerAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
        'bg-gradient-to-br from-blue-500 to-purple-600',
        sizeClasses[size],
        className
      )}
    >
      {getInitial(name)}
    </div>
  )
}
