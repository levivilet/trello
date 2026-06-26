import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
} from '../TrelloTypes/TrelloTypes.ts'

export interface MockTrelloData {
  readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
  readonly boards?: readonly TrelloBoard[]
  readonly error?: string
}

export const createMockTrelloClient = (
  data: Readonly<MockTrelloData>,
): TrelloClient => {
  return {
    async getBoardDetail(board: TrelloBoard): Promise<TrelloBoardDetail> {
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
    async listBoards(): Promise<readonly TrelloBoard[]> {
      if (data.error) {
        throw new Error(data.error)
      }
      return data.boards || []
    },
  }
}
