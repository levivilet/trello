import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCard,
  TrelloCardUpdate,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedCardDetail } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const updateCard = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  update: TrelloCardUpdate,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCard> => {
  const updatedCard = await requestJson<TrelloCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    {
      desc: update.desc,
      fields: 'name,desc,url,idBoard,idList,badges,cover',
      name: update.name,
    },
    {
      method: 'PUT',
    },
  )
  await deleteCachedCardDetail(cache, card, credentials)
  return updatedCard
}
