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
  state.error = ''
  state.savingCardDetail = true
  requestRerender()
  try {
    const updatedCard = await client.updateCard(
      state.selectedCardDetail.card,
      {
        desc: state.draftCardDescription,
        name: state.selectedCardDetail.card.name,
      },
      state.credentials,
    )
    const card = {
      ...state.selectedCardDetail.card,
      ...updatedCard,
    }
    state.selectedCardDetail = {
      ...state.selectedCardDetail,
      card,
    }
    state.draftCardTitle = card.name
    state.draftCardDescription = card.desc || ''
    state.editingCardDescription = false
    updateBoardDetailCard(state, card)
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.savingCardDetail = false
  }
  requestRerender()
}
