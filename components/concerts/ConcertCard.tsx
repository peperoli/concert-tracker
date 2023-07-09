import Link from 'next/link'
import { MapPinIcon, UsersIcon } from '@heroicons/react/20/solid'
import 'dayjs/locale/de'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'
import { Concert } from '../../types/types'
import { useProfiles } from '../../hooks/useProfiles'
import { useUser } from '../../hooks/useUser'

const ConcertDate = ({ date }: { date: Date }) => {
  return (
    <div className="relative flex-none flex flex-col justify-center items-center w-20 h-20 border border-slate-700 rounded-lg first:bg-slate-700 first:group-hover:bg-slate-600 shadow-md transition duration-200">
      {date && <span className="text-3xl font-bold">{date.getDate()}</span>}
      {date && <span className="text-sm">{new Date(date).toLocaleDateString('de', {month: 'short'})}</span>}
      {date?.getFullYear() !== new Date().getFullYear() && (
        <span className="absolute -bottom-3 px-2 py-1 rounded-full text-xs font-bold text-slate-850 bg-blue-300">
          {date.getFullYear()}
        </span>
      )}
    </div>
  )
}

interface ConcertCardProps {
  concert: Concert
}

export const ConcertCard = ({ concert }: ConcertCardProps) => {
  const { data: user } = useUser()
  const fanIds = new Set(concert?.bands_seen?.map(item => item.user_id))  
  const { data: profiles} = useProfiles({ids:[...fanIds]})
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/concerts/${concert.id}`)}
      className="flex flex-col md:flex-row group gap-4 p-6 rounded-2xl bg-slate-800 hover:cursor-pointer"
    >
      <div className="flex md:flex-col items-center">
        <ConcertDate date={new Date(concert.date_start)} />
        {concert.date_end && concert.date_end !== concert.date_start && (
          <>
            <div className="w-4 md:w-auto md:h-4 border-t md:border-l border-slate-700" />
            <ConcertDate date={new Date(concert.date_end)} />
          </>
        )}
      </div>
      <div>
        {concert.name && <div className="btn btn-tag !bg-deepPurple mb-2">{concert.name}</div>}
        <div className="flex flex-wrap items-center -ml-2 mb-2">
          {concert.bands &&
            concert.bands.map((band, index) => (
              <Fragment key={band.id}>
                {index !== 0 ? <span className="text-slate-300">&bull;</span> : null}
                <Link
                  href={`/bands/${band.id}`}
                  onClick={event => event.stopPropagation()}
                  className={`btn btn-link${
                    concert.bands_seen?.find(item => item.band_id === band.id && item.user_id === user?.id) ? ' !text-venom' : ''
                  }`}
                >
                  {band.name}
                </Link>
              </Fragment>
            ))}
        </div>
        <div className="flex gap-4 w-full mb-2">
          {concert.location && (
            <div className="inline-flex items-center text-sm">
              <MapPinIcon className="h-icon mr-2 text-slate-300" />
              {concert.location?.name}
            </div>
          )}
        </div>
        {profiles && (
          <div className="flex text-sm">
            <UsersIcon className="flex-none h-icon mr-2 self-center text-slate-300" />
            <div className="-ml-2">
              {profiles.map(item => (
                <Link
                  key={item?.id}
                  href={`/users/${item?.username}`}
                  onClick={event => event.stopPropagation()}
                  className="btn btn-link"
                >
                  {item?.username}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
