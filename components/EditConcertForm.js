import BandCheckbox from "./BandCheckbox"
import { useState } from "react"
import supabase from "../utils/supabase"
import Button from "./Button"
import MultiSelect from "./MultiSelect"

export default function EditConcertForm({ concert, bands, locations, setIsOpen }) {
  const [selectedConcertBands, setSelectedConcertBands] = useState(
    concert.band_ids?.map(bandId => bands.find(band => band.id === bandId)) || []
  )
  const [isFestival, setIsFestival] = useState(concert.is_festival)

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const { data, error } = await supabase
        .from('concerts')
        .update({
          date_start: event.target.dateStart.value,
          date_end: event.target.dateEnd?.value,
          description: event.target.description.value,
          band_ids: selectedConcertBands.map(item => item.id),
          location: event.target.location.value,
          name: event.target.name.value,
          is_festival: isFestival,
        })
        .eq('id', concert.id)

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    }

    setIsOpen(false)
  }
  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="form-control">
        <input type="text" name="name" id="name" placeholder="Wacken Open Air" defaultValue={concert.name} />
        <label htmlFor="name">Name (optional)</label>
      </div>
      <div className="form-control">
        <label>
          <input type="checkbox" name="isFestival" value="isFestival" checked={isFestival} onChange={() => setIsFestival(!isFestival)} />
          <span>Festival</span>
        </label>
      </div>
      <div className="flex gap-4">
        <div className="form-control">
          <input type="date" name="dateStart" id="dateStart" defaultValue={concert.date_start} />
          <label htmlFor="dateStart">{isFestival ? 'Startdatum' : 'Datum'}</label>
        </div>
        {isFestival && (
          <div className="form-control">
            <input type="date" name="dateEnd" id="dateEnd" defaultValue={concert.date_end} />
            <label htmlFor="dateEnd">Enddatum</label>
          </div>
        )}
      </div>
      <div className="form-control">
        <select name="location" id="location" defaultValue={concert.location}>
          <option value={null}>Bitte wählen ...</option>
          {locations && locations.map(location => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>
        <label htmlFor="location">Location</label>
      </div>
      <MultiSelect
        name="bands"
        options={bands}
        selectedOptions={selectedConcertBands}
        setSelectedOptions={setSelectedConcertBands}
      />
      <div className="form-control">
        <textarea name="description" id="description" defaultValue={concert.description} />
        <label htmlFor="description">Beschreibung</label>
      </div>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setIsOpen(false)} label="Abbrechen" />
        <button type="submit" className="btn btn-primary">Speichern</button>
      </div>
    </form>
  )
}