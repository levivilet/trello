import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { updateBoardDetailCard } from './UpdateBoardDetailCard.ts'

export const saveCardDetail = async (
  context: TrelloViewActionContext,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  if (
    !state.credentials ||
    !state.selectedCardDetail ||
    state.savingCardDetail
  ) {
    return
  }
  const name = state.draftCardTitle.trim()
  if (!name) {
    state.error = 'Card title is required.'
    requestRerender()
    return
  }
  state.error = ''
  state.savingCardDetail = true
  requestRerender()
  try {
    const card = await client.updateCard(
      state.selectedCardDetail.card,
      {
        desc: state.draftCardDescription,
        name,
      },
      state.credentials,
    )
    state.selectedCardDetail = {
      ...state.selectedCardDetail,
      card,
    }
    state.draftCardTitle = card.name
    state.draftCardDescription = card.desc || ''
    updateBoardDetailCard(state, card)
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.savingCardDetail = false
  }
  requestRerender()
}
