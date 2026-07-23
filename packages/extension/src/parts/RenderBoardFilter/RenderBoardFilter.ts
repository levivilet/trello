import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

const renderBoardFilterButton = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen, draftBoardFilter } = state
  return [
    {
      'aria-expanded': boardFilterOpen,
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloBoardFilterButton',
        draftBoardFilter ? 'TrelloBoardFilterButtonActive' : '',
      ),
      name: 'openBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(TrelloStrings.filter()),
  ]
}

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

export const renderBoardFilter = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const popup = renderBoardFilterPopup(state)
  return [
    {
      childCount: 1,
      className: 'TrelloBoardHeader',
      type: VirtualDomElements.Div,
    },
    ...renderBoardFilterButton(state),
    ...popup,
  ]
}
