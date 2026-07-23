import type {
  TrelloBoard,
  TrelloCredentials,
  TrelloLabel,
  TrelloLabelCreate,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { TrelloApiCache } from '../TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import { requestJson } from '../RequestJson.ts'
import { deleteCachedBoardLabels } from './ListBoardLabels.ts'

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
