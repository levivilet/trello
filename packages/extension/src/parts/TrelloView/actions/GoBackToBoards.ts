import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { clearBoardSpecificState } from './ClearBoardSpecificState.ts'

export const goBackToBoards = (context: TrelloViewActionContext): void => {
  const { requestRerender } = context
  const state = context.state as TrelloViewState
  clearBoardSpecificState(state)
  state.error = ''
  requestRerender()
}
