import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useBands } from '../../hooks/useBands'
import { useConcerts } from '../../hooks/useConcerts'
import { useLocations } from '../../hooks/useLocations'
import { AddConcert, EditConcert } from '../../types/types'
import { AddBandForm } from '../bands/AddBandForm'
import { Button } from '../Button'
import { CheckBox } from '../forms/CheckBox'
import { Select } from '../forms/Select'
import { TextField } from '../forms/TextField'
import { MultiSelect } from '../MultiSelect'

interface FormProps {
  defaultValues?: EditConcert
  onSubmit: SubmitHandler<AddConcert> | SubmitHandler<EditConcert>
  status: 'idle' | 'loading' | 'error' | 'success'
  close: () => void
}

export const Form = ({ defaultValues, onSubmit, status, close }: FormProps) => {
  const today = new Date().toISOString().split('T')[0]
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<AddConcert>({
    defaultValues: defaultValues ?? { date_start: today },
  })
  const { data: concerts } = useConcerts()
  const { data: bands } = useBands()
  const { data: locations } = useLocations()
  const [isAddBandFormOpen, setIsAddBandFormOpen] = useState(false)

  const similarConcerts = concerts?.data
    .filter(item => item.date_start === watch('date_start'))
    .filter(item =>
      item.bands?.find(band => watch('bands')?.find(selectedBand => band.id === selectedBand.id))
    )
    .filter(item => item.location?.id === Number(watch('location_id')))
  const isSimilar = !defaultValues && similarConcerts && similarConcerts.length > 0
  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <TextField {...register('name')} label="Name (optional)" placeholder="Greenfield" />
      <CheckBox {...register('is_festival')} label="Festival" />
      <div className="flex gap-4">
        <TextField
          {...register('date_start', { required: true })}
          error={errors.date_start}
          type="date"
          label={watch('is_festival') ? 'Startdatum' : 'Datum'}
        />
        {watch('is_festival') && (
          <TextField
            {...register('date_end', { required: true })}
            error={errors.date_end}
            type="date"
            label="Enddatum"
          />
        )}
      </div>
      {bands?.data && (
        <Controller
          name="bands"
          control={control}
          render={({ field: { value = [], onChange } }) => (
            <MultiSelect
              name="bands"
              options={bands.data}
              selectedOptions={value}
              setSelectedOptions={onChange}
              noResultsMessage={
                <>
                  Keine Band mit diesem Namen gefunden.
                  <button onClick={() =>  setIsAddBandFormOpen(true)} className="font-bold text-venom hover:underline">Band hinzufügen</button>
                </>
              }
            />
          )}
        />
      )}
      {locations && (
        <Select
          {...register('location_id', { required: true })}
          options={locations.data?.map(item => ({ id: item.id, name: item.name }))}
          error={errors.location_id}
          label="Location"
        />
      )}
      {isSimilar && (
        <div className="p-4 rounded-lg bg-yellow/10">
          <div className="flex items-center gap-4 text-yellow">
            <ExclamationTriangleIcon className="flex-none h-icon" />
            <p>
              <strong>Achtung:</strong>{' '}
              {similarConcerts.length === 1 ? 'Ein Konzert' : 'Folgende Konzerte'} mit ähnlichen
              Eigenschaften {similarConcerts.length === 1 ? 'existiert' : 'existieren'} bereits:
            </p>
          </div>
          <div className="grid gap-2 mt-4">
            {similarConcerts.map(item => (
              <Link
                key={item.id}
                href={`/concerts/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 rounded-md bg-slate-800 shadow-lg hover:bg-slate-750"
              >
                <div>{new Date(item.date_start).toLocaleDateString('de-CH')}</div>
                <div className="font-bold">
                  {item.bands
                    ?.slice(0, 10)
                    .map(band => band.name)
                    .join(', ')}
                </div>
                <div>@ {item.location?.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="sticky md:static bottom-0 flex md:justify-end gap-4 [&>*]:flex-1 py-4 md:pb-0 bg-slate-800 z-10">
        <Button onClick={close} label="Abbrechen" />
        <Button type="submit" label="Speichern" style="primary" loading={status === 'loading'} />
      </div>
    </form>
    <AddBandForm isOpen={isAddBandFormOpen} setIsOpen={setIsAddBandFormOpen} />
    </>
  )
}
