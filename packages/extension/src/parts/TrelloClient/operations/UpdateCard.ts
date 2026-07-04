import type {
  TrelloCard,
  TrelloCardUpdate,
  TrelloCredentials,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import { requestJson } from '../RequestJson.ts'

export const updateCard = (
  fetchLike: FetchLike,
  card: TrelloCard,
  update: TrelloCardUpdate,
  credentials: TrelloCredentials,
): Promise<TrelloCard> => {
  return requestJson<TrelloCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    {
      desc: update.desc,
      fields: 'name,desc,url,idBoard,idList',
      name: update.name,
    },
    {
      method: 'PUT',
    },
  )
}
