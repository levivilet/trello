import type { TrelloLabel } from '../TrelloTypes/TrelloTypes.ts'

export const hasCardLabel = (
  labels: readonly TrelloLabel[] | undefined,
  labelId: string,
): boolean => {
  return Boolean(
    labels?.some((label) => {
      return label.id === labelId
    }),
  )
}
