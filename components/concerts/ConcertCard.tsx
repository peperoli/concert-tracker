import Link from 'next/link'
import { MapPinIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { Concert } from '../../types/types'
import { useProfiles } from '../../hooks/useProfiles'
import { useSession } from '../../hooks/useSession'
import clsx from 'clsx'
import useMediaQuery from '../../hooks/useMediaQuery'
import { UserItem } from './UserItem'
import { useState } from 'react'

type ConcertDateProps = {
  date: Date
  isFirst?: boolean
}

const ConcertDate = ({ date, isFirst }: ConcertDateProps) => {
  const isCurrentYear = date.getFullYear() === new Date().getFullYear()
  return (
    <div
      className={clsx(
        'relative flex-none flex flex-col justify-center items-center w-16 aspect-square border border-slate-700 rounded-lg transition duration-200',
        clsx(isFirst && 'bg-slate-700 group-hover:bg-slate-600')
      )}
    >
      <div className={clsx('flex items-center', isCurrentYear ? 'flex-col' : 'gap-1')}>
        <span className="font-bold">{date.toLocaleDateString('de-CH', { day: 'numeric' })}</span>
        <span className="text-sm">{date.toLocaleDateString('de-CH', { month: 'short' })}</span>
      </div>
      {!isCurrentYear && <span className="text-sm">{date.getFullYear()}</span>}
    </div>
  )
}

interface ConcertCardProps {
  concert: Concert
}

export const ConcertCard = ({ concert }: ConcertCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: session } = useSession()
  const fanIds = new Set(concert?.bands_seen?.map(item => item.user_id))
  const { data: profiles } = useProfiles({ ids: [...fanIds] })
  const router = useRouter()
  const bandsCount = concert.bands?.length || 0
  const bandsSeen = concert.bands_seen?.filter(item => item.user_id === session?.user.id)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  function generateVisibleBandCount(threshold: number) {
    let charCount = concert.bands?.[0]?.name.length || 0
    let index = 1

    for (index; index < bandsCount; index++) {
      charCount += 5
      charCount += concert.bands?.[index]?.name.length || 0
      if (charCount > threshold) {
        break
      }
    }

    return index
  }

  const visibleBandCount = generateVisibleBandCount(
    (isDesktop ? 60 : 30) * (concert.is_festival ? 1.75 : 1)
  )
  return (
    <div
      onClick={() => router.push(`/concerts/${concert.id}`)}
      className="flex group gap-4 p-5 rounded-2xl bg-slate-800 hover:cursor-pointer"
    >
      <div className="flex flex-col items-center">
        <ConcertDate date={new Date(concert.date_start)} isFirst />
        {concert.date_end && concert.date_end !== concert.date_start && (
          <>
            <div className="h-2 md:h-4 border-l border-slate-700" />
            <ConcertDate date={new Date(concert.date_end)} />
          </>
        )}
      </div>
      <div>
        {concert.name && (
          <div className="w-fit mb-2 px-3 py-1 rounded-full font-bold text-sm text-slate-850 bg-purple">
            {concert.name}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {concert.bands &&
            concert.bands.slice(0, isExpanded ? undefined : visibleBandCount).map((band, index) => (
              <li role="presentation" className="flex gap-2" key={band.id}>
                <Link
                  href={`/bands/${band.id}`}
                  onClick={event => event.stopPropagation()}
                  className={clsx(
                    'hover:underline',
                    bandsSeen?.find(bandSeen => band.id === bandSeen.band_id) && 'text-venom'
                  )}
                >
                  {band.name}
                </Link>
                {index + 1 !== concert.bands?.length ? (
                  <span className="text-slate-300">&bull;</span>
                ) : null}
              </li>
            ))}
          {bandsCount > visibleBandCount && (
            <button
              onClick={event => {
                setIsExpanded(prev => !prev)
                event?.stopPropagation()
              }}
              className="px-1.5 rounded-md text-slate-300 bg-slate-700"
            >
              {isExpanded ? 'Weniger' : `+${bandsCount - visibleBandCount}`}
            </button>
          )}
        </div>
        <div className="flex gap-4 w-full mb-2">
          <div className="inline-flex items-center text-sm">
            <MapPinIcon className="h-icon mr-2 text-slate-300" />
            {concert.location?.name}
          </div>
        </div>
        {profiles && (
          <div className="flex flex-wrap gap-2 md:gap-x-4">
            {profiles.map(item => (
              <UserItem profile={item} usernameIsHidden={!isDesktop} key={item.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
