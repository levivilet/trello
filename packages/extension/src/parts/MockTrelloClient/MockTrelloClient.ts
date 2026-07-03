import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
} from '../TrelloTypes/TrelloTypes.ts'

export interface MockTrelloData {
  readonly boardDetailErrors?: Readonly<Record<string, string>>
  readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
  readonly boards?: readonly TrelloBoard[]
  readonly error?: string
  readonly listBoardsError?: string
  readonly listBoardsResponses?: readonly (readonly TrelloBoard[])[]
}

export const createMockTrelloClient = (
  data: Readonly<MockTrelloData>,
): TrelloClient => {
  let listBoardsCallCount = 0
  return {
    async getBoardDetail(board: TrelloBoard): Promise<TrelloBoardDetail> {
      if (data.error) {
        throw new Error(data.error)
      }
      const detailError = data.boardDetailErrors?.[board.id]
      if (detailError) {
        throw new Error(detailError)
      }
      const detail = data.boardDetails?.[board.id]
      if (!detail) {
        return {
          board,
          lists: [],
        }
      }
      return detail
    },
    async listBoards(): Promise<readonly TrelloBoard[]> {
      if (data.error) {
        throw new Error(data.error)
      }
      if (data.listBoardsError) {
        throw new Error(data.listBoardsError)
      }
      const scriptedResponse = data.listBoardsResponses?.[listBoardsCallCount]
      listBoardsCallCount++
      if (scriptedResponse) {
        return scriptedResponse
      }
      return data.boards || []
    },
  }
}
