import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCard,
  TrelloCardCreate,
  TrelloCredentials,
  TrelloList,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedListCards } from '../GetBoardDetail/GetBoardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const createCard = async (
  fetchLike: FetchLike,
  list: TrelloList,
  create: TrelloCardCreate,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCard> => {
  const card = await requestJson<TrelloCard>(
    fetchLike,
    '/cards',
    credentials,
    {
      fields: 'name,url,idBoard,idList,badges',
      idList: list.id,
      name: create.name,
      pos: create.pos,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedListCards(cache, list.id, credentials)
  return card
}
