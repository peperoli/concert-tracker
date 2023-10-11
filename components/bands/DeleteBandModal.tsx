import { PostgrestError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useDeleteBand } from '../../hooks/useDeleteBand'
import { Band } from '../../types/types'
import { Button } from '../Button'
import { StatusBanner } from '../forms/StatusBanner'
import Modal from '../Modal'

interface DeleteBandModalProps {
  band: Band
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const DeleteBandModal = ({ band, isOpen, setIsOpen }: DeleteBandModalProps) => {
  const deleteBand = useDeleteBand()
  const error = deleteBand.error as PostgrestError | null
  const router = useRouter()

  useEffect(() => {
    if (deleteBand.status === 'success') {
      router.push('/bands')
    }
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <h2 className="mb-0">Band löschen</h2>
        <p>
          Willst du{' '}
          <strong>
            {band.name} ({band.country?.iso2})
          </strong>{' '}
          wirklich unwiderruflich löschen?
        </p>
        {deleteBand.status === 'error' && (
          <StatusBanner statusType='error' message={error?.message ?? 'Unbekannter Fehler aufgetreten.'} />
        )}
        <div className="flex md:justify-end gap-4 [&>*]:flex-1">
          <Button label="Abbrechen" onClick={() => setIsOpen(false)} />
          <Button
            label="Löschen"
            onClick={() => deleteBand.mutate(band.id)}
            style="primary"
            danger
            loading={deleteBand.status === 'loading'}
          />
        </div>
      </div>
    </Modal>
  )
}
