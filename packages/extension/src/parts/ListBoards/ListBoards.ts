// cspell:ignore prefs

import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import { readCachedJson, requestJson } from '../RequestJson/RequestJson.ts'

const listBoardsParams = {
  fields: 'name,url,dateLastView,idOrganization,prefs',
  organization: 'true',
  organization_fields: 'name,displayName',
} as const

export const readCachedListBoards = (
  cache: TrelloApiCache | undefined,
  credentials: TrelloCredentials,
): Promise<readonly TrelloBoard[] | undefined> => {
  return readCachedJson<readonly TrelloBoard[]>(
    cache,
    '/members/me/boards',
    credentials,
    listBoardsParams,
  )
}

export const listBoards = (
  fetchLike: FetchLike,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<readonly TrelloBoard[]> => {
  return requestJson<readonly TrelloBoard[]>(
    fetchLike,
    '/members/me/boards',
    credentials,
    listBoardsParams,
    undefined,
    cache,
  )
}
