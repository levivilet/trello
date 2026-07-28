import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCredentials,
  TrelloList,
  TrelloCard,
} from '../TrelloTypes/TrelloTypes.ts'
import {
  deleteCachedJson,
  readCachedJson,
  requestJson,
  requestJsonBatch,
  type TrelloBatchRequest,
} from '../RequestJson/RequestJson.ts'

const batchRequestLimit = 10

const listParams = {
  fields: 'name',
} as const

const cardsParams = {
  attachment_fields: 'name,url,mimeType,previews',
  attachments: 'cover',
  fields: 'name,desc,url,idBoard,idList,badges,cover,labels',
} as const

export const deleteCachedBoardLists = async (
  cache: TrelloApiCache | undefined,
  boardId: string,
  credentials: TrelloCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/boards/${boardId}/lists`,
    credentials,
    listParams,
  )
}

export const deleteCachedListCards = async (
  cache: TrelloApiCache | undefined,
  listId: string,
  credentials: TrelloCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/lists/${listId}/cards`,
    credentials,
    cardsParams,
  )
}

export const readCachedBoardDetail = async (
  cache: TrelloApiCache | undefined,
  board: TrelloBoard,
  credentials: TrelloCredentials,
): Promise<TrelloBoardDetail | undefined> => {
  const lists = await readCachedJson<readonly Omit<TrelloList, 'cards'>[]>(
    cache,
    `/boards/${board.id}/lists`,
    credentials,
    listParams,
  )
  if (!lists) {
    return undefined
  }
  const cardsByList = await Promise.all(
    lists.map((list) => {
      return readCachedJson<readonly TrelloCard[]>(
        cache,
        `/lists/${list.id}/cards`,
        credentials,
        cardsParams,
      )
    }),
  )
  if (cardsByList.some((cards) => !cards)) {
    return undefined
  }
  return {
    board,
    lists: lists.map((list, index) => {
      return {
        cards: cardsByList[index] || [],
        id: list.id,
        name: list.name,
      }
    }),
  }
}

export const getBoardDetail = async (
  fetchLike: FetchLike,
  board: TrelloBoard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
  batchRequestsEnabled = false,
): Promise<TrelloBoardDetail> => {
  const lists = await requestJson<readonly Omit<TrelloList, 'cards'>[]>(
    fetchLike,
    `/boards/${board.id}/lists`,
    credentials,
    listParams,
    undefined,
    cache,
  )
  const cardsByList = batchRequestsEnabled
    ? await getCardsBatched(fetchLike, lists, credentials, cache)
    : await Promise.all(
        lists.map((list) => {
          return requestJson<readonly TrelloCard[]>(
            fetchLike,
            `/lists/${list.id}/cards`,
            credentials,
            cardsParams,
            undefined,
            cache,
          )
        }),
      )
  return {
    board,
    lists: lists.map((list, index) => {
      return {
        cards: cardsByList[index] || [],
        id: list.id,
        name: list.name,
      }
    }),
  }
}

const getCardsBatched = async (
  fetchLike: FetchLike,
  lists: readonly Omit<TrelloList, 'cards'>[],
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<readonly (readonly TrelloCard[])[]> => {
  const requests: TrelloBatchRequest[] = lists.map((list) => {
    return {
      params: cardsParams,
      path: `/lists/${list.id}/cards`,
    }
  })
  const batches: TrelloBatchRequest[][] = []
  for (let index = 0; index < requests.length; index += batchRequestLimit) {
    batches.push(requests.slice(index, index + batchRequestLimit))
  }
  const results = await Promise.all(
    batches.map((batch: readonly TrelloBatchRequest[]) => {
      return requestJsonBatch<readonly (readonly TrelloCard[])[]>(
        fetchLike,
        batch,
        credentials,
        cache,
      )
    }),
  )
  return results.flat()
}
