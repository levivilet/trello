import type {
  TrelloCard,
  TrelloCardMove,
} from '../../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { isSameJson } from './CacheFirstHelpers.ts'
import { findBoardCard } from './FindBoardCard.ts'

const getCardListId = (
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

const moveBoardDetailCard = (
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

const updateSelectedCard = (
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

export const moveCardToList = async (
  context: TrelloViewActionContext,
  cardId: string,
  targetListId: string,
  position: TrelloCardMove['pos'] = 'bottom',
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  const card = findBoardCard(state, cardId)
  if (!state.credentials || !targetListId || !card || state.movingCardId) {
    return
  }
  const sourceListId = getCardListId(state, card)
  if (sourceListId === targetListId) {
    requestRerender()
    return
  }
  const previousBoardDetail = state.boardDetail
  const previousSelectedCardDetail = state.selectedCardDetail
  const movingStateIsVisible = previousSelectedCardDetail?.card.id === card.id
  const optimisticCard = {
    ...card,
    idList: targetListId,
  }
  state.error = ''
  state.movingCardId = card.id
  moveBoardDetailCard(state, optimisticCard, targetListId, position)
  updateSelectedCard(state, optimisticCard)
  requestRerender()
  try {
    const sourceCard = sourceListId
      ? {
          ...card,
          idList: sourceListId,
        }
      : card
    await client.moveCard(
      sourceCard,
      {
        idList: targetListId,
        pos: position,
      },
      state.credentials,
    )
  } catch (error) {
    state.boardDetail = previousBoardDetail
    state.selectedCardDetail = previousSelectedCardDetail
    state.error = getErrorMessage(error)
    state.movingCardId = ''
    requestRerender()
    return
  }
  let shouldRerender = movingStateIsVisible
  try {
    const board = previousBoardDetail?.board
    if (board) {
      const freshBoardDetail = await client.getBoardDetail(
        board,
        state.credentials,
      )
      if (!isSameJson(state.boardDetail, freshBoardDetail)) {
        state.boardDetail = freshBoardDetail
        const freshCard = findBoardCard(state, card.id)
        if (freshCard) {
          updateSelectedCard(state, freshCard)
        }
        shouldRerender = true
      }
    }
  } catch (error) {
    state.error = getErrorMessage(error)
    shouldRerender = true
  }
  state.movingCardId = ''
  if (shouldRerender) {
    requestRerender()
  }
}
