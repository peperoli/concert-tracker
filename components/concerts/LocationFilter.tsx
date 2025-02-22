import { useEffect, useState } from 'react'
import { FilterButton } from './../FilterButton'
import { useLocations } from './../../hooks/locations/useLocations'
import { Select } from '../forms/Select'
import { useTranslations } from 'next-intl'

type LocationMultiSelectProps = {
  values: number[]
  onValuesChange: (value: number[]) => void
}

const LocationMultiSelect = ({ ...props }: LocationMultiSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: locations, isPending } = useLocations({ search: searchQuery })
  return (
    <Select
      name="location"
      items={locations?.data.map(item => ({ id: item.id, name: `${item.name}, ${item.city}` }))}
      searchable
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isLoading={isPending}
      multiple
      fixedHeight
      {...props}
    />
  )
}

type LocationFilterProps = {
  values: number[] | null
  onSubmit: (value: number[]) => void
}

export const LocationFilter = ({ values: submittedValues, onSubmit }: LocationFilterProps) => {
  const { data: locations } = useLocations({ ids: submittedValues })
  const [selectedIds, setSelectedIds] = useState(submittedValues ?? [])
  const t = useTranslations('LocationFilter')

  useEffect(() => {
    setSelectedIds(submittedValues ?? [])
  }, [submittedValues])
  return (
    <FilterButton
      label={t('location')}
      items={locations?.data}
      selectedIds={selectedIds}
      submittedValues={submittedValues}
      onSubmit={onSubmit}
    >
      <LocationMultiSelect values={selectedIds} onValuesChange={setSelectedIds} />
    </FilterButton>
  )
}
