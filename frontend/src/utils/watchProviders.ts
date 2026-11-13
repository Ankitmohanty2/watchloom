/** TMDB streaming provider id from a URL query value. */
export const parseWatchProviderId = (value: string | null | undefined): number | undefined => {
  if (!value?.trim()) return undefined
  const id = Number(value)
  return Number.isInteger(id) && id >= 1 ? id : undefined
}
