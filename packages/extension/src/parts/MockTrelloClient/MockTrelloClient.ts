import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type { TrelloBoard, TrelloBoardDetail } from '../TrelloTypes/TrelloTypes.ts'

export interface MockTrelloData {
  readonly boardDetails?: Record<string, TrelloBoardDetail>
  readonly boards?: readonly TrelloBoard[]
  readonly error?: string
}

export const createMockTrelloClient = (data: MockTrelloData): TrelloClient => {
  return {
    async listBoards() {
      if (data.error) {
        throw new Error(data.error)
      }
      return data.boards || []
    },
    async getBoardDetail(board) {
      if (data.error) {
        throw new Error(data.error)
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
  }
}
