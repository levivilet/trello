import type {
  View,
  ViewContext,
  ViewEvent,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import {
  createCacheCredentialStorage,
  type CredentialStorage,
} from '../CredentialStorage/CredentialStorage.ts'
import {
  createTrelloClient,
  type TrelloClient,
} from '../TrelloClient/TrelloClient.ts'
import * as Dom from '../VirtualDom/VirtualDom.ts'

export const viewId = 'trello.views.boards'

interface TrelloViewDependencies {
  readonly client: TrelloClient
  readonly storage: CredentialStorage
}

interface TrelloViewState {
  boardDetail: TrelloBoardDetail | undefined
  boards: readonly TrelloBoard[]
  credentials: TrelloCredentials | undefined
  draftApiKey: string
  draftToken: string
  error: string
  loading: boolean
}

type DependencyFactory = () => TrelloViewDependencies

const defaultDependencyFactory = (): TrelloViewDependencies => ({
  client: createTrelloClient(),
  storage: createCacheCredentialStorage(),
})

const dependencyState: { factory: DependencyFactory } = {
  factory: defaultDependencyFactory,
}

export const setTrelloViewDependencyFactory = (
  factory: DependencyFactory,
): void => {
  dependencyState.factory = factory
}

export const resetTrelloViewDependencyFactory = (): void => {
  dependencyState.factory = defaultDependencyFactory
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

const renderError = (error: string): readonly Dom.TreeNode[] => {
  if (!error) {
    return []
  }
  return [Dom.div('TrelloError', [Dom.textNode(error)])]
}

const renderTitle = (text: string): Dom.TreeNode => {
  return Dom.node(VirtualDomElements.H2, { className: 'TrelloTitle' }, [
    Dom.textNode(text),
  ])
}

const renderListTitle = (text: string): Dom.TreeNode => {
  return Dom.node(VirtualDomElements.H3, { className: 'TrelloListTitle' }, [
    Dom.textNode(text),
  ])
}

const renderToolbar = (children: readonly Dom.TreeNode[]): Dom.TreeNode => {
  return Dom.div('TrelloToolbar', children)
}

const renderField = (
  label: string,
  name: string,
  value: string,
): Dom.TreeNode => {
  return Dom.div('TrelloField', [
    Dom.textNode(label),
    Dom.input(name, value, label),
  ])
}

const renderAuth = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const title = renderTitle('Trello')
  const apiKey = renderField('API key', 'apiKey', state.draftApiKey)
  const token = renderField('Token', 'token', state.draftToken)
  const connect = Dom.button(
    'connect',
    state.loading ? 'Connecting...' : 'Connect',
  )
  return Dom.flatten(
    Dom.div('TrelloView TrelloAuth', [
      title,
      apiKey,
      token,
      connect,
      ...renderError(state.error),
    ]),
  )
}

const renderBoardContent = (
  state: Readonly<TrelloViewState>,
  boardItems: readonly Dom.TreeNode[],
): readonly Dom.TreeNode[] => {
  if (state.loading) {
    return [Dom.textNode('Loading boards...')]
  }
  if (state.boards.length === 0) {
    return [Dom.textNode('No boards found')]
  }
  return boardItems
}

const renderBoards = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const boardItems = state.boards.map((board) => {
    return Dom.button(`board:${board.id}`, board.name, 'TrelloBoardButton')
  })
  const toolbar = renderToolbar([
    Dom.button('refreshBoards', 'Refresh'),
    Dom.button('logout', 'Sign out'),
  ])
  const children = [
    toolbar,
    renderTitle('Boards'),
    ...renderBoardContent(state, boardItems),
    ...renderError(state.error),
  ]
  return Dom.flatten(Dom.div('TrelloView TrelloBoards', children))
}

const renderCards = (
  cards: readonly { readonly name: string }[],
): readonly Dom.TreeNode[] => {
  if (cards.length === 0) {
    return [Dom.textNode('No cards')]
  }
  return cards.map((card) => {
    return Dom.div('TrelloCard', [Dom.textNode(card.name)])
  })
}

const renderBoardDetailContent = (
  state: Readonly<TrelloViewState>,
  lists: readonly Dom.TreeNode[],
): readonly Dom.TreeNode[] => {
  if (state.loading) {
    return [Dom.textNode('Loading board...')]
  }
  return lists
}

const renderBoardDetail = (
  state: Readonly<TrelloViewState>,
  detail: TrelloBoardDetail,
): readonly VirtualDomNode[] => {
  const lists = detail.lists.map((list) => {
    const cards = renderCards(list.cards)
    return Dom.div('TrelloList', [renderListTitle(list.name), ...cards])
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
  return Dom.flatten(Dom.div('TrelloView TrelloBoardDetail', children))
}

const createInitialState = (): TrelloViewState => {
  return {
    boardDetail: undefined,
    boards: [],
    credentials: undefined,
    draftApiKey: '',
    draftToken: '',
    error: '',
    loading: false,
  }
}

const createInstance = async (
  context?: ViewContext,
): Promise<VirtualDomViewInstance> => {
  const { client, storage } = dependencyState.factory()
  const state = createInitialState()

  const requestRerender = (): void => {
    // @ts-ignore
    const request = context?.requestRerender
    if (!request) {
      return
    }
    globalThis.setTimeout(() => {
      void request()
    }, 0)
  }

  const loadBoards = async (rerender = true): Promise<void> => {
    if (!state.credentials) {
      return
    }
    state.loading = true
    state.error = ''
    state.boardDetail = undefined
    try {
      state.boards = await client.listBoards(state.credentials)
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.loading = false
    }
    if (rerender) {
      requestRerender()
    }
  }

  const storedCredentials = await storage.read()
  if (storedCredentials) {
    state.credentials = storedCredentials
    state.draftApiKey = storedCredentials.apiKey
    state.draftToken = storedCredentials.token
    await loadBoards(false)
  }

  const connect = async (): Promise<void> => {
    if (!state.draftApiKey || !state.draftToken) {
      state.error = 'Enter an API key and token.'
      requestRerender()
      return
    }
    state.credentials = {
      apiKey: state.draftApiKey,
      token: state.draftToken,
    }
    await storage.write(state.credentials)
    await loadBoards()
  }

  const openBoard = async (boardId: string): Promise<void> => {
    if (!state.credentials) {
      return
    }
    const board = state.boards.find((item) => item.id === boardId)
    if (!board) {
      state.error = `Board not found: ${boardId}`
      return
    }
    state.loading = true
    state.error = ''
    try {
      state.boardDetail = await client.getBoardDetail(board, state.credentials)
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.loading = false
    }
    requestRerender()
  }

  const logout = async (): Promise<void> => {
    await storage.delete()
    Object.assign(state, createInitialState())
    requestRerender()
  }

  const goBackToBoards = (): void => {
    state.boardDetail = undefined
    state.error = ''
    requestRerender()
  }

  const handleInputEvent = (event: Readonly<ViewEvent>): void => {
    if (event.name === 'apiKey') {
      state.draftApiKey = typeof event.value === 'string' ? event.value : ''
      return
    }
    if (event.name === 'token') {
      state.draftToken = typeof event.value === 'string' ? event.value : ''
    }
  }

  const handleClickEvent = async (
    event: Readonly<ViewEvent>,
  ): Promise<void> => {
    switch (event.name) {
      case 'backToBoards':
        goBackToBoards()
        return
      case 'connect':
        await connect()
        return
      case 'logout':
        await logout()
        return
      case 'refreshBoards':
        await loadBoards()
        return
      default:
        if (event.name?.startsWith('board:')) {
          await openBoard(event.name.slice('board:'.length))
        }
    }
  }

  return {
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'input') {
        handleInputEvent(event)
        return
      }
      if (event.type === 'click') {
        await handleClickEvent(event)
      }
    },
    render(): readonly VirtualDomNode[] {
      if (!state.credentials) {
        return renderAuth(state)
      }
      if (state.boardDetail) {
        return renderBoardDetail(state, state.boardDetail)
      }
      return renderBoards(state)
    },
    saveState(): unknown {
      return {
        boardId: state.boardDetail?.board.id,
        isAuthenticated: Boolean(state.credentials),
      }
    },
  }
}

export const view: View = {
  create: createInstance,
  // @ts-ignore
  displayName: 'Trello',
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  title: 'Trello',
}
