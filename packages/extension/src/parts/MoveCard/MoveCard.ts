import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCard,
  TrelloCardMove,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedListCards } from '../GetBoardDetail/GetBoardDetail.ts'
import { deleteCachedCardDetail } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const moveCard = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  move: TrelloCardMove,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCard> => {
  const movedCard = await requestJson<TrelloCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    {
      fields: 'name,url,idBoard,idList,badges,cover',
      idList: move.idList,
      pos: move.pos,
    },
    {
      method: 'PUT',
    },
  )
  await Promise.all([
    deleteCachedCardDetail(cache, card, credentials),
    ...(card.idList
      ? [deleteCachedListCards(cache, card.idList, credentials)]
      : []),
    deleteCachedListCards(cache, move.idList, credentials),
  ])
  return movedCard
}
