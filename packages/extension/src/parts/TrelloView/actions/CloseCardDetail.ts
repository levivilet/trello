import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'

export const closeCardDetail = (context: TrelloViewActionContext): void => {
  const { requestRerender } = context
  const state = context.state as TrelloViewState
  state.selectedCardDetail = undefined
  state.cardDetailLoading = false
  state.addingCardLabelId = ''
  state.cardLabelPickerOpen = false
  state.draftCardDescription = ''
  state.draftCardTitle = ''
  state.draftLabelSearchQuery = ''
  state.editingCardDescription = false
  state.editingCardTitle = false
  state.error = ''
  requestRerender()
}
