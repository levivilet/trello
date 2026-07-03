import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
<<<<<<< HEAD
=======
  TrelloCard,
  TrelloCardDetail,
  TrelloCardUpdate,
>>>>>>> origin/main
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'

export interface MockTrelloData {
  readonly boardDetailErrors?: Readonly<Record<string, string>>
  readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
  readonly boards?: readonly TrelloBoard[]
  readonly cardDetailErrors?: Readonly<Record<string, string>>
  readonly cardDetails?: Readonly<Record<string, TrelloCardDetail>>
  readonly cardUpdateErrors?: Readonly<Record<string, string>>
  readonly error?: string
  readonly listBoardsError?: string
  readonly listBoardsResponses?: readonly (readonly TrelloBoard[])[]
  readonly searchError?: string
  readonly searchResults?: readonly TrelloSearchResult[]
}

export const createMockTrelloClient = (
  data: Readonly<MockTrelloData>,
): TrelloClient => {
  let listBoardsCallCount = 0
  const cardDetails: Record<string, TrelloCardDetail> = {
    ...data.cardDetails,
  }
  const findCard = (cardId: string): TrelloCard | undefined => {
    const boardDetails = Object.values(data.boardDetails || {})
    for (const detail of boardDetails) {
      for (const list of detail.lists) {
        const card = list.cards.find((item) => item.id === cardId)
        if (card) {
          return card
        }
      }
    }
    return undefined
  }

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
    async getCardDetail(card: TrelloCard): Promise<TrelloCardDetail> {
      if (data.error) {
        throw new Error(data.error)
      }
      const detailError = data.cardDetailErrors?.[card.id]
      if (detailError) {
        throw new Error(detailError)
      }
      const detail = cardDetails[card.id]
      if (detail) {
        return detail
      }
      return {
        attachments: [],
        card: findCard(card.id) || card,
      }
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
    async search(): Promise<readonly TrelloSearchResult[]> {
      if (data.error) {
        throw new Error(data.error)
      }
      if (data.searchError) {
        throw new Error(data.searchError)
      }
      return data.searchResults || []
    },
<<<<<<< HEAD
=======
    async updateCard(
      card: TrelloCard,
      update: TrelloCardUpdate,
    ): Promise<TrelloCard> {
      if (data.error) {
        throw new Error(data.error)
      }
      const updateError = data.cardUpdateErrors?.[card.id]
      if (updateError) {
        throw new Error(updateError)
      }
      const previousDetail = cardDetails[card.id]
      const previousCard = previousDetail?.card || findCard(card.id) || card
      const updatedCard = {
        ...previousCard,
        desc: update.desc,
        name: update.name,
      }
      cardDetails[card.id] = {
        attachments: previousDetail?.attachments || [],
        card: updatedCard,
      }
      return updatedCard
    },
>>>>>>> origin/main
  }
}
