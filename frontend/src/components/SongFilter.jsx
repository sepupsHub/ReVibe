function SongFilter({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Filter by song or artist"
    />
  )
}

export default SongFilter
