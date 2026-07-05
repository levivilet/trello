import type {
  ViewContext,
  ViewEvent,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { CredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import type { CurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import type { RecentBoardStorage } from '../RecentBoardStorage/RecentBoardStorage.ts'
import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from './state/TrelloViewState.ts'
import { createMemoryCurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import { handleBlurEvent } from './actions/HandleBlurEvent.ts'
import { handleClickEvent } from './actions/HandleClickEvent.ts'
import {
  handleDragEndEvent,
  handleDragLeaveEvent,
  handleDragOverEvent,
  handleDragStartEvent,
  handleDropEvent,
} from './actions/HandleDragEvent.ts'
import { handleInputEvent } from './actions/HandleInputEvent.ts'
import { handleSubmitEvent } from './actions/HandleSubmitEvent.ts'
import { loadBoards } from './actions/LoadBoards.ts'
import { restoreCurrentBoard } from './actions/RestoreCurrentBoard.ts'
import { renderAuth } from './render/RenderAuth.ts'
import { renderBoardDetail } from './render/RenderBoardDetail.ts'
import { renderBoards } from './render/RenderBoards.ts'
import { createInitialState } from './state/CreateInitialState.ts'
import { dependencyState } from './state/DependencyFactory.ts'

interface ActiveTrelloViewInstance extends VirtualDomViewInstance {
  readonly reload: () => Promise<void>
}

interface MutableTrelloViewActionContext extends TrelloViewActionContext {
  client: TrelloClient
  currentBoardStorage: CurrentBoardStorage
  recentStorage: RecentBoardStorage
  requestRerender: () => void
  state: TrelloViewState
  storage: CredentialStorage
}

const activeInstances = new Set<ActiveTrelloViewInstance>()

export const reloadActiveTrelloViewInstances = async (): Promise<void> => {
  await Promise.all(
    activeInstances.values().map((instance) => {
      return instance.reload()
    }),
  )
}

export const createInstance = async (
  context?: ViewContext,
): Promise<VirtualDomViewInstance> => {
  const state = createInitialState()
  const viewContext: MutableTrelloViewActionContext = {
    client: undefined as never,
    currentBoardStorage: createMemoryCurrentBoardStorage(),
    recentStorage: undefined as never,
    requestRerender: undefined as never,
    state,
    storage: undefined as never,
  }

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

  const initialize = async (rerender: boolean): Promise<void> => {
    const dependencies = dependencyState.factory()
    const {
      client,
      readBoardBackgroundEnabled,
      readSearchEnabled,
      recentStorage,
      storage,
    } = dependencies
    const currentBoardStorage =
      dependencies.currentBoardStorage || createMemoryCurrentBoardStorage()

    Object.assign(state, createInitialState())
    viewContext.client = client
    viewContext.currentBoardStorage = currentBoardStorage
    viewContext.recentStorage = recentStorage
    viewContext.requestRerender = requestRerender
    viewContext.storage = storage

    if (readSearchEnabled) {
      state.searchEnabled = await readSearchEnabled()
    }
    if (readBoardBackgroundEnabled) {
      state.boardBackgroundEnabled = await readBoardBackgroundEnabled()
    }
    state.recentBoardViews = await recentStorage.read()
    const storedCredentials = await storage.read()
    if (storedCredentials) {
      state.credentials = storedCredentials
      state.draftApiKey = storedCredentials.apiKey
      state.draftToken = storedCredentials.token
      await loadBoards(viewContext, false)
      await restoreCurrentBoard(viewContext)
    }
    if (rerender) {
      requestRerender()
    }
  }

  await initialize(false)

  const instance: ActiveTrelloViewInstance = {
    async dispose(): Promise<void> {
      activeInstances.delete(instance)
    },
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'input') {
        handleInputEvent(state, event)
        return
      }
      if (event.type === 'click') {
        await handleClickEvent(viewContext, event)
        return
      }
      if (event.type === 'contextmenu') {
        return
      }
      if (event.type === 'submit') {
        await handleSubmitEvent(viewContext, event)
        return
      }
      if (event.type === 'blur') {
        await handleBlurEvent(viewContext, event)
        return
      }
      if (event.type === 'dragstart') {
        handleDragStartEvent(viewContext, event)
        return
      }
      if (event.type === 'dragover') {
        handleDragOverEvent(viewContext, event)
        return
      }
      if (event.type === 'dragleave') {
        handleDragLeaveEvent(viewContext)
        return
      }
      if (event.type === 'dragend') {
        handleDragEndEvent(viewContext)
        return
      }
      if (event.type === 'drop') {
        await handleDropEvent(viewContext, event)
      }
    },
    async reload(): Promise<void> {
      await initialize(true)
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
        cardId: state.selectedCardDetail?.card.id,
        isAuthenticated: Boolean(state.credentials),
      }
    },
  }
  activeInstances.add(instance)
  return instance
}
