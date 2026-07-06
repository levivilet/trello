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
import { cancelAddCard, submitAddCard } from './actions/AddCard.ts'
import { closeCardDetail as closeCardDetailAction } from './actions/CloseCardDetail.ts'
import { goBackToBoards } from './actions/GoBackToBoards.ts'
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
import { saveCardDetail as saveCardDetailAction } from './actions/SaveCardDetail.ts'
import { renderAuth } from './render/RenderAuth.ts'
import { renderBoardDetail } from './render/RenderBoardDetail.ts'
import { renderBoards } from './render/RenderBoards.ts'
import { createInitialState } from './state/CreateInitialState.ts'
import { dependencyState } from './state/DependencyFactory.ts'
import { updateContext } from './state/UpdateContext.ts'

interface ActiveTrelloViewInstance extends VirtualDomViewInstance {
  readonly backToBoards: () => Promise<void>
  readonly cancelNewCard: () => void
  readonly closeCardDetail: () => void
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly refreshBoards: () => Promise<void>
  readonly reload: () => Promise<void>
  readonly saveCardDetail: () => Promise<void>
  readonly submitNewCard: () => Promise<void>
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

const getActiveInstance = (): ActiveTrelloViewInstance | undefined => {
  let activeInstance: ActiveTrelloViewInstance | undefined
  for (const instance of activeInstances) {
    activeInstance = instance
  }
  return activeInstance
}

export const backToBoardsActiveTrelloViewInstance = async (): Promise<void> => {
  await getActiveInstance()?.backToBoards()
}

export const cancelNewCardActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.cancelNewCard()
}

export const closeCardDetailActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.closeCardDetail()
}

export const refreshBoardsActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.refreshBoards()
  }

export const saveCardDetailActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.saveCardDetail()
  }

export const submitNewCardActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.submitNewCard()
  }

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
    updateContext(state)
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
    updateContext(state)
    if (rerender) {
      requestRerender()
    }
  }

  await initialize(false)

  const instance: ActiveTrelloViewInstance = {
    async backToBoards(): Promise<void> {
      await goBackToBoards(viewContext)
      updateContext(state)
    },
    cancelNewCard(): void {
      cancelAddCard(viewContext)
      updateContext(state)
    },
    closeCardDetail(): void {
      closeCardDetailAction(viewContext)
      updateContext(state)
    },
    async dispose(): Promise<void> {
      activeInstances.delete(instance)
    },
    getContext(): Readonly<Record<string, boolean>> {
      return state.context
    },
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      activeInstances.delete(instance)
      activeInstances.add(instance)
      try {
        if (event.type === 'focus') {
          state.focusedName = event.name || ''
          return
        }
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
          if (!event.name || state.focusedName === event.name) {
            state.focusedName = ''
          }
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
      } finally {
        updateContext(state)
      }
    },
    async refreshBoards(): Promise<void> {
      await loadBoards(viewContext)
      updateContext(state)
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
    async saveCardDetail(): Promise<void> {
      await saveCardDetailAction(viewContext)
      updateContext(state)
    },
    saveState(): unknown {
      return {
        boardId: state.boardDetail?.board.id,
        cardId: state.selectedCardDetail?.card.id,
        isAuthenticated: Boolean(state.credentials),
      }
    },
    async submitNewCard(): Promise<void> {
      if (!state.addingCardListId) {
        return
      }
      await submitAddCard(viewContext, `addCard:${state.addingCardListId}`)
      updateContext(state)
    },
  }
  activeInstances.add(instance)
  return instance
}
