import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloBoardDetail } from '../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../state/TrelloViewState.ts'
import * as Dom from '../../VirtualDom/VirtualDom.ts'
import {
  getBoardBackgroundClassName,
  getBoardBackgroundStyle,
} from './BoardBackground.ts'
import { renderCardDetailPanel } from './RenderCardDetailPanel.ts'
import { renderCards } from './RenderCards.ts'
import {
  renderError,
  renderListTitle,
  renderTitle,
  renderToolbar,
} from './RenderShared.ts'

const renderBoardDetailContent = (
  state: Readonly<TrelloViewState>,
  lists: readonly Dom.TreeNode[],
): readonly Dom.TreeNode[] => {
  if (state.loading) {
    return [Dom.textNode('Loading board...')]
  }
  return [
    Dom.div('TrelloBoardDetailContent', [
      Dom.div('TrelloLists', lists),
      ...renderCardDetailPanel(state),
    ]),
  ]
}

export const renderBoardDetail = (
  state: Readonly<TrelloViewState>,
  detail: TrelloBoardDetail,
): readonly VirtualDomNode[] => {
  const lists = detail.lists.map((list) => {
    const cards = renderCards(list.cards)
    return Dom.div('TrelloList', [
      renderListTitle(list.name),
      Dom.div('TrelloCards', cards),
    ])
  })
  const toolbar = renderToolbar([
    Dom.button('backToBoards', 'Back'),
    Dom.button('logout', 'Sign out'),
  ])
  const children = [
    toolbar,
    renderTitle(detail.board.name),
    ...renderBoardDetailContent(state, lists),
    ...renderError(state.error),
  ]
  return Dom.flatten(
    Dom.node(
      VirtualDomElements.Div,
      {
        className: getBoardBackgroundClassName(
          detail.board,
          state.boardBackgroundEnabled,
        ),
        style: getBoardBackgroundStyle(
          detail.board,
          state.boardBackgroundEnabled,
        ),
      },
      children,
    ),
  )
}
