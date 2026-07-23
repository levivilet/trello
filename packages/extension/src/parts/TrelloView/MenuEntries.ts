import type { TrelloViewState } from './state/TrelloViewState.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const MenuIdBoard = 'trello.board'
export const MenuIdCard = 'trello.card'
export const MenuIdCardDetail = 'trello.cardDetail'
export const MenuIdList = 'trello.list'

export interface MenuEntry {
  readonly args?: readonly string[]
  readonly command: string
  readonly id: string
  readonly label: string
}

const menuEntryRefreshBoards: MenuEntry = {
  command: 'trello.refreshBoards',
  id: 'refreshBoards',
  label: TrelloStrings.refreshBoards(),
}

const menuEntrySignOut: MenuEntry = {
  command: 'trello.logout',
  id: 'signOut',
  label: TrelloStrings.signOut(),
}

const menuEntryBackToBoards: MenuEntry = {
  command: 'trello.backToBoards',
  id: 'backToBoards',
  label: TrelloStrings.backToBoards(),
}

const menuEntrySaveCard: MenuEntry = {
  command: 'trello.saveCardDetail',
  id: 'saveCard',
  label: TrelloStrings.saveCard(),
}

const menuEntryCloseCard: MenuEntry = {
  command: 'trello.closeCardDetail',
  id: 'closeCard',
  label: TrelloStrings.closeCard(),
}

const getAddCardEntry = (
  state: Readonly<TrelloViewState>,
): readonly MenuEntry[] => {
  if (!state.contextMenuListId) {
    return []
  }
  return [
    {
      args: [state.contextMenuListId],
      command: 'trello.startAddCard',
      id: 'addCard',
      label: TrelloStrings.addCardMenu(),
    },
  ]
}

const getOpenCardEntry = (
  state: Readonly<TrelloViewState>,
): readonly MenuEntry[] => {
  if (!state.contextMenuCardId) {
    return []
  }
  return [
    {
      args: [state.contextMenuCardId],
      command: 'trello.openCard',
      id: 'openCard',
      label: TrelloStrings.openCard(),
    },
  ]
}

export const getMenuEntries = (
  state: Readonly<TrelloViewState>,
  menuId: string,
): readonly MenuEntry[] => {
  switch (menuId) {
    case MenuIdBoard:
      return [menuEntryRefreshBoards, menuEntrySignOut]
    case MenuIdCard:
      return [
        ...getOpenCardEntry(state),
        ...getAddCardEntry(state),
        menuEntryRefreshBoards,
        menuEntryBackToBoards,
      ]
    case MenuIdCardDetail:
      return [
        menuEntrySaveCard,
        menuEntryCloseCard,
        menuEntryRefreshBoards,
        menuEntryBackToBoards,
      ]
    case MenuIdList:
      return [
        ...getAddCardEntry(state),
        menuEntryRefreshBoards,
        menuEntryBackToBoards,
      ]
    default:
      return []
  }
}
