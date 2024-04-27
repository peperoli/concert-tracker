'use client'

import Link from 'next/link'
import { useConcert } from '../../hooks/concerts/useConcert'
import { ConcertContext } from '../../hooks/concerts/useConcertContext'
import { Concert, Profile } from '../../types/types'
import { Button } from '../Button'
import { Comments } from './Comments'
import { notFound, usePathname, useRouter } from 'next/navigation'
import { useSession } from '../../hooks/auth/useSession'
import { UserItem } from '../shared/UserItem'
import { BandList } from './BandList'
import { ArrowLeft, Edit, MapPin, Trash } from 'lucide-react'
import { useSpotifyArtist } from '@/hooks/spotify/useSpotifyArtist'
import Image from 'next/image'
import { ConcertDate } from './ConcertDate'
import clsx from 'clsx'
import { useBands } from '@/hooks/bands/useBands'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ConcertStats } from './ConcertStats'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { modalPaths } from '../shared/ModalProvider'
import { useConcertProfiles } from '@/hooks/concerts/useConcertProfiles'
import { Chip } from '../Chip'

type ConcertUserItemProps = {
  concert: Concert
  user: Profile
  count: number
}

const ConcertUserItem = ({ concert, user, count }: ConcertUserItemProps) => {
  const { data: bands } = useBands(undefined, {
    ids: concert.bands_seen?.filter(item => item.user_id === user.id).map(item => item.band_id),
  })
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Link href={`/users/${user.username}`} className="group/user-item" key={user.id}>
          <UserItem
            user={user}
            description={count ? `${count} Band${count > 1 ? 's' : ''}` : null}
          />
        </Link>
      </Tooltip.Trigger>
      <Tooltip.Content className="z-10 rounded-lg border border-slate-800 bg-slate-850 p-2 text-sm shadow-lg">
        <Tooltip.Arrow className="fill-slate-850" />
        <ul>{bands?.data.map(item => <li key={item.id}>{item.name}</li>)}</ul>
      </Tooltip.Content>
    </Tooltip.Root>
  )
}

type ConcertPageProps = {
  initialConcert: Concert
  concertQueryState?: string
}

export const ConcertPage = ({ initialConcert, concertQueryState }: ConcertPageProps) => {
  const { data: concert } = useConcert(initialConcert.id, initialConcert)
  const { data: concertProfiles } = useConcertProfiles(initialConcert.id)
  const { data: session } = useSession()
  const { data: spotifyArtist } = useSpotifyArtist(concert?.bands?.[0]?.spotify_artist_id)
  const [_, setModal] = useQueryState(
    'modal',
    parseAsStringLiteral(modalPaths).withOptions({ history: 'push' })
  )
  const { push } = useRouter()
  const pathname = usePathname()

  if (!concert) {
    notFound()
  }

  return (
    <ConcertContext.Provider value={{ concert }}>
      <main className="container grid gap-4">
        <div className="flex items-center justify-between">
          <Link href={`/${concertQueryState ?? ''}`} className="btn btn-small btn-tertiary">
            <ArrowLeft className="size-icon" />
            Zurück zur Übersicht
          </Link>
          <div className="flex gap-3">
            <Button
              onClick={
                session ? () => setModal('edit-concert') : () => push(`/login?redirect=${pathname}`)
              }
              label="Bearbeiten"
              icon={<Edit className="size-icon" />}
              contentType="icon"
              size="small"
              appearance="tertiary"
            />
            <Button
              onClick={
                session
                  ? () => setModal('delete-concert')
                  : () => push(`/login?redirect=${pathname}`)
              }
              label="Löschen"
              icon={<Trash className="size-icon" />}
              contentType="icon"
              danger
              size="small"
              appearance="tertiary"
            />
          </div>
        </div>
        <header
          className={clsx(
            'relative overflow-hidden rounded-2xl',
            concert.festival_root_id
              ? 'aspect-4/3 bg-purple md:aspect-2/1'
              : 'aspect-square bg-venom md:aspect-4/3'
          )}
        >
          {!concert.festival_root_id && spotifyArtist?.images[0] && (
            <Image src={spotifyArtist.images[0].url} alt="" fill className="object-cover" />
          )}
          <div
            className={clsx(
              'absolute inset-0 bg-radial-gradient from-transparent to-slate-850',
              !concert.festival_root_id && spotifyArtist?.images[0] && 'via-transparent'
            )}
          />
          <div className="relative grid size-full content-end justify-start p-4 md:p-6">
            <div className="mb-4 flex w-fit items-center">
              <ConcertDate date={new Date(concert.date_start)} isFirst contrast />
              {concert.date_end && concert.date_end !== concert.date_start && (
                <>
                  <div className="w-2 border-t border-white/20 md:w-4" />
                  <ConcertDate date={new Date(concert.date_end)} contrast />
                </>
              )}
            </div>
            {(concert.name || concert.is_festival) && (
              <div className="mb-2">
                <Chip label={concert.name || 'Festival'} size="sm" color="blue" />
              </div>
            )}
            <h1 className="mb-2">{concert.bands?.[0]?.name}</h1>
            <p className="h2 mb-0 flex items-center gap-3">
              <MapPin className="size-icon text-slate-300" />
              {concert.location?.name}, {concert.location?.city}
            </p>
          </div>
        </header>
        <section className="rounded-lg bg-slate-800 p-4 md:p-6">
          <h2>Lineup</h2>
          {concert.bands && (
            <BandList
              bands={concert.bands}
              bandsSeen={concert.bands_seen?.filter(item => item.user_id === session?.user.id)}
              concertId={concert.id}
            />
          )}
        </section>
        {concertProfiles && concertProfiles.length > 0 && (
          <section className="rounded-lg bg-slate-800 p-4 md:p-6">
            <h2>Fans</h2>
            <div className="flex flex-wrap gap-4">
              {concertProfiles
                .sort((a, b) => b.count - a.count)
                .map(item => (
                  <ConcertUserItem
                    concert={concert}
                    user={item.profile}
                    count={item.count}
                    key={item.profile.id}
                  />
                ))}
            </div>
          </section>
        )}
        {concert.bands && <ConcertStats bands={concert.bands} />}
        <div className="rounded-lg bg-slate-800 p-4 md:p-6">
          <Comments />
        </div>
      </main>
    </ConcertContext.Provider>
  )
}
