import {
  AriaRoles,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
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
      childCount: 1,
      className: 'IconButton',
      'data-command': action.command,
      title: action.title,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'MaskIcon',
        `MaskIcon${action.icon}`,
      ),
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ]
}

const renderBoardFilterAction = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen, draftBoardFilter } = state
  return [
    {
      'aria-expanded': boardFilterOpen,
      'aria-label': TrelloStrings.filterCards(),
      childCount: 1,
      className: draftBoardFilter
        ? MergeClassNames.mergeClassNames(
            'IconButton',
            'TrelloBoardFilterActionActive',
          )
        : 'IconButton',
      name: 'openBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      title: TrelloStrings.filterCards(),
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames('MaskIcon', 'MaskIconFilter'),
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
    ? [
        renderAction(actionBackToBoards),
        renderAction(actionRefreshBoards),
        renderBoardFilterAction(state),
        renderAction(actionSignOut),
      ]
    : [renderAction(actionRefreshBoards), renderAction(actionSignOut)]
  return [
    {
      childCount: actions.length,
      className: 'Actions',
      role: AriaRoles.ToolBar,
      type: VirtualDomElements.Div,
    },
    ...actions.flat(),
  ]
}
