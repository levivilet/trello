import type { FetchLike, TrelloClient } from './TrelloClientTypes.ts'
import { getBoardDetail } from './operations/GetBoardDetail.ts'
import { getCardDetail } from './operations/GetCardDetail.ts'
import { listBoards } from './operations/ListBoards.ts'
import { search } from './operations/Search.ts'
import { updateCard } from './operations/UpdateCard.ts'

export type { FetchLike, TrelloClient } from './TrelloClientTypes.ts'

export const createTrelloClient = (
  fetchLike: FetchLike = fetch,
): TrelloClient => {
  return {
    getBoardDetail(
      board,
      credentials,
    ): ReturnType<TrelloClient['getBoardDetail']> {
      return getBoardDetail(fetchLike, board, credentials)
    },
    getCardDetail(
      card,
      credentials,
    ): ReturnType<TrelloClient['getCardDetail']> {
      return getCardDetail(fetchLike, card, credentials)
    },
    listBoards(credentials): ReturnType<TrelloClient['listBoards']> {
      return listBoards(fetchLike, credentials)
    },
    search(query, credentials): ReturnType<TrelloClient['search']> {
      return search(fetchLike, query, credentials)
    },
    updateCard(
      card,
      update,
      credentials,
    ): ReturnType<TrelloClient['updateCard']> {
      return updateCard(fetchLike, card, update, credentials)
    },
  }
}
