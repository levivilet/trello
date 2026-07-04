import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
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
    const cardDetail = await client.getCardDetail(card, state.credentials)
    state.selectedCardDetail = cardDetail
    state.draftCardTitle = cardDetail.card.name
    state.draftCardDescription = cardDetail.card.desc || ''
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.cardDetailLoading = false
  }
  requestRerender()
}
