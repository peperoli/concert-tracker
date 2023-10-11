import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation } from '@tanstack/react-query'

const deleteBand = async (bandId: number) => {
  const supabase = createClientComponentClient()

  const { error: genresError } = await supabase.from('j_band_genres').delete().eq('band_id', bandId)

  if (genresError) {
    throw genresError
  }

  const { error: bandError } = await supabase.from('bands').delete().eq('id', bandId)

  if (bandError) {
    throw bandError
  }
}

export const useDeleteBand = () => {
  return useMutation(deleteBand, { onError: error => console.error(error) })
}
