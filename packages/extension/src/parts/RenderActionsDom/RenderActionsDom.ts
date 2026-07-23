import {
  AriaRoles,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

interface ViewAction {
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

const renderAction = (action: ViewAction): readonly VirtualDomNode[] => {
  return [
    {
      'data-command': action.command,
      childCount: 1,
      className: 'IconButton',
      title: action.title,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: `MaskIcon MaskIcon${action.icon}`,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ]
}

export const renderActionsDom = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { boardDetail, credentials } = state
  if (!credentials) {
    return []
  }
  const actions = boardDetail
    ? [actionBackToBoards, actionRefreshBoards, actionSignOut]
    : [actionRefreshBoards, actionSignOut]
  return [
    {
      childCount: actions.length,
      className: 'Actions',
      role: AriaRoles.ToolBar,
      type: VirtualDomElements.Div,
    },
    ...actions.flatMap(renderAction),
  ]
}
