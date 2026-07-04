import type { TrelloViewState } from '../state/TrelloViewState.ts'

export const clearBoardSpecificState = (
  state: Readonly<TrelloViewState>,
): void => {
  const mutableState = state as TrelloViewState
  mutableState.boardDetail = undefined
  mutableState.selectedCardDetail = undefined
  mutableState.cardDetailLoading = false
  mutableState.draftCardDescription = ''
  mutableState.draftCardTitle = ''
  mutableState.draftListTitles = {}
  mutableState.editingCardDescription = false
  mutableState.editingCardTitle = false
  mutableState.savingCardDetail = false
}
