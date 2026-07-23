import type {
  FetchLike,
  TrelloCacheFirstResult,
  TrelloClient,
  TrelloClientOptions,
} from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloComment,
  TrelloCredentials,
  TrelloLabel,
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'
import { addCardComment } from '../AddCardComment/AddCardComment.ts'
import { addCardLabel } from '../AddCardLabel/AddCardLabel.ts'
import { createCard } from '../CreateCard/CreateCard.ts'
import { createLabel } from '../CreateLabel/CreateLabel.ts'
import { createList } from '../CreateList/CreateList.ts'
import {
  getBoardDetail,
  readCachedBoardDetail,
} from '../GetBoardDetail/GetBoardDetail.ts'
import {
  getCardDetail,
  getCardDetailParts,
  readCachedCardDetail,
} from '../GetCardDetail/GetCardDetail.ts'
import { listBoardLabels } from '../ListBoardLabels/ListBoardLabels.ts'
import { listBoards, readCachedListBoards } from '../ListBoards/ListBoards.ts'
import { moveCard } from '../MoveCard/MoveCard.ts'
import { readCachedSearch, search } from '../Search/Search.ts'
import {
  createCacheStorageTrelloApiCache,
  type TrelloApiCache,
} from '../TrelloApiCache/TrelloApiCache.ts'
import { updateCard } from '../UpdateCard/UpdateCard.ts'
import { updateList } from '../UpdateList/UpdateList.ts'

export type {
  FetchLike,
  TrelloClient,
} from '../TrelloClientTypes/TrelloClientTypes.ts'

export const createTrelloClient = (
  fetchLike: FetchLike = fetch,
  cache: TrelloApiCache | undefined = createCacheStorageTrelloApiCache(),
  options: TrelloClientOptions = {},
): TrelloClient => {
  const readBatchRequestsEnabled =
    options.readBatchRequestsEnabled ||
    ((): Promise<boolean> => Promise.resolve(false))
  const getFreshBoardDetail = async (
    board: TrelloBoard,
    credentials: TrelloCredentials,
  ): Promise<TrelloBoardDetail> => {
    return getBoardDetail(
      fetchLike,
      board,
      credentials,
      cache,
      await readBatchRequestsEnabled(),
    )
  }
  const getFreshCardDetail = async (
    card: TrelloCard,
    credentials: TrelloCredentials,
  ): Promise<TrelloCardDetail> => {
    return getCardDetail(
      fetchLike,
      card,
      credentials,
      cache,
      await readBatchRequestsEnabled(),
    )
  }
  return {
    addCardComment(
      card: TrelloCard,
      text: string,
      credentials: TrelloCredentials,
    ): Promise<TrelloComment> {
      return addCardComment(fetchLike, card, text, credentials, cache)
    },
    addCardLabel(
      card: TrelloCard,
      label: TrelloLabel,
      credentials: TrelloCredentials,
    ): ReturnType<TrelloClient['addCardLabel']> {
      return addCardLabel(fetchLike, card, label, credentials, cache)
    },
    createCard(
      list,
      create,
      credentials,
    ): ReturnType<TrelloClient['createCard']> {
      return createCard(fetchLike, list, create, credentials, cache)
    },
    createLabel(
      board: TrelloBoard,
      create,
      credentials,
    ): ReturnType<TrelloClient['createLabel']> {
      return createLabel(fetchLike, board, create, credentials, cache)
    },
    createList(
      board: TrelloBoard,
      create,
      credentials,
    ): ReturnType<TrelloClient['createList']> {
      return createList(fetchLike, board, create, credentials, cache)
    },
    async getBoardDetail(
      board,
      credentials,
    ): ReturnType<TrelloClient['getBoardDetail']> {
      return getFreshBoardDetail(board, credentials)
    },
    async getBoardDetailCacheFirst(
      board: TrelloBoard,
      credentials: TrelloCredentials,
    ): Promise<TrelloCacheFirstResult<TrelloBoardDetail>> {
      return {
        cached: await readCachedBoardDetail(cache, board, credentials),
        fresh: getFreshBoardDetail(board, credentials),
      }
    },
    async getCardDetail(
      card,
      credentials,
    ): ReturnType<TrelloClient['getCardDetail']> {
      return getFreshCardDetail(card, credentials)
    },
    async getCardDetailCacheFirst(
      card: TrelloCard,
      credentials: TrelloCredentials,
    ): Promise<TrelloCacheFirstResult<TrelloCardDetail>> {
      return {
        cached: await readCachedCardDetail(cache, card, credentials),
        fresh: getFreshCardDetail(card, credentials),
      }
    },
    async getCardDetailPartsCacheFirst(
      card: TrelloCard,
      credentials: TrelloCredentials,
    ): ReturnType<TrelloClient['getCardDetailPartsCacheFirst']> {
      const [cached, batchRequestsEnabled] = await Promise.all([
        readCachedCardDetail(cache, card, credentials),
        readBatchRequestsEnabled(),
      ])
      return {
        cached,
        fresh: getCardDetailParts(
          fetchLike,
          card,
          credentials,
          cache,
          batchRequestsEnabled,
        ),
      }
    },
    listBoardLabels(
      board,
      credentials,
    ): ReturnType<TrelloClient['listBoardLabels']> {
      return listBoardLabels(fetchLike, board, credentials, cache)
    },
    listBoards(credentials): ReturnType<TrelloClient['listBoards']> {
      return listBoards(fetchLike, credentials, cache)
    },
    async listBoardsCacheFirst(
      credentials,
    ): ReturnType<TrelloClient['listBoardsCacheFirst']> {
      return {
        cached: await readCachedListBoards(cache, credentials),
        fresh: listBoards(fetchLike, credentials, cache),
      }
    },
    moveCard(card, move, credentials): ReturnType<TrelloClient['moveCard']> {
      return moveCard(fetchLike, card, move, credentials, cache)
    },
    search(query, credentials): ReturnType<TrelloClient['search']> {
      return search(fetchLike, query, credentials, cache)
    },
    async searchCacheFirst(
      query: string,
      credentials: TrelloCredentials,
    ): Promise<TrelloCacheFirstResult<readonly TrelloSearchResult[]>> {
      return {
        cached: await readCachedSearch(cache, query, credentials),
        fresh: search(fetchLike, query, credentials, cache),
      }
    },
    updateCard(
      card,
      update,
      credentials,
    ): ReturnType<TrelloClient['updateCard']> {
      return updateCard(fetchLike, card, update, credentials, cache)
    },
    updateList(
      list,
      update,
      credentials,
    ): ReturnType<TrelloClient['updateList']> {
      return updateList(fetchLike, list, update, credentials)
    },
  }
}
