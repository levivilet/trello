import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloCredentials,
  TrelloLabel,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedJson, requestJson } from '../RequestJson/RequestJson.ts'

export const labelParams = {
  fields: 'name,color,idBoard',
  limit: '1000',
} as const

export const deleteCachedBoardLabels = async (
  cache: TrelloApiCache | undefined,
  boardId: string,
  credentials: TrelloCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/boards/${boardId}/labels`,
    credentials,
    labelParams,
  )
}

export const listBoardLabels = (
  fetchLike: FetchLike,
  board: TrelloBoard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<readonly TrelloLabel[]> => {
  return requestJson<readonly TrelloLabel[]>(
    fetchLike,
    `/boards/${board.id}/labels`,
    credentials,
    labelParams,
    undefined,
    cache,
  )
}
