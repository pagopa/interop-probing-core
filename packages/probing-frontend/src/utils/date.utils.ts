export function formatDateString(dateString: string) {
  const formatter = new Intl.DateTimeFormat('it', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
  return formatter.format(new Date(dateString))
}
