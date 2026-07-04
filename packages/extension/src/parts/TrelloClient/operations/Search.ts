import type {
  TrelloCredentials,
  TrelloSearchResult,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import {
  normalizeSearchResponse,
  type TrelloSearchResponse,
} from '../NormalizeSearchResponse.ts'
import { requestJson } from '../RequestJson.ts'

export const search = async (
  fetchLike: FetchLike,
  query: string,
  credentials: TrelloCredentials,
): Promise<readonly TrelloSearchResult[]> => {
  const response = await requestJson<TrelloSearchResponse>(
    fetchLike,
    '/search',
    credentials,
    {
      board_fields: 'name,url',
      boards_limit: '10',
      card_fields: 'name,url,idBoard',
      cards_limit: '10',
      modelTypes: 'cards,boards',
      query,
    },
  )
  return normalizeSearchResponse(response)
}
