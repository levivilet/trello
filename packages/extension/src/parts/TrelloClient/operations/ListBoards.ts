// cspell:ignore prefs

import type {
  TrelloBoard,
  TrelloCredentials,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import { requestJson } from '../RequestJson.ts'

export const listBoards = (
  fetchLike: FetchLike,
  credentials: TrelloCredentials,
): Promise<readonly TrelloBoard[]> => {
  return requestJson<readonly TrelloBoard[]>(
    fetchLike,
    '/members/me/boards',
    credentials,
    {
      fields: 'name,url,dateLastView,idOrganization,prefs',
      organization: 'true',
      organization_fields: 'name,displayName',
    },
  )
}
