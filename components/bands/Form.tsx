import { useBands } from '../../hooks/useBands'
import { AddBand, EditBand } from '../../types/types'
import { Button } from '../Button'
import { MultiSelect } from '../MultiSelect'
import { SpotifyArtistSelect } from './SpotifyArtistSelect'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { TextField } from '../forms/TextField'
import { Select } from '../forms/Select'
import { useCountries } from '../../hooks/useCountries'
import { useGenres } from '../../hooks/useGenres'

interface FormProps {
  defaultValues?: EditBand
  onSubmit: SubmitHandler<AddBand> | SubmitHandler<EditBand>
  status: 'idle' | 'loading' | 'error' | 'success'
  close: () => void
}

export const Form = ({ defaultValues, onSubmit, status, close }: FormProps) => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { dirtyFields, errors },
  } = useForm<AddBand>({ defaultValues: defaultValues })
  const { data: bands } = useBands()
  const { data: countries } = useCountries()
  const { data: genres } = useGenres()
  const regExp = new RegExp(watch('name'), 'i')
  const similarBands =
    bands?.data.filter(item =>
      item.name
        ?.normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .match(regExp)
    ) || []
  const isSimilar = !defaultValues && dirtyFields.name && watch('name')?.length >= 3 && similarBands.length > 0
  const regionNames = new Intl.DisplayNames(['de'], { type: 'region' })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <TextField
        {...register('name', { required: true })}
        error={errors.name}
        label="Name"
        placeholder="Beatles"
      />
      {isSimilar && (
        <div className="mt-2">
          <p className="text-red">Vorsicht, diese Band könnte schon vorhanden sein:</p>
          <ul className="list-disc list-inside text-slate-300">
            {similarBands.map(band => (
              <li key={band.id}>{band.name}</li>
            ))}
          </ul>
        </div>
      )}
      {countries && (
        <Select
          {...register('country_id', { required: true })}
          options={countries.map(item => ({ id: item.id, name: regionNames.of(item.iso2) ?? 'FEHLER' })) ?? []}
          error={errors.country_id}
          label="Land"
        />
      )}
      {genres && (
        <Controller
          name="genres"
          control={control}
          render={({ field: { value = [], onChange } }) => (
            <MultiSelect
              name="genres"
              options={genres}
              selectedOptions={value}
              setSelectedOptions={onChange}
            />
          )}
        />
      )}
      <Controller
        name="spotify_artist_id"
        control={control}
        render={({ field: { value = null, onChange } }) => (
          <SpotifyArtistSelect bandName={watch('name')} value={value} onChange={onChange} />
        )}
      />
      <div className="sticky md:static bottom-0 flex md:justify-end gap-4 [&>*]:flex-1 py-4 md:pb-0 bg-slate-800 z-10 md:z-0">
        <Button onClick={close} label="Abbrechen" />
        <Button type="submit" label="Speichern" style="primary" loading={status === 'loading'} />
      </div>
    </form>
  )
}
