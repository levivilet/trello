import type { TrelloCard } from '../../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'

export const getCardListId = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): string => {
  if (card.idList) {
    return card.idList
  }
  const lists = state.boardDetail?.lists || []
  const list = lists.find((item) => {
    return item.cards.some((listCard) => {
      return listCard.id === card.id
    })
  })
  return list?.id || ''
}
