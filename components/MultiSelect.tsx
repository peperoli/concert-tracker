import { ArrowsUpDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useState, useRef, Dispatch, RefObject, SetStateAction } from 'react'
import { ListItem, Option } from '../types/types'
import { Button } from './Button'
import { SpinnerIcon } from './layout/SpinnerIcon'
import { ReorderableList } from './forms/ReorderableList'

interface SelectedOptionProps {
  selectedOption: number
  options?: ListItem[]
  selectedOptions: number[]
  setSelectedOptions: (value: number[]) => void
}

const SelectedOption = ({
  selectedOption,
  options,
  selectedOptions,
  setSelectedOptions,
}: SelectedOptionProps) => {
  function handleClick() {
    setSelectedOptions(selectedOptions.filter(item => item !== selectedOption))
  }
  return (
    <Button
      label={options?.find(item => item.id === selectedOption)?.name ?? ''}
      onClick={handleClick}
      icon={<XMarkIcon className="h-icon" />}
      style="tag"
    />
  )
}

interface MultiSelectOptionProps {
  option: ListItem
  selectedOptions: number[]
  setSelectedOptions: (event: number[]) => void
  setQuery: Dispatch<SetStateAction<string>>
  searchRef: RefObject<HTMLInputElement>
}

const MultiSelectOption = ({
  option,
  selectedOptions,
  setSelectedOptions,
  setQuery,
  searchRef,
}: MultiSelectOptionProps) => {
  const isSelected = selectedOptions.some(item => item === option.id)

  function handleChange() {
    if (selectedOptions.some(item => item === option.id)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option.id))
    } else {
      setSelectedOptions([...selectedOptions, option.id])
    }
    setQuery('')
    searchRef.current?.focus()
  }

  return (
    <label className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-slate-600">
      <input type="checkbox" checked={isSelected} onChange={handleChange} className="flex-none" />
      {option.name}
    </label>
  )
}

interface MultiSelectProps {
  name: string
  options?: ListItem[]
  isLoading?: boolean
  selectedOptions: number[]
  setSelectedOptions: (event: number[]) => void
  reorderable?: boolean
  alwaysOpen?: boolean
  fullHeight?: boolean
}

export const MultiSelect = ({
  name,
  options,
  isLoading,
  selectedOptions,
  setSelectedOptions,
  reorderable,
  alwaysOpen,
  fullHeight,
}: MultiSelectProps) => {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const regExp = new RegExp(handleDiacritics(query), 'iu')
  const filteredOptions = options?.filter(option => handleDiacritics(option.name).match(regExp))

  function handleDiacritics(string: string) {
    return string.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  }

  function capitalize(string: string) {
    const arr = string.split(' ')

    const newArr = arr.map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(' ')

    return newArr
  }
  return (
    <div
      className={`w-full h-full${
        alwaysOpen && fullHeight ? ' absolute md:relative flex flex-col' : ' relative'
      }`}
    >
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <ReorderableList listItems={selectedOptions} onListReorder={setSelectedOptions} />
          {selectedOptions.map(selectedOption => (
            <SelectedOption
              key={selectedOption}
              options={options}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
            />
          ))}
          {reorderable && selectedOptions.length > 1 && (
            <Button
              label="Neu anordnen"
              icon={<ArrowsUpDownIcon className="h-icon" />}
              contentType="icon"
              size="small"
            />
          )}
        </div>
      )}
      <div className="form-control">
        <MagnifyingGlassIcon className="h-icon absolute top-1/2 ml-3 transform -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchRef}
          type="search"
          name={name}
          id={name}
          placeholder={capitalize(name)}
          value={query}
          onChange={event => setQuery(event.target.value)}
          className="!pl-10"
        />
        <label htmlFor={name} className="sr-only">
          {name}
        </label>
      </div>
      {(query || alwaysOpen) && (
        <div
          className={clsx(
            'form-control w-full  bg-slate-700 overflow-auto',
            alwaysOpen ? 'mt-2' : 'absolute mt-1 p-2 rounded-lg shadow-lg z-20',
            fullHeight ? 'max-h-full md:h-72' : 'max-h-72'
          )}
        >
          {isLoading ? (
            <div className="w-full h-full grid place-content-center">
              <SpinnerIcon className="h-8 animate-spin" />
            </div>
          ) : (
            <>
              {filteredOptions && filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <MultiSelectOption
                    key={option.id}
                    option={option}
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
                    setQuery={setQuery}
                    searchRef={searchRef}
                  />
                ))
              ) : (
                <div className="p-2 text-slate-300">
                  Versuchs mal mit einem vernünftigen Suchbegriff.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
