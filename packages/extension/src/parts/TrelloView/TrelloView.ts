import type { View, ViewEvent, VirtualDomViewInstance } from '@lvce-editor/api'
import { VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { createCacheCredentialStorage, type CredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import { createTrelloClient, type TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type { TrelloBoard, TrelloBoardDetail, TrelloCredentials } from '../TrelloTypes/TrelloTypes.ts'
import * as Dom from '../VirtualDom/VirtualDom.ts'

export const viewId = 'trello.views.boards'

interface TrelloViewDependencies {
  readonly client: TrelloClient
  readonly storage: CredentialStorage
}

interface TrelloViewState {
  boardDetail?: TrelloBoardDetail
  boards: readonly TrelloBoard[]
  credentials?: TrelloCredentials
  draftApiKey: string
  draftToken: string
  error: string
  loading: boolean
}

type DependencyFactory = () => TrelloViewDependencies

let dependencyFactory: DependencyFactory = () => ({
  client: createTrelloClient(),
  storage: createCacheCredentialStorage(),
})

export const setTrelloViewDependencyFactory = (factory: DependencyFactory): void => {
  dependencyFactory = factory
}

export const resetTrelloViewDependencyFactory = (): void => {
  dependencyFactory = () => ({
    client: createTrelloClient(),
    storage: createCacheCredentialStorage(),
  })
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return `${error}`
}

const renderError = (error: string): readonly Dom.TreeNode[] => {
  if (!error) {
    return []
  }
  return [Dom.div('TrelloError', [Dom.textNode(error)])]
}

const renderAuth = (state: TrelloViewState): readonly VirtualDomNode[] => {
  return Dom.flatten(
    Dom.div('TrelloView TrelloAuth', [
      Dom.node(VirtualDomElements.H2, { className: 'TrelloTitle' }, [Dom.textNode('Trello')]),
      Dom.div('TrelloField', [Dom.textNode('API key'), Dom.input('apiKey', state.draftApiKey, 'API key')]),
      Dom.div('TrelloField', [Dom.textNode('Token'), Dom.input('token', state.draftToken, 'Token')]),
      Dom.button('connect', state.loading ? 'Connecting...' : 'Connect'),
      ...renderError(state.error),
    ]),
  )
}

const renderBoards = (state: TrelloViewState): readonly VirtualDomNode[] => {
  const boardItems = state.boards.map((board) => {
    return Dom.button(`board:${board.id}`, board.name, 'TrelloBoardButton')
  })
  return Dom.flatten(
    Dom.div('TrelloView TrelloBoards', [
      Dom.div('TrelloToolbar', [Dom.button('refreshBoards', 'Refresh'), Dom.button('logout', 'Sign out')]),
      Dom.node(VirtualDomElements.H2, { className: 'TrelloTitle' }, [Dom.textNode('Boards')]),
      ...(state.loading ? [Dom.textNode('Loading boards...')] : boardItems),
      ...(!state.loading && state.boards.length === 0 ? [Dom.textNode('No boards found')] : []),
      ...renderError(state.error),
    ]),
  )
}

const renderBoardDetail = (state: TrelloViewState, detail: TrelloBoardDetail): readonly VirtualDomNode[] => {
  const lists = detail.lists.map((list) => {
    const cards = list.cards.length === 0 ? [Dom.textNode('No cards')] : list.cards.map((card) => Dom.div('TrelloCard', [Dom.textNode(card.name)]))
    return Dom.div('TrelloList', [Dom.node(VirtualDomElements.H3, { className: 'TrelloListTitle' }, [Dom.textNode(list.name)]), ...cards])
  })
  return Dom.flatten(
    Dom.div('TrelloView TrelloBoardDetail', [
      Dom.div('TrelloToolbar', [Dom.button('backToBoards', 'Back'), Dom.button('logout', 'Sign out')]),
      Dom.node(VirtualDomElements.H2, { className: 'TrelloTitle' }, [Dom.textNode(detail.board.name)]),
      ...(state.loading ? [Dom.textNode('Loading board...')] : lists),
      ...renderError(state.error),
    ]),
  )
}

const createInitialState = (): TrelloViewState => {
  return {
    boards: [],
    draftApiKey: '',
    draftToken: '',
    error: '',
    loading: false,
  }
}

const createInstance = async (): Promise<VirtualDomViewInstance> => {
  const { client, storage } = dependencyFactory()
  const state = createInitialState()

  const loadBoards = async (): Promise<void> => {
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
  }

  const storedCredentials = await storage.read()
  if (storedCredentials) {
    state.credentials = storedCredentials
    state.draftApiKey = storedCredentials.apiKey
    state.draftToken = storedCredentials.token
    await loadBoards()
  }

  const connect = async (): Promise<void> => {
    if (!state.draftApiKey || !state.draftToken) {
      state.error = 'Enter an API key and token.'
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
  }

  return {
    async handleEvent(event: ViewEvent): Promise<void> {
      if (event.type === 'input' && event.name === 'apiKey') {
        state.draftApiKey = typeof event.value === 'string' ? event.value : ''
        return
      }
      if (event.type === 'input' && event.name === 'token') {
        state.draftToken = typeof event.value === 'string' ? event.value : ''
        return
      }
      if (event.type === 'click' && event.name === 'connect') {
        await connect()
        return
      }
      if (event.type === 'click' && event.name === 'logout') {
        await storage.delete()
        Object.assign(state, createInitialState())
        return
      }
      if (event.type === 'click' && event.name === 'refreshBoards') {
        await loadBoards()
        return
      }
      if (event.type === 'click' && event.name === 'backToBoards') {
        state.boardDetail = undefined
        state.error = ''
        return
      }
      if (event.type === 'click' && event.name?.startsWith('board:')) {
        await openBoard(event.name.slice('board:'.length))
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
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  title: 'Trello',
}
