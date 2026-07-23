import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCard,
  TrelloComment,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedCardComments } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const addCardComment = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  text: string,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloComment> => {
  const comment = await requestJson<TrelloComment>(
    fetchLike,
    `/cards/${card.id}/actions/comments`,
    credentials,
    {
      text,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedCardComments(cache, card, credentials)
  return comment
}
