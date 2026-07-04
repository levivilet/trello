import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { clearBoardSpecificState } from './ClearBoardSpecificState.ts'

export const submitSearch = async (
  context: TrelloViewActionContext,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  if (!state.credentials || !state.searchEnabled) {
    return
  }
  const query = state.draftSearchQuery.trim()
  state.draftSearchQuery = query
  state.error = ''
  clearBoardSpecificState(state)
  if (!query) {
    state.activeSearchQuery = ''
    state.searchResults = []
    requestRerender()
    return
  }
  state.activeSearchQuery = query
  state.searchResults = []
  state.loading = true
  requestRerender()
  try {
    state.searchResults = await client.search(query, state.credentials)
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.loading = false
  }
  requestRerender()
}
