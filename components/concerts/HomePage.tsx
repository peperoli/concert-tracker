'use client'

import { useEffect, useState } from 'react'
import { Button } from '../Button'
import { PlusIcon } from 'lucide-react'
import { Concert, ExtendedRes } from '../../types/types'
import { useConcerts } from '../../hooks/concerts/useConcerts'
import { ConcertCard } from './ConcertCard'
import { BandFilter } from './BandFilter'
import { LocationFilter } from './LocationFilter'
import { YearsFilter } from './YearsFilter'
import { FestivalRootFilter } from './FestivalRootFilter'
import Cookies from 'js-cookie'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SegmentedControl } from '../controls/SegmentedControl'
import { useProfile } from '../../hooks/profiles/useProfile'
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from 'nuqs'
import { BookUser, Globe, RotateCcw, UserIcon } from 'lucide-react'
import { useFriends } from '@/hooks/profiles/useFriends'
import { Select } from '../forms/Select'
import { FilterButton } from '../FilterButton'
import useMediaQuery from '@/hooks/helpers/useMediaQuery'
import { modalPaths } from '../shared/ModalProvider'
import { SpeedDial } from '../layout/SpeedDial'
import { useTranslations } from 'next-intl'
import { User } from '@supabase/supabase-js'

type HomePageProps = {
  concerts: ExtendedRes<Concert[]>
  currentUser: User | null
  view: string | undefined
}

export const HomePage = ({
  concerts: initialConcerts,
  currentUser,
  view: initialView = 'global',
}: HomePageProps) => {
  const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(25))
  const [selectedBands, setSelectedBands] = useQueryState('bands', parseAsArrayOf(parseAsInteger))
  const [selectedLocations, setSelectedLocations] = useQueryState(
    'locations',
    parseAsArrayOf(parseAsInteger)
  )
  const [selectedYears, setSelectedYears] = useQueryState('years', parseAsArrayOf(parseAsInteger))
  const [selectedFestivalRoots, setSelectedFestivalRoots] = useQueryState(
    'festivals',
    parseAsArrayOf(parseAsInteger)
  )
  const [user] = useQueryState('user')
  const { data: profile } = useProfile(null, user)
  const selectedUserId = user && profile?.id
  const [view, setView] = useState(initialView)
  const { data: friends } = useFriends({ profileId: currentUser?.id, pending: false })
  const sortBy = ['date_start', 'bands_count'] as const
  const [sort, setSort] = useQueryStates({
    sort_by: parseAsStringLiteral(sortBy).withDefault('date_start'),
    sort_asc: parseAsBoolean.withDefault(false),
  })
  const [_, setModal] = useQueryState('modal', parseAsStringLiteral(modalPaths))

  function getView() {
    if (view === 'user' && currentUser) return [currentUser.id]
    if (view === 'friends' && friends)
      return [
        ...new Set([
          ...friends?.map(item => item.sender_id),
          ...friends?.map(item => item.receiver_id),
        ]),
      ]
  }

  const { data: concerts, isFetching } = useConcerts({
    placeholderData: initialConcerts,
    bands: selectedBands,
    locations: selectedLocations,
    years: selectedYears,
    festivalRoots: selectedFestivalRoots,
    bandsSeenUsers: selectedUserId ? [selectedUserId] : getView(),
    sort,
    size,
  })
  const { push } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const t = useTranslations('HomePage')
  const queryStateString = searchParams.toString()
  const sortItems = [
    { id: 0, value: 'date_start,false', name: t('newest') },
    { id: 1, value: 'date_start,true', name: t('oldest') },
    { id: 2, value: 'bands_count,false', name: t('mostBands') },
    { id: 3, value: 'bands_count,true', name: t('fewestBands') },
  ]

  useEffect(() => {
    if (queryStateString) {
      Cookies.set('concertQueryState', '?' + queryStateString, { sameSite: 'strict' })
    }
  }, [queryStateString])

  function handleView(value: string) {
    setView(value)
    Cookies.set('view', value, { expires: 365, sameSite: 'strict' })
  }

  function resetAll() {
    push(pathname, { scroll: false })
  }
  return (
    <main className="container">
      <div className="mb-6 hidden items-center justify-between md:flex">
        <h1 className="mb-0">{t('concerts')}</h1>
        <Button
          onClick={
            currentUser ? () => setModal('add-concert') : () => push(`/login?redirect=${pathname}`)
          }
          label={t('addConcert')}
          appearance="primary"
          icon={<PlusIcon className="size-icon" />}
          className="hidden md:block"
        />
      </div>
      <section className="-mx-4 mb-4 grid gap-4 bg-radial-gradient from-blue/20 p-5 md:mx-auto md:rounded-2xl">
        <div className="scrollbar-hidden -mx-4 flex gap-2 overflow-x-auto px-4 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible">
          <BandFilter values={selectedBands} onSubmit={setSelectedBands} />
          <LocationFilter values={selectedLocations} onSubmit={setSelectedLocations} />
          <YearsFilter values={selectedYears} onSubmit={setSelectedYears} />
          <FestivalRootFilter values={selectedFestivalRoots} onSubmit={setSelectedFestivalRoots} />
        </div>
        <div className="flex items-center gap-4">
          <div className="my-1.5 text-sm text-slate-300">
            {t('nEntries', { count: concerts?.count })}
          </div>
          {(selectedBands ||
            selectedLocations ||
            selectedYears ||
            selectedFestivalRoots ||
            selectedUserId) && (
            <Button
              label={t('reset')}
              onClick={resetAll}
              icon={<RotateCcw className="size-icon" />}
              contentType={isDesktop ? 'text' : 'icon'}
              size="small"
              appearance="tertiary"
            />
          )}
          <div className="ml-auto">
            <FilterButton
              label={t('sortBy')}
              items={sortItems}
              type="singleselect"
              size="sm"
              appearance="tertiary"
              selectedId={sortItems.findIndex(
                item => item.value === `${sort.sort_by},${sort.sort_asc}`
              )}
            >
              <Select
                name="sort"
                items={sortItems}
                value={sortItems.findIndex(
                  item => item.value === `${sort.sort_by},${sort.sort_asc}`
                )}
                onValueChange={value =>
                  setSort({
                    sort_by: sortItems[value].value.split(',')[0] as 'date_start',
                    sort_asc: sortItems[value].value.split(',')[1] === 'true',
                  })
                }
                searchable={false}
              />
            </FilterButton>
          </div>
        </div>
        {currentUser && (
          <SegmentedControl
            options={[
              { value: 'global', label: t('all'), icon: Globe },
              { value: 'friends', label: t('friends'), icon: BookUser },
              { value: 'user', label: t('you'), icon: UserIcon },
            ]}
            value={view}
            onValueChange={handleView}
          />
        )}
      </section>
      <div className="grid gap-4">
        {concerts?.data.map(concert => <ConcertCard concert={concert} key={concert.id} />)}
      </div>
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sm text-slate-300">
          {t('nOfNEntries', { count: concerts?.data.length, total: concerts?.count })}
        </p>
        {concerts?.data.length !== concerts?.count && (
          <Button
            label="Mehr anzeigen"
            onClick={() => setSize(prev => prev + 25)}
            loading={isFetching}
            appearance="primary"
          />
        )}
      </div>
      <SpeedDial />
    </main>
  )
}
