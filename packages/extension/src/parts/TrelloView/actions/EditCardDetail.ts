import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'

export const editCardTitle = (context: TrelloViewActionContext): void => {
  const state = context.state as TrelloViewState
  state.editingCardTitle = true
  context.requestRerender()
}

export const editCardDescription = (context: TrelloViewActionContext): void => {
  const state = context.state as TrelloViewState
  state.editingCardDescription = true
  context.requestRerender()
}

export const cancelCardDescriptionEdit = (
  context: TrelloViewActionContext,
): void => {
  const state = context.state as TrelloViewState
  if (!state.selectedCardDetail) {
    return
  }
  state.draftCardDescription = state.selectedCardDetail.card.desc || ''
  state.editingCardDescription = false
  state.error = ''
  context.requestRerender()
}
