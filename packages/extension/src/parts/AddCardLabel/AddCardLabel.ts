import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCard,
  TrelloCredentials,
  TrelloLabel,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedCardDetail } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const addCardLabel = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  label: TrelloLabel,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCard> => {
  const updatedCard = await requestJson<TrelloCard>(
    fetchLike,
    `/cards/${card.id}/idLabels`,
    credentials,
    {
      value: label.id,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedCardDetail(cache, card, credentials)
  return updatedCard
}
