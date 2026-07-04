import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCredentials,
  TrelloList,
  TrelloCard,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import { requestJson } from '../RequestJson.ts'

export const getBoardDetail = async (
  fetchLike: FetchLike,
  board: TrelloBoard,
  credentials: TrelloCredentials,
): Promise<TrelloBoardDetail> => {
  const lists = await requestJson<readonly Omit<TrelloList, 'cards'>[]>(
    fetchLike,
    `/boards/${board.id}/lists`,
    credentials,
    {
      fields: 'name',
    },
  )
  const listsWithCards = await Promise.all(
    lists.map(async (list): Promise<TrelloList> => {
      const cards = await requestJson<readonly TrelloCard[]>(
        fetchLike,
        `/lists/${list.id}/cards`,
        credentials,
        {
          fields: 'name,url,idBoard,idList,badges',
        },
      )
      return {
        cards,
        id: list.id,
        name: list.name,
      }
    }),
  )
  return {
    board,
    lists: listsWithCards,
  }
}
