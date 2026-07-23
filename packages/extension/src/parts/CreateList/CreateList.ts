import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloCredentials,
  TrelloList,
  TrelloListCreate,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedBoardLists } from '../GetBoardDetail/GetBoardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const createList = async (
  fetchLike: FetchLike,
  board: TrelloBoard,
  create: TrelloListCreate,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloList> => {
  const list = await requestJson<Omit<TrelloList, 'cards'>>(
    fetchLike,
    '/lists',
    credentials,
    {
      fields: 'name',
      idBoard: board.id,
      name: create.name,
      pos: create.pos,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedBoardLists(cache, board.id, credentials)
  return {
    ...list,
    cards: [],
  }
}
