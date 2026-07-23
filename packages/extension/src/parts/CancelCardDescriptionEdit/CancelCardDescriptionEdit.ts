import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'

export const cancelCardDescriptionEdit = (
  context: TrelloViewActionContext,
): void => {
  const state = context.state as TrelloViewState
  state.draftCardDescription = state.selectedCardDetail?.card.desc || ''
  state.editingCardDescription = false
  state.focusedName = ''
  state.error = ''
  context.requestRerender()
}
