'use client'

import { useBand } from '@/hooks/bands/useBand'
import { useBands } from '@/hooks/bands/useBands'
import { useConcert } from '@/hooks/concerts/useConcert'
import { useGenres } from '@/hooks/genres/useGenres'
import { useLocation } from '@/hooks/locations/useLocation'
import { useProfile } from '@/hooks/profiles/useProfile'
import { getRelativeTime } from '@/lib/relativeTime'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import clsx from 'clsx'
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowRight,
  PenIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { CommaSeperatedList } from '../helpers/CommaSeperatedList'
import { useLocale, useTranslations } from 'next-intl'
import { Profile } from '@/types/types'
import { getConcertName } from '@/lib/getConcertName'
import { useFestivalRoot } from '@/hooks/concerts/useFestivalRoot'

type State = TablesInsert<'bands'> | TablesUpdate<'bands'> | null

const ConcertContributionItem = ({
  contribution,
  profile,
}: {
  contribution: Tables<'contributions'>
  profile: Profile
}) => {
  const { operation, ressource_id } = contribution
  const { data: concert } = useConcert(ressource_id, null, { bandsSize: 1 })
  const t = useTranslations('ContributionItem')
  const locale = useLocale()
  const concertName = getConcertName(concert, locale)

  return (
    <ContributionItemWrapper contribution={contribution}>
      {t.rich('userContributedToConcert', {
        user: () => (
          <Link href={`/users/${profile.username}`} className="text-white hover:underline">
            {profile.username}
          </Link>
        ),
        operation,
        concert: () => (
          <Link href={`/concerts/${ressource_id}`} className="text-white hover:underline">
            {concertName || `ID: ${ressource_id}`}
          </Link>
        ),
      })}
    </ContributionItemWrapper>
  )
}

const BandContributionItem = ({
  contribution,
  profile,
}: {
  contribution: Tables<'contributions'>
  profile: Profile
}) => {
  const { operation, ressource_id } = contribution
  const { data: band } = useBand(ressource_id)
  const t = useTranslations('ContributionItem')

  return (
    <ContributionItemWrapper contribution={contribution}>
      {t.rich('userContributedToBand', {
        user: () => (
          <Link href={`/users/${profile.username}`} className="text-white hover:underline">
            {profile.username}
          </Link>
        ),
        operation,
        band: () => (
          <Link href={`/bands/${ressource_id}`} className="text-white hover:underline">
            {band?.name || `ID: ${ressource_id}`}
          </Link>
        ),
      })}
    </ContributionItemWrapper>
  )
}

const LocationContributionItem = ({
  contribution,
  profile,
}: {
  contribution: Tables<'contributions'>
  profile: Profile
}) => {
  const { operation, ressource_id } = contribution
  const { data: location } = useLocation(ressource_id)
  const t = useTranslations('ContributionItem')

  return (
    <ContributionItemWrapper contribution={contribution}>
      {t.rich('userContributedToLocation', {
        user: () => (
          <Link href={`/users/${profile.username}`} className="text-white hover:underline">
            {profile.username}
          </Link>
        ),
        operation,
        location: () => (
          <Link href={`/locations/${ressource_id}`} className="text-white hover:underline">
            {location?.name || `ID: ${ressource_id}`}
          </Link>
        ),
      })}
    </ContributionItemWrapper>
  )
}

const FestivalRootContributionItem = ({
  contribution,
  profile,
}: {
  contribution: Tables<'contributions'>
  profile: Profile
}) => {
  const { operation, ressource_id } = contribution
  const { data: festivalRoot } = useFestivalRoot(ressource_id!)
  const t = useTranslations('ContributionItem')

  return (
    <ContributionItemWrapper contribution={contribution}>
      {t.rich('userContributedToFestivalRoot', {
        user: () => (
          <Link href={`/users/${profile.username}`} className="text-white hover:underline">
            {profile.username}
          </Link>
        ),
        operation,
        festivalRoot: () => (
          <span className="text-white">{festivalRoot?.name || `ID: ${ressource_id}`}</span>
        ),
      })}
    </ContributionItemWrapper>
  )
}

const ConcertBandContributionItem = ({
  contribution,
  bandIds,
  profile,
}: {
  contribution: Tables<'contributions'>
  bandIds: Tables<'bands'>['id'][] | undefined
  profile: Profile
}) => {
  const { operation, ressource_id } = contribution
  const { data: concert } = useConcert(ressource_id, null, { bandsSize: 1 })
  const { data: bands } = useBands({ ids: bandIds })
  const t = useTranslations('ContributionItem')
  const locale = useLocale()
  const concertName = getConcertName(concert, locale)

  return (
    <ContributionItemWrapper contribution={contribution}>
      {t.rich('userContributedToConcertBands', {
        user: () => (
          <Link href={`/users/${profile.username}`} className="text-white hover:underline">
            {profile.username}
          </Link>
        ),
        operation,
        bands: () => (
          <CommaSeperatedList>
            {bands?.data.map(band => (
              <Link key={band.id} href={`/bands/${band.id}`} className="text-white hover:underline">
                {band.name || `ID: ${band.id}`}
              </Link>
            ))}
          </CommaSeperatedList>
        ),
        concert: () => (
          <Link href={`/concerts/${concert?.id}`} className="text-white hover:underline">
            {concertName || `ID: ${ressource_id}`}
          </Link>
        ),
      })}
    </ContributionItemWrapper>
  )
}

const BandGenreContributionItem = ({
  contribution,
  genreIds,
  profile,
}: {
  contribution: Tables<'contributions'>
  genreIds: Tables<'genres'>['id'][] | undefined
  profile: Profile
}) => {
  const { operation, ressource_id } = contribution
  const { data: band } = useBand(ressource_id, null)
  const { data: genres } = useGenres({ ids: genreIds ?? [] })
  const t = useTranslations('ContributionItem')

  return (
    <ContributionItemWrapper contribution={contribution}>
      {t.rich('userContributedToBandGenres', {
        user: () => (
          <Link href={`/users/${profile.username}`} className="text-white hover:underline">
            {profile.username}
          </Link>
        ),
        operation,
        genres: () => (
          <CommaSeperatedList>
            {genres?.map(genre => (
              <span key={genre.id} className="text-white">
                {genre.name || `ID: ${genre.id}`}
              </span>
            ))}
          </CommaSeperatedList>
        ),
        band: () => (
          <Link href={`/bands/${band?.id}`} className="text-white hover:underline">
            {band?.name || `ID: ${ressource_id}`}
          </Link>
        ),
      })}
    </ContributionItemWrapper>
  )
}

const ContributionItemWrapper = ({
  contribution,
  children,
}: {
  contribution: Tables<'contributions'>
  children?: ReactNode
}) => {
  const { operation, timestamp, state_old, state_new } = contribution
  const locale = useLocale()

  function findChanges(oldState: State, newState: State) {
    if (!oldState || !newState) {
      return null
    }

    const changes: { key: string; old: unknown; new: unknown }[] = []

    Object.entries(oldState).forEach(([key, value]) => {
      if (newState[key as keyof State] !== value) {
        changes.push({ key, old: oldState[key as keyof State], new: newState[key as keyof State] })
      }
    })

    return changes
  }

  const changes = operation === 'UPDATE' && findChanges(state_old as State, state_new as State)

  return (
    <div className="rounded-lg bg-slate-800 p-4">
      <div className="flex gap-4 md:flex-row md:items-center">
        <div
          className={clsx(
            'grid size-10 flex-none place-content-center rounded',
            (operation === 'INSERT' || operation === 'RESTORE') && 'bg-venom/10 text-venom',
            operation === 'UPDATE' && 'bg-blue/10 text-blue',
            (operation === 'DELETE' || operation === 'ARCHIVE') && 'bg-red/10 text-red'
          )}
        >
          {operation === 'INSERT' && <PlusIcon className="size-icon" />}
          {operation === 'UPDATE' && <PenIcon className="size-icon" />}
          {operation === 'DELETE' && <TrashIcon className="size-icon" />}
          {operation === 'ARCHIVE' && <ArchiveIcon className="size-icon" />}
          {operation === 'RESTORE' && <ArchiveRestoreIcon className="size-icon" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-1 text-sm text-slate-300">{children}</div>
        <span className="whitespace-nowrap text-sm text-slate-300 md:ml-auto">
          {getRelativeTime(timestamp, locale)}
        </span>
      </div>
      {changes && changes.length > 0 && (
        <div className="mt-2 rounded border border-slate-700 p-2 text-sm">
          {changes.map(change => (
            <div key={change.key} className="flex flex-wrap items-center gap-1">
              <code>{change.key}:</code>
              <code className="rounded bg-red/10 px-1 text-red">{JSON.stringify(change.old)}</code>
              <ArrowRight className="size-icon text-slate-300" />
              <code className="rounded bg-venom/10 px-1 text-venom">
                {JSON.stringify(change.new)}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const ContributionItem = ({
  contribution,
  bandIds,
  genreIds,
}: {
  contribution: Tables<'contributions'>
  bandIds?: Tables<'bands'>['id'][]
  genreIds?: Tables<'genres'>['id'][]
}) => {
  const { user_id } = contribution
  const { data: profile } = useProfile(user_id)

  if (!profile) {
    return null
  }

  if (contribution.ressource_type === 'concerts') {
    return <ConcertContributionItem contribution={contribution} profile={profile} />
  } else if (contribution.ressource_type === 'bands') {
    return <BandContributionItem contribution={contribution} profile={profile} />
  } else if (contribution.ressource_type === 'locations') {
    return <LocationContributionItem contribution={contribution} profile={profile} />
  } else if (contribution.ressource_type === 'festival_roots') {
    return <FestivalRootContributionItem contribution={contribution} profile={profile} />
  } else if (contribution.ressource_type === 'j_concert_bands') {
    return (
      <ConcertBandContributionItem
        contribution={contribution}
        profile={profile}
        bandIds={bandIds}
      />
    )
  } else if (contribution.ressource_type === 'j_band_genres') {
    return (
      <BandGenreContributionItem
        contribution={contribution}
        profile={profile}
        genreIds={genreIds}
      />
    )
  } else {
    return <p>Contribution with unknown ressource type</p>
  }
}
