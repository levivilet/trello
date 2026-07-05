import type { TrelloCard } from '../TrelloTypes/TrelloTypes.ts'

export const getCardCoverImageUrl = (
  card: Readonly<TrelloCard>,
): string => {
  const cover = card.cover
  if (!cover) {
    return ''
  }
  const scaledUrl = cover.scaled?.at(-1)?.url
  if (scaledUrl) {
    return scaledUrl
  }
  if (cover.url) {
    return cover.url
  }
  return cover.sharedSourceUrl || ''
}
