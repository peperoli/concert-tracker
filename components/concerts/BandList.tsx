import { useEffect, useState } from 'react'
import { Band, BandSeen } from '../../types/types'
import { useQueryClient } from '@tanstack/react-query'
import { useAddBandsSeen } from '../../hooks/bands/useAddBandsSeen'
import { useDeleteBandsSeen } from '../../hooks/bands/useDeleteBandsSeen'
import { BandSeenToggle } from './BandSeenToggle'
import { useSession } from '../../hooks/auth/useSession'
import Link from 'next/link'
import { Button } from '../Button'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import { Edit, Lightbulb, Plus, X } from 'lucide-react'

type BandListProps = {
  bands: Band[]
  bandsSeen?: BandSeen[]
  concertId: string
}

export function BandList({ bands, bandsSeen, concertId }: BandListProps) {
  const [editing, setEditing] = useState(false)
  const [selectedBandsSeen, setSelectedBandsSeen] = useState<BandSeen[]>(bandsSeen ?? [])
  const [hideBandsSeenHint, setHideBandsSeenHint] = useState(
    Cookies.get('hideBandsSeenHint') ?? null
  )
  const { data: session } = useSession()
  const addBandsSeen = useAddBandsSeen()
  const deleteBandsSeen = useDeleteBandsSeen()
  const isPending = addBandsSeen.isPending || deleteBandsSeen.isPending
  const isSuccess = addBandsSeen.isSuccess && deleteBandsSeen.isSuccess
  const queryClient = useQueryClient()
  const { push } = useRouter()
  const pathname = usePathname()
  const hasBandsSeen = bandsSeen && bandsSeen.length > 0
  const bandsSeenIds = bandsSeen?.map(bandSeen => bandSeen.band_id)
  const selectedBandsSeenIds = selectedBandsSeen.map(bandSeen => bandSeen.band_id)
  const bandsToAdd = selectedBandsSeen.filter(item => !bandsSeenIds?.includes(item.band_id))
  const bandsToDelete = bandsSeen?.filter(item => !selectedBandsSeenIds.includes(item.band_id))

  async function updateBandsSeen() {
    addBandsSeen.mutate(bandsToAdd)
    deleteBandsSeen.mutate(bandsToDelete ?? [])
  }

  useEffect(() => {
    setSelectedBandsSeen(bandsSeen ?? [])
  }, [editing])

  useEffect(() => {
    if (isSuccess) {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['concert', concertId] })
    }
  }, [addBandsSeen.status, deleteBandsSeen.status])
  return (
    <section>
      {editing ? (
        <>
          {!hideBandsSeenHint && (
            <div className="mb-4 flex w-full gap-3 rounded-lg bg-slate-700 p-4">
              <Lightbulb className="size-icon flex-none text-yellow" />
              <p>Markiere Bands, die du an diesem Konzert erlebt hast.</p>
              <button
                onClick={() => {
                  setHideBandsSeenHint('yes')
                  Cookies.set('hideBandsSeenHint', 'yes', { expires: 365, sameSite: 'strict' })
                }}
                aria-label="Hinweis verbergen"
                className="ml-auto grid h-6 w-6 flex-none place-content-center rounded-md hover:bg-slate-600"
              >
                <X className="size-icon" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {bands &&
              bands.map(band => (
                <BandSeenToggle
                  key={band.id}
                  user={session?.user || null}
                  band={band}
                  selectedBandsSeen={selectedBandsSeen}
                  setSelectedBandsSeen={setSelectedBandsSeen}
                />
              ))}
          </div>
        </>
      ) : (
        <ul className="flex flex-wrap gap-x-2 gap-y-1">
          {bands &&
            bands.map((band, index) => (
              <li role="presentation" className="flex gap-2" key={band.id}>
                <Link
                  href={`/bands/${band.id}`}
                  className={clsx(
                    'font-bold hover:underline',
                    bandsSeen?.find(bandSeen => band.id === bandSeen.band_id) && 'text-venom'
                  )}
                >
                  {band.name}
                </Link>
                {index + 1 !== bands?.length ? (
                  <span className="text-slate-300">&bull;</span>
                ) : null}
              </li>
            ))}
        </ul>
      )}
      <div className="mt-6 flex gap-4">
        {editing ? (
          <>
            <Button
              onClick={updateBandsSeen}
              label="Speichern"
              appearance="primary"
              loading={isPending}
            />
            <Button onClick={() => setEditing(false)} label="Abbrechen" />
          </>
        ) : (
          <Button
            onClick={session ? () => setEditing(true) : () => push(`/signup?redirect=${pathname}`)}
            label="Ich war dabei!"
            icon={hasBandsSeen ? <Edit className="size-icon" /> : <Plus className="size-icon" />}
            appearance={hasBandsSeen ? 'secondary' : 'primary'}
            size={hasBandsSeen ? 'small' : 'medium'}
          />
        )}
      </div>
    </section>
  )
}
