import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type { TrelloCacheFirstResult } from '../TrelloClient/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloCardMove,
  TrelloCardUpdate,
  TrelloList,
  TrelloListUpdate,
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'

export interface MockTrelloData {
  readonly boardDetailErrors?: Readonly<Record<string, string>>
  readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
  readonly boards?: readonly TrelloBoard[]
  readonly cardDetailErrors?: Readonly<Record<string, string>>
  readonly cardDetails?: Readonly<Record<string, TrelloCardDetail>>
  readonly cardMoveErrors?: Readonly<Record<string, string>>
  readonly cardUpdateErrors?: Readonly<Record<string, string>>
  readonly error?: string
  readonly listBoardsError?: string
  readonly listBoardsResponses?: readonly (readonly TrelloBoard[])[]
  readonly listUpdateErrors?: Readonly<Record<string, string>>
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
  const boardDetails: Record<string, TrelloBoardDetail> = {
    ...data.boardDetails,
  }
  const findCard = (cardId: string): TrelloCard | undefined => {
    const details = Object.values(boardDetails)
    for (const detail of details) {
      for (const list of detail.lists) {
        const card = list.cards.find((item) => item.id === cardId)
        if (card) {
          return card
        }
      }
    }
    return undefined
  }

  const client: TrelloClient = {
    async getBoardDetail(board: TrelloBoard): Promise<TrelloBoardDetail> {
      if (data.error) {
        throw new Error(data.error)
      }
      const detailError = data.boardDetailErrors?.[board.id]
      if (detailError) {
        throw new Error(detailError)
      }
      const detail = boardDetails[board.id]
      if (!detail) {
        return {
          board,
          lists: [],
        }
      }
      return detail
    },
    async getBoardDetailCacheFirst(
      board: TrelloBoard,
    ): Promise<TrelloCacheFirstResult<TrelloBoardDetail>> {
      return {
        cached: undefined,
        fresh: client.getBoardDetail(board, {
          apiKey: '',
          token: '',
        }),
      }
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
        return {
          ...detail,
          comments: detail.comments || [],
        }
      }
      return {
        attachments: [],
        card: findCard(card.id) || card,
        comments: [],
      }
    },
    async getCardDetailCacheFirst(
      card: TrelloCard,
    ): Promise<TrelloCacheFirstResult<TrelloCardDetail>> {
      return {
        cached: undefined,
        fresh: client.getCardDetail(card, {
          apiKey: '',
          token: '',
        }),
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
    async listBoardsCacheFirst(): Promise<
      TrelloCacheFirstResult<readonly TrelloBoard[]>
    > {
      return {
        cached: undefined,
        fresh: client.listBoards({
          apiKey: '',
          token: '',
        }),
      }
    },
    async moveCard(
      card: TrelloCard,
      move: TrelloCardMove,
    ): Promise<TrelloCard> {
      if (data.error) {
        throw new Error(data.error)
      }
      const moveError = data.cardMoveErrors?.[card.id]
      if (moveError) {
        throw new Error(moveError)
      }
      const existingCard = findCard(card.id) || card
      const movedCard = {
        ...existingCard,
        idList: move.idList,
      }
      for (const [boardId, detail] of Object.entries(boardDetails)) {
        const hasCard = detail.lists.some((list) => {
          return list.cards.some((item) => item.id === card.id)
        })
        if (!hasCard) {
          continue
        }
        boardDetails[boardId] = {
          ...detail,
          lists: detail.lists.map((list) => {
            const cardsWithoutMoved = list.cards.filter((item) => {
              return item.id !== card.id
            })
            if (list.id !== move.idList) {
              return {
                ...list,
                cards: cardsWithoutMoved,
              }
            }
            return {
              ...list,
              cards: [...cardsWithoutMoved, movedCard],
            }
          }),
        }
      }
      const previousDetail = cardDetails[card.id]
      if (previousDetail) {
        cardDetails[card.id] = {
          ...previousDetail,
          card: {
            ...previousDetail.card,
            idList: move.idList,
          },
        }
      }
      return movedCard
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
    async searchCacheFirst(): Promise<
      TrelloCacheFirstResult<readonly TrelloSearchResult[]>
    > {
      return {
        cached: undefined,
        fresh: client.search('', {
          apiKey: '',
          token: '',
        }),
      }
    },
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
        comments: previousDetail?.comments || [],
      }
      return updatedCard
    },
    async updateList(
      list: TrelloList,
      update: TrelloListUpdate,
    ): Promise<TrelloList> {
      if (data.error) {
        throw new Error(data.error)
      }
      const updateError = data.listUpdateErrors?.[list.id]
      if (updateError) {
        throw new Error(updateError)
      }
      const updatedList = {
        ...list,
        name: update.name,
      }
      for (const [boardId, detail] of Object.entries(boardDetails)) {
        boardDetails[boardId] = {
          ...detail,
          lists: detail.lists.map((item) => {
            return item.id === list.id ? updatedList : item
          }),
        }
      }
      return updatedList
    },
  }
  return client
}
