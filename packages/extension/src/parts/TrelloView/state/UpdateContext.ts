import type { TrelloViewState } from './TrelloViewState.ts'

const contextKeyBoardDetailFocus = 'trello.boardDetailFocus'
const contextKeyBoardsFocus = 'trello.boardsFocus'
const contextKeyCardDescriptionFocus = 'trello.cardDescriptionFocus'
const contextKeyCardDetailFocus = 'trello.cardDetailFocus'
const contextKeyNewCardInputFocus = 'trello.newCardInputFocus'

export const updateContext = (state: Readonly<TrelloViewState>): void => {
  const context: Record<string, boolean> = {}
  if (state.credentials && state.boardDetail) {
    context[contextKeyBoardDetailFocus] = true
  }
  if (state.credentials && !state.boardDetail) {
    context[contextKeyBoardsFocus] = true
  }
  if (state.selectedCardDetail) {
    context[contextKeyCardDetailFocus] = true
  }
  if (
    state.focusedName === 'cardDescription' &&
    state.selectedCardDetail &&
    state.editingCardDescription
  ) {
    context[contextKeyCardDescriptionFocus] = true
  }
  if (
    state.addingCardListId &&
    state.focusedName === `newCardTitle:${state.addingCardListId}`
  ) {
    context[contextKeyNewCardInputFocus] = true
  }
  const mutableState = state as TrelloViewState
  mutableState.context = context
}
