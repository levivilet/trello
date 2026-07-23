import type { TrelloCardMove } from '../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'
import { isSameJson } from '../CacheFirstHelpers/CacheFirstHelpers.ts'
import { findBoardCard } from '../FindBoardCard/FindBoardCard.ts'
import { getCardListId } from '../GetCardListId/GetCardListId.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import { moveBoardDetailCard } from '../MoveBoardDetailCard/MoveBoardDetailCard.ts'
import { updateSelectedCard } from '../UpdateSelectedCard/UpdateSelectedCard.ts'

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
