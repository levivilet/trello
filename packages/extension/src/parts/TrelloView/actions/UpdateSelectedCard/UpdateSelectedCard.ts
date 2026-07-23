import type { TrelloCard } from '../../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'

export const updateSelectedCard = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): void => {
  const mutableState = state as TrelloViewState
  if (mutableState.selectedCardDetail?.card.id !== card.id) {
    return
  }
  mutableState.selectedCardDetail = {
    ...mutableState.selectedCardDetail,
    card: {
      ...mutableState.selectedCardDetail.card,
      ...card,
    },
  }
}
