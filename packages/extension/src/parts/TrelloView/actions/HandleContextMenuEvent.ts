import type { ViewEvent } from '@lvce-editor/api'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import {
  MenuIdBoard,
  MenuIdCard,
  MenuIdCardDetail,
  MenuIdList,
} from '../MenuEntries.ts'
import { findBoardCard } from './FindBoardCard.ts'

const cardPrefix = 'card:'
const listPrefix = 'list:'

type ContextMenuEvent = Readonly<
  ViewEvent & {
    readonly x?: unknown
    readonly y?: unknown
  }
>

const setContextMenuTarget = (
  state: TrelloViewState,
  listId: string,
  cardId = '',
): void => {
  state.contextMenuListId = listId
  state.contextMenuCardId = cardId
}

const getCardDetailMenuId = (state: TrelloViewState): string => {
  const card = state.selectedCardDetail?.card
  if (!card) {
    return ''
  }
  setContextMenuTarget(state, card.idList || '', card.id)
  return MenuIdCardDetail
}

const getMenuId = (state: TrelloViewState, name: string | undefined): string => {
  if (!name || name === 'boards') {
    setContextMenuTarget(state, '', '')
    return MenuIdBoard
  }
  if (name.startsWith(cardPrefix)) {
    const cardId = name.slice(cardPrefix.length)
    const card = findBoardCard(state, cardId)
    if (!card) {
      return ''
    }
    setContextMenuTarget(state, card.idList || '', card.id)
    return MenuIdCard
  }
  if (name.startsWith(listPrefix)) {
    setContextMenuTarget(state, name.slice(listPrefix.length), '')
    return MenuIdList
  }
  if (name === 'cardDetail' || name === 'cardTitle' || name === 'cardDescription' || name === 'editCardDescription') {
    return getCardDetailMenuId(state)
  }
  return ''
}

export const handleContextMenuEvent = async (
  context: TrelloViewActionContext,
  event: ContextMenuEvent,
): Promise<void> => {
  if (typeof event.x !== 'number' || typeof event.y !== 'number') {
    return
  }
  const state = context.state as TrelloViewState
  const menuId = getMenuId(state, event.name)
  if (!menuId) {
    return
  }
  await context.showContextMenu(menuId, event.x, event.y)
}
