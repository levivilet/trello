import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'
import { createInitialState } from '../CreateInitialState/CreateInitialState.ts'

export const logout = async (
  context: TrelloViewActionContext,
): Promise<void> => {
  const {
    currentBoardStorage,
    imageCache,
    recentStorage,
    requestRerender,
    storage,
  } = context
  const state = context.state as TrelloViewState
  await storage.delete()
  await recentStorage.delete()
  await currentBoardStorage.delete()
  imageCache.dispose()
  Object.assign(state, createInitialState())
  requestRerender()
}
