import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloCredentials,
  TrelloLabel,
  TrelloLabelCreate,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedBoardLabels } from '../ListBoardLabels/ListBoardLabels.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const createLabel = async (
  fetchLike: FetchLike,
  board: TrelloBoard,
  create: TrelloLabelCreate,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloLabel> => {
  const label = await requestJson<TrelloLabel>(
    fetchLike,
    '/labels',
    credentials,
    {
      color: create.color,
      idBoard: board.id,
      name: create.name,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedBoardLabels(cache, board.id, credentials)
  return label
}
