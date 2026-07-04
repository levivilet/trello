import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { clearBoardSpecificState } from './ClearBoardSpecificState.ts'

export const loadBoards = async (
  context: TrelloViewActionContext,
  rerender = true,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  if (!state.credentials) {
    return
  }
  state.loading = true
  state.error = ''
  clearBoardSpecificState(state)
  state.activeSearchQuery = ''
  state.searchResults = []
  try {
    state.boards = await client.listBoards(state.credentials)
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.loading = false
  }
  if (rerender) {
    requestRerender()
  }
}
