import type { TrelloBoard } from '../../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'

const findBoard = (
  boards: readonly TrelloBoard[],
  boardId: string,
): TrelloBoard | undefined => {
  return boards.find((board) => {
    return board.id === boardId
  })
}

export const restoreCurrentBoard = async (
  context: Readonly<TrelloViewActionContext>,
): Promise<void> => {
  const { client, currentBoardStorage } = context
  const state = context.state as TrelloViewState
  if (!state.credentials || state.error) {
    return
  }
  const boardId = await currentBoardStorage.read()
  if (!boardId) {
    return
  }
  const board = findBoard(state.boards, boardId)
  if (!board) {
    await currentBoardStorage.delete()
    return
  }
  state.loading = true
  state.error = ''
  try {
    state.boardDetail = await client.getBoardDetail(board, state.credentials)
  } catch (error) {
    state.error = getErrorMessage(error)
    await currentBoardStorage.delete()
  } finally {
    state.loading = false
  }
}
