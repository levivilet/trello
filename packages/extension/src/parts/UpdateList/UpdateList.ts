import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCredentials,
  TrelloList,
  TrelloListUpdate,
} from '../TrelloTypes/TrelloTypes.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const updateList = async (
  fetchLike: FetchLike,
  list: TrelloList,
  update: TrelloListUpdate,
  credentials: TrelloCredentials,
): Promise<TrelloList> => {
  const updatedList = await requestJson<Omit<TrelloList, 'cards'>>(
    fetchLike,
    `/lists/${list.id}`,
    credentials,
    {
      fields: 'name',
      name: update.name,
    },
    {
      method: 'PUT',
    },
  )
  return {
    ...list,
    ...updatedList,
  }
}
