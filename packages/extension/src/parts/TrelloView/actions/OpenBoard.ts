import type { TrelloBoard } from '../../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { updateRecentBoardViews } from '../../RecentBoardStorage/RecentBoardStorage.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'

const findBoard = (
  context: TrelloViewActionContext,
  boardId: string,
): TrelloBoard | undefined => {
  const { state } = context
  return (
    state.boards.find((item) => item.id === boardId) ||
    state.searchResults.find(
      (item): item is TrelloBoard & { readonly type: 'board' } => {
        return item.type === 'board' && item.id === boardId
      },
    )
  )
}

export const openBoard = async (
  context: TrelloViewActionContext,
  boardId: string,
): Promise<void> => {
  const { client, currentBoardStorage, recentStorage, requestRerender } =
    context
  const state = context.state as TrelloViewState
  if (!state.credentials) {
    return
  }
  const board = findBoard(context, boardId)
  if (!board) {
    state.error = `Board not found: ${boardId}`
    requestRerender()
    return
  }
  state.loading = true
  state.error = ''
  state.selectedCardDetail = undefined
  state.cardDetailLoading = false
  state.draftCardDescription = ''
  state.draftCardTitle = ''
  state.savingCardDetail = false
  state.recentBoardViews = updateRecentBoardViews(
    state.recentBoardViews,
    board.id,
    new Date().toISOString(),
  )
  await recentStorage.write(state.recentBoardViews)
  try {
    state.boardDetail = await client.getBoardDetail(board, state.credentials)
    await currentBoardStorage.write(board.id)
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.loading = false
  }
  requestRerender()
}
