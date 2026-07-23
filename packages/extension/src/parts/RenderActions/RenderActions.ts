import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export interface ViewAction {
  readonly command: string
  readonly icon: string
  readonly title: string
}

const actionBackToBoards: ViewAction = {
  command: 'trello.backToBoards',
  icon: 'ArrowLeft',
  title: TrelloStrings.backToBoards(),
}

const actionRefreshBoards: ViewAction = {
  command: 'trello.refreshBoards',
  icon: 'Refresh',
  title: TrelloStrings.refreshBoards(),
}

const actionSignOut: ViewAction = {
  command: 'trello.logout',
  icon: 'Account',
  title: TrelloStrings.signOut(),
}

export const renderActions = (
  state: Readonly<TrelloViewState>,
): readonly ViewAction[] => {
  const { boardDetail, credentials } = state
  if (!credentials) {
    return []
  }
  if (boardDetail) {
    return [actionBackToBoards, actionRefreshBoards, actionSignOut]
  }
  return [actionRefreshBoards, actionSignOut]
}
