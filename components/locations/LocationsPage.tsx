'use client'

import { PageWrapper } from '../layout/PageWrapper'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Table } from '../Table'
import { TableRow } from '../TableRow'
import { AddLocationForm } from './AddLocationForm'
import { useState } from 'react'
import { Search } from '../Search'
import { Button } from '../Button'
import useMediaQuery from '../../hooks/useMediaQuery'
import { ExtendedRes, Location } from '../../types/types'
import { useLocations } from '../../hooks/useLocations'
import { useDebounce } from '../../hooks/useDebounce'
import { Pagination } from '../layout/Pagination'

interface LocationsPageProps {
  initialLocations: ExtendedRes<Location[]>
}

export const LocationsPage = ({ initialLocations }: LocationsPageProps) => {
  const [query, setQuery] = useState('')
  const debounceQuery = useDebounce(query, 200)
  const perPage = 25
  const [currentPage, setCurrentPage] = useState(0)
  const { data: locations } = useLocations(initialLocations, {
    filter: { search: debounceQuery },
    page: currentPage,
    size: perPage,
  })
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      <PageWrapper>
        <main className="p-4 md:p-8 w-full">
          {!isDesktop && (
            <div className="fixed bottom-0 right-0 m-4">
              <Button
                onClick={() => setIsOpen(true)}
                label="Location hinzufügen"
                style="primary"
                contentType="icon"
                icon={<PlusIcon className="h-icon" />}
              />
            </div>
          )}
          <div className="sr-only md:not-sr-only flex justify-between md:mb-6">
            <h1 className="mb-0">Locations</h1>
            {isDesktop && (
              <Button
                onClick={() => setIsOpen(true)}
                label="Location hinzufügen"
                style="primary"
                icon={<PlusIcon className="h-icon" />}
              />
            )}
          </div>
          <Table>
            <Search
              name="searchLocations"
              placeholder="Locations"
              query={query}
              setQuery={setQuery}
            />
            <div className="my-4 text-sm text-slate-300">
              {locations?.count}&nbsp;{locations?.count === 1 ? 'Eintrag' : 'Einträge'}
            </div>
            {locations?.count === 0 ? (
              <div>Blyat! Keine Einträge gefunden.</div>
            ) : (
              locations?.data.map(location => (
                <TableRow key={location.id} href="">
                  <div className="md:flex items-center gap-4 w-full">
                    <div className="md:w-1/2 font-bold">{location.name}</div>
                    <div className="md:w-1/2 text-slate-300">{location.city}</div>
                  </div>
                </TableRow>
              ))
            )}
            <Pagination
              entriesCount={locations?.count ?? 0}
              perPage={perPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Table>
        </main>
      </PageWrapper>
      <AddLocationForm
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  )
}
