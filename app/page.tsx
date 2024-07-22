import { HomePage } from '../components/concerts/HomePage'
import { Concert } from '../types/types'
import { cookies } from 'next/headers'
import { createClient } from '../utils/supabase/server'

async function fetchData() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, count, error } = await supabase
    .from('concerts_full')
    .select('*, bands:j_concert_bands(*, ...bands(*, genres(*)))', { count: 'estimated' })
    .range(0, 24)
    .order('date_start', { ascending: false })
    .order('item_index', { referencedTable: 'j_concert_bands', ascending: true })
    .returns<Concert[]>()

  if (error) {
    throw error
  }

  return { data, count } as { data: Concert[]; count: number | null }
}

export default async function Page() {
  const concerts = await fetchData()
  return <HomePage concerts={concerts} />
}
