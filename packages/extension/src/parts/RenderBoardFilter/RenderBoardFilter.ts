import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

const renderBoardFilterPopup = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen, draftBoardFilter } = state
  if (!boardFilterOpen) {
    return []
  }
  return [
    {
      'aria-label': TrelloStrings.filterCards(),
      childCount: 3,
      className: 'TrelloBoardFilterPopup',
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'TrelloBoardFilterPopupHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloBoardFilterPopupTitle',
      type: VirtualDomElements.Div,
    },
    text(TrelloStrings.filter()),
    {
      'aria-label': TrelloStrings.close(),
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloBoardFilterCloseButton',
      ),
      name: 'closeBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      title: TrelloStrings.close(),
      type: VirtualDomElements.Button,
    },
    text('x'),
    {
      childCount: 2,
      className: 'TrelloBoardFilterField',
      type: VirtualDomElements.Label,
    },
    {
      childCount: 1,
      className: 'TrelloBoardFilterLabel',
      type: VirtualDomElements.Span,
    },
    text(TrelloStrings.keyword()),
    {
      autocomplete: 'off',
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloInput',
        'TrelloBoardFilterInput',
      ),
      name: 'boardFilter',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: TrelloStrings.filterCards(),
      type: VirtualDomElements.Input,
      value: draftBoardFilter,
    },
    {
      childCount: 1,
      className: 'TrelloBoardFilterHint',
      type: VirtualDomElements.Div,
    },
    text(TrelloStrings.filterCardsHint()),
  ]
}

const renderBoardFilterOverlay = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen } = state
  if (!boardFilterOpen) {
    return []
  }
  return [
    {
      childCount: 0,
      className: 'TrelloBoardFilterOverlay',
      name: 'closeBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ]
}

export const renderBoardFilter = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const overlay = renderBoardFilterOverlay(state)
  const popup = renderBoardFilterPopup(state)
  return [...overlay, ...popup]
}
