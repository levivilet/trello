import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  TrelloBoardDetail,
  TrelloList,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../MergeClassNames/MergeClassNames.ts'
import { getBoardBackgroundClassName } from './BoardBackground.ts'
import { renderCardDetailPanel } from './RenderCardDetailPanel.ts'
import { renderCards } from './RenderCards.ts'
import { renderError } from './RenderError/RenderError.ts'

const renderListTitleInput = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): VirtualDomNode => {
  const { draftListTitles } = state
  return {
    childCount: 0,
    className: 'TrelloListTitleInput',
    name: `listTitle:${list.id}`,
    onBlur: DomEventListenerFunctions.HandleBlur,
    onFocus: DomEventListenerFunctions.HandleFocus,
    onInput: DomEventListenerFunctions.HandleInput,
    type: VirtualDomElements.Input,
    value: draftListTitles[list.id] ?? list.name,
  }
}

const renderListHeader = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloListHeader',
      type: VirtualDomElements.Div,
    },
    renderListTitleInput(state, list),
    {
      childCount: 1,
      className: 'TrelloListCardCount',
      type: VirtualDomElements.Div,
    },
    text(String(list.cards.length)),
  ]
}

const renderAddCardButton = (
  list: Readonly<TrelloList>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloAddCardButton',
      name: `addCard:${list.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('+ Add a card'),
  ]
}

const renderAddCardActions = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): readonly VirtualDomNode[] => {
  const { savingNewCard } = state
  return [
    {
      childCount: 2,
      className: 'TrelloAddCardActions',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloAddCardSubmitButton',
      ),
      disabled: savingNewCard,
      inputType: 'button',
      name: `submitAddCard:${list.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      onPointerDown: DomEventListenerFunctions.HandleAddCardActionPointerDown,
      type: VirtualDomElements.Button,
    },
    text('Add card'),
    {
      'aria-label': 'Close',
      childCount: 1,
      className: 'TrelloAddCardCloseButton',
      inputType: 'button',
      name: 'cancelAddCard',
      onClick: DomEventListenerFunctions.HandleClick,
      onPointerDown: DomEventListenerFunctions.HandleAddCardActionPointerDown,
      title: 'Close',
      type: VirtualDomElements.Button,
    },
    text('X'),
  ]
}

const renderAddCardInput = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): readonly VirtualDomNode[] => {
  const { draftNewCardTitle, savingNewCard } = state
  return [
    {
      childCount: 2,
      className: 'TrelloAddCardForm',
      name: `addCard:${list.id}`,
      onSubmit: DomEventListenerFunctions.HandleSubmit,
      type: VirtualDomElements.Form,
    },
    {
      autocomplete: 'off',
      childCount: 0,
      className: 'TrelloAddCardInput',
      disabled: savingNewCard,
      name: `newCardTitle:${list.id}`,
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: 'Enter a title for this card',
      rows: 2,
      type: VirtualDomElements.TextArea,
      value: draftNewCardTitle,
    },
    ...renderAddCardActions(state, list),
  ]
}

const renderAddCardControl = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): readonly VirtualDomNode[] => {
  const { addingCardListId } = state
  if (addingCardListId === list.id) {
    return renderAddCardInput(state, list)
  }
  return renderAddCardButton(list)
}

const renderAddListControl = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { addingList, draftNewListTitle, savingNewList } = state
  if (addingList) {
    return [
      {
        childCount: 1,
        className: 'TrelloAddListForm',
        name: 'addList',
        onSubmit: DomEventListenerFunctions.HandleSubmit,
        type: VirtualDomElements.Form,
      },
      {
        autocomplete: 'off',
        childCount: 0,
        className: 'TrelloAddListInput',
        disabled: savingNewList,
        name: 'newListTitle',
        onBlur: DomEventListenerFunctions.HandleBlur,
        onFocus: DomEventListenerFunctions.HandleFocus,
        onInput: DomEventListenerFunctions.HandleInput,
        onKeyDown: DomEventListenerFunctions.HandleKeyDown,
        placeholder: 'Enter list title',
        type: VirtualDomElements.Input,
        value: draftNewListTitle,
      },
    ]
  }
  return [
    {
      childCount: 1,
      className: 'TrelloAddListButton',
      name: 'startAddList',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('Create New list'),
  ]
}

const getListClassName = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): string => {
  const { dragTargetListId } = state
  if (dragTargetListId === list.id) {
    return MergeClassNames.mergeClassNames('TrelloList', 'TrelloListDragTarget')
  }
  return 'TrelloList'
}

const renderList = (
  state: Readonly<TrelloViewState>,
  list: Readonly<TrelloList>,
): readonly VirtualDomNode[] => {
  const { baseUrl, coverImageUrls } = state
  const cards = renderCards(baseUrl, coverImageUrls, list.cards)
  return [
    {
      childCount: 3,
      className: getListClassName(state, list),
      name: `list:${list.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onDragLeave: DomEventListenerFunctions.HandleDragLeave,
      onDragOver: DomEventListenerFunctions.HandleDragOver,
      onDrop: DomEventListenerFunctions.HandleDrop,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    ...renderListHeader(state, list),
    {
      childCount: Math.max(1, list.cards.length),
      className: 'TrelloCards',
      type: VirtualDomElements.Div,
    },
    ...cards,
    ...renderAddCardControl(state, list),
  ]
}

const getCardDetailPanelChildCount = (
  state: Readonly<TrelloViewState>,
): number => {
  const { cardDetailLoading, selectedCardDetail } = state
  if (selectedCardDetail) {
    return 2
  }
  if (cardDetailLoading) {
    return 1
  }
  return 0
}

const renderBoardDetailContent = (
  state: Readonly<TrelloViewState>,
  detail: Readonly<TrelloBoardDetail>,
): readonly VirtualDomNode[] => {
  const { loading } = state
  if (loading) {
    return [text('Loading board...')]
  }
  const cardDetailPanel = renderCardDetailPanel(state)
  const cardDetailPanelChildCount = getCardDetailPanelChildCount(state)
  return [
    {
      childCount: 1 + cardDetailPanelChildCount,
      className: 'TrelloBoardDetailContent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: detail.lists.length + 1,
      className: 'TrelloLists',
      type: VirtualDomElements.Div,
    },
    ...detail.lists.flatMap((list) => renderList(state, list)),
    ...renderAddListControl(state),
    ...cardDetailPanel,
  ]
}

export const renderBoardDetail = (
  state: Readonly<TrelloViewState>,
  detail: Readonly<TrelloBoardDetail>,
): readonly VirtualDomNode[] => {
  const { boardBackgroundEnabled, error } = state
  const content = renderBoardDetailContent(state, detail)
  const errorDom = renderError(error)
  return [
    {
      childCount: 1 + (errorDom.length > 0 ? 1 : 0),
      className: getBoardBackgroundClassName(
        detail.board,
        boardBackgroundEnabled,
      ),
      type: VirtualDomElements.Div,
    },
    ...content,
    ...errorDom,
  ]
}
