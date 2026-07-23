import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  TrelloBoard,
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import {
  getRecentlyViewedBoards,
  getWorkspaceSections,
  type WorkspaceSection,
} from '../BoardSections/BoardSections.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderError } from '../RenderError/RenderError.ts'
import { renderListTitle } from '../RenderListTitle/RenderListTitle.ts'
import { renderTitle } from '../RenderTitle/RenderTitle.ts'
import { renderToolbar } from '../RenderToolbar/RenderToolbar.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

interface VirtualDomSegment {
  readonly childCount: number
  readonly dom: readonly VirtualDomNode[]
}

const renderSearchForm = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftSearchQuery } = state
  return [
    {
      childCount: 1,
      className: 'TrelloSearchForm',
      name: 'search',
      onSubmit: DomEventListenerFunctions.HandleSubmit,
      type: VirtualDomElements.Form,
    },
    {
      childCount: 0,
      className: 'TrelloInput',
      name: 'search',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: TrelloStrings.searchTrello(),
      type: VirtualDomElements.Input,
      value: draftSearchQuery,
    },
  ]
}

const renderSearchToolbar = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { searchEnabled } = state
  if (!searchEnabled) {
    return []
  }
  return renderToolbar([renderSearchForm(state)])
}

const renderBoardButton = (
  board: Readonly<TrelloBoard>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloBoardButton',
      name: `board:${board.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(board.name),
  ]
}

const renderBoardGrid = (
  boards: readonly TrelloBoard[],
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: boards.length,
      className: 'TrelloBoardGrid',
      type: VirtualDomElements.Div,
    },
    ...boards.flatMap(renderBoardButton),
  ]
}

const renderRecentlyViewed = (
  boards: readonly TrelloBoard[],
): VirtualDomSegment => {
  if (boards.length === 0) {
    return { childCount: 0, dom: [] }
  }
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'TrelloSection',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(TrelloStrings.recentlyViewed()),
      ...renderBoardGrid(boards),
    ],
  }
}

const renderWorkspaceSection = (
  section: Readonly<WorkspaceSection>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloWorkspace',
      type: VirtualDomElements.Div,
    },
    ...renderListTitle(section.name),
    ...renderBoardGrid(section.boards),
  ]
}

const renderSearchResult = (
  result: Readonly<TrelloSearchResult>,
): readonly VirtualDomNode[] => {
  if (result.type === 'board') {
    return [
      {
        childCount: 1,
        className: 'TrelloSearchResult',
        name: `board:${result.id}`,
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(TrelloStrings.boardSearchResult(result.name)),
    ]
  }
  return [
    {
      childCount: 1,
      className: 'TrelloSearchResult',
      type: VirtualDomElements.Div,
    },
    text(TrelloStrings.cardSearchResult(result.name)),
  ]
}

const renderSearchContent = (
  state: Readonly<TrelloViewState>,
): VirtualDomSegment => {
  const { activeSearchQuery, loading, searchResults } = state
  if (loading) {
    return { childCount: 1, dom: [text(TrelloStrings.searching())] }
  }
  if (searchResults.length === 0) {
    return {
      childCount: 2,
      dom: [
        ...renderListTitle(TrelloStrings.searchResultsFor(activeSearchQuery)),
        text(TrelloStrings.noSearchResults()),
      ],
    }
  }
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'TrelloSearchSection',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(TrelloStrings.searchResultsFor(activeSearchQuery)),
      {
        childCount: searchResults.length,
        className: 'TrelloSearchResults',
        type: VirtualDomElements.Div,
      },
      ...searchResults.flatMap(renderSearchResult),
    ],
  }
}

const renderBoardContent = (
  state: Readonly<TrelloViewState>,
): VirtualDomSegment => {
  const { activeSearchQuery, boards, loading } = state
  if (activeSearchQuery) {
    return renderSearchContent(state)
  }
  if (loading) {
    return { childCount: 1, dom: [text(TrelloStrings.loadingBoards())] }
  }
  if (boards.length === 0) {
    return { childCount: 1, dom: [text(TrelloStrings.noBoardsFound())] }
  }
  const recentBoards = getRecentlyViewedBoards(state)
  const workspaceSections = getWorkspaceSections(state)
  const recentlyViewed = renderRecentlyViewed(recentBoards)
  return {
    childCount: recentlyViewed.childCount + 1,
    dom: [
      ...recentlyViewed.dom,
      {
        childCount: 1 + workspaceSections.length,
        className: 'TrelloWorkspaces',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(TrelloStrings.yourWorkspaces()),
      ...workspaceSections.flatMap(renderWorkspaceSection),
    ],
  }
}

export const renderBoards = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { error, searchEnabled } = state
  const boardContent = renderBoardContent(state)
  const errorDom = renderError(error)
  return [
    {
      childCount:
        1 +
        boardContent.childCount +
        (searchEnabled ? 1 : 0) +
        (errorDom.length > 0 ? 1 : 0),
      className: MergeClassNames.mergeClassNames('TrelloView', 'TrelloBoards'),
      name: 'boards',
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      type: VirtualDomElements.Div,
    },
    ...renderSearchToolbar(state),
    ...renderTitle(TrelloStrings.boards()),
    ...boardContent.dom,
    ...errorDom,
  ]
}
