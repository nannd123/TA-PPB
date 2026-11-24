const minuteFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

export function formatQuizDuration(durationSeconds) {
  const durationMinutes = Number(durationSeconds) / 60
  const formattedMinutes = Number.isInteger(durationMinutes)
    ? String(durationMinutes)
    : minuteFormatter.format(durationMinutes)

  return `${formattedMinutes} menit`
}
