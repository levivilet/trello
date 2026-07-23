import type { TrelloCard, TrelloCardMove } from '../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'

export const moveBoardDetailCard = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
  targetListId: string,
  position: TrelloCardMove['pos'],
): void => {
  const mutableState = state as TrelloViewState
  if (!mutableState.boardDetail) {
    return
  }
  mutableState.boardDetail = {
    ...mutableState.boardDetail,
    lists: mutableState.boardDetail.lists.map((list) => {
      const cardsWithoutMoved = list.cards.filter((item) => {
        return item.id !== card.id
      })
      if (list.id !== targetListId) {
        return {
          ...list,
          cards: cardsWithoutMoved,
        }
      }
      return {
        ...list,
        cards:
          position === 'top'
            ? [card, ...cardsWithoutMoved]
            : [...cardsWithoutMoved, card],
      }
    }),
  }
}
