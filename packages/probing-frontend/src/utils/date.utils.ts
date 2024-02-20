export function formatDateString(dateString: string) {
  try {
    const formatter = new Intl.DateTimeFormat('it', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
    return formatter.format(new Date(dateString))
  } catch {
    return 'N/D'
  }
}
