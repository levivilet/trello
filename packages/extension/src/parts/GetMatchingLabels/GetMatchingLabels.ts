import type { TrelloLabel } from '../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import { getLabelText } from '../LabelHelpers/LabelHelpers.ts'

export const getMatchingLabels = (
  state: Readonly<TrelloViewState>,
): readonly TrelloLabel[] => {
  const { boardLabels, draftLabelSearchQuery } = state
  const query = draftLabelSearchQuery.trim().toLowerCase()
  return boardLabels.filter((label) => {
    if (!query) {
      return true
    }
    return getLabelText(label).toLowerCase().includes(query)
  })
}
