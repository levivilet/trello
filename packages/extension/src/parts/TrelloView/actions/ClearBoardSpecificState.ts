import type { TrelloViewState } from '../state/TrelloViewState.ts'

export const clearBoardSpecificState = (
  state: Readonly<TrelloViewState>,
): void => {
  const mutableState = state as TrelloViewState
  mutableState.boardDetail = undefined
  mutableState.selectedCardDetail = undefined
  mutableState.cardDetailLoading = false
  mutableState.addingCardListId = ''
  mutableState.draftCardDescription = ''
  mutableState.draftCardTitle = ''
  mutableState.draftListTitles = {}
  mutableState.draftNewCardTitle = ''
  mutableState.editingCardDescription = false
  mutableState.editingCardTitle = false
  mutableState.savingCardDetail = false
  mutableState.savingNewCard = false
}
