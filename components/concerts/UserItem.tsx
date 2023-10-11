import { UserIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import Link from 'next/link'
import { useAvatar } from '../../hooks/useAvatar'
import { Profile } from '../../types/types'
import clsx from 'clsx'

type UserItemProps = {
  profile: Profile
  usernameIsHidden?: boolean
}

export function UserItem({ profile, usernameIsHidden }: UserItemProps) {
  const { data: avatarUrl } = useAvatar(profile.avatar_path)
  return (
    <Link
      href={`/users/${profile.username}`}
      onClick={event => event.stopPropagation()}
      className="flex items-center gap-2 group/user"
    >
      <div className="grid place-content-center w-5 h-5 rounded-full bg-blue-300 group-hover/user:ring-2 group-hover/user:ring-slate-500">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Avatar von ${profile.username}`}
            width={50}
            height={50}
            className="w-5 h-5 object-cover rounded-full"
          />
        ) : (
          <UserIcon className="h-3 text-slate-850" />
        )}
      </div>
      <div className={clsx('text-sm group-hover/user:underline', usernameIsHidden && 'sr-only')}>
        {profile.username}
      </div>
    </Link>
  )
}
