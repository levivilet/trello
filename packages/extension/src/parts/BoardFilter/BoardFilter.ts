import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'

export const openBoardFilter = (
  context: Readonly<TrelloViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as TrelloViewState
  state.boardFilterOpen = true
  state.focusedName = 'boardFilter'
  requestRerender()
}

export const closeBoardFilter = (
  context: Readonly<TrelloViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as TrelloViewState
  state.boardFilterOpen = false
  if (state.focusedName === 'boardFilter') {
    state.focusedName = ''
  }
  requestRerender()
}
