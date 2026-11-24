const jakartaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function getJakartaDate(date = new Date()) {
  const dateParts = Object.fromEntries(
    jakartaDateFormatter.formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  )

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
}
