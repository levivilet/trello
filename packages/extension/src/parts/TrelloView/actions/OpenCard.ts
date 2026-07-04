import type { TrelloCardDetail } from '../../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { applyCardDetail, isSameJson } from './CacheFirstHelpers.ts'
import { findBoardCard } from './FindBoardCard.ts'

export const openCard = async (
  context: TrelloViewActionContext,
  cardId: string,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  if (!state.credentials || !state.boardDetail) {
    return
  }
  const card = findBoardCard(state, cardId)
  if (!card) {
    state.error = `Card not found: ${cardId}`
    requestRerender()
    return
  }
  state.cardDetailLoading = true
  state.selectedCardDetail = undefined
  state.error = ''
  requestRerender()
  try {
    const result = await client.getCardDetailCacheFirst(card, state.credentials)
    if (result.cached) {
      applyCardDetail(state, result.cached)
      state.cardDetailLoading = false
      requestRerender()
    }
    const fresh = await result.fresh
    const selectedCardDetail = state.selectedCardDetail as
      | TrelloCardDetail
      | undefined
    if (state.cardDetailLoading || selectedCardDetail?.card.id === card.id) {
      if (!isSameJson(state.selectedCardDetail, fresh)) {
        applyCardDetail(state, fresh)
      }
      state.cardDetailLoading = false
    }
  } catch (error) {
    state.error = getErrorMessage(error)
    state.cardDetailLoading = false
  }
  requestRerender()
}
