import type {
  ViewContext,
  ViewEvent,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { CredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import type { CurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import type { RecentBoardStorage } from '../RecentBoardStorage/RecentBoardStorage.ts'
import type { TrelloClient } from '../TrelloClient/TrelloClient.ts'
import type { TrelloImageCache } from '../TrelloImageCache/TrelloImageCache.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'
import {
  cancelAddCard,
  startAddCard,
  submitAddCard,
} from '../AddCard/AddCard.ts'
import { closeBoardFilter as closeBoardFilterAction } from '../BoardFilter/BoardFilter.ts'
import { closeCardDetail as closeCardDetailAction } from '../CloseCardDetail/CloseCardDetail.ts'
import { createInitialState } from '../CreateInitialState/CreateInitialState.ts'
import { createMemoryCurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import { dependencyState } from '../DependencyFactory/DependencyFactory.ts'
import { getCss } from '../GetCss/GetCss.ts'
import { getTitle } from '../GetTitle/GetTitle.ts'
import { goBackToBoards } from '../GoBackToBoards/GoBackToBoards.ts'
import { handleBlurEvent } from '../HandleBlurEvent/HandleBlurEvent.ts'
import { handleClickEvent } from '../HandleClickEvent/HandleClickEvent.ts'
import { handleContextMenuEvent } from '../HandleContextMenuEvent/HandleContextMenuEvent.ts'
import {
  handleDragEndEvent,
  handleDragLeaveEvent,
  handleDragOverEvent,
  handleDragStartEvent,
  handleDropEvent,
} from '../HandleDragEvent/HandleDragEvent.ts'
import { handleFocusEvent } from '../HandleFocusEvent/HandleFocusEvent.ts'
import { handleImageErrorEvent } from '../HandleImageErrorEvent/HandleImageErrorEvent.ts'
import { handleInputEvent } from '../HandleInputEvent/HandleInputEvent.ts'
import { handleKeyDownEvent } from '../HandleKeyDownEvent/HandleKeyDownEvent.ts'
import { handleSubmitEvent } from '../HandleSubmitEvent/HandleSubmitEvent.ts'
import { loadBoards } from '../LoadBoards/LoadBoards.ts'
import { logout } from '../Logout/Logout.ts'
import { type MenuEntry, getMenuEntries } from '../MenuEntries/MenuEntries.ts'
import { openCard } from '../OpenCard/OpenCard.ts'
import {
  renderActions,
  type ViewAction,
} from '../RenderActions/RenderActions.ts'
import { renderAuth } from '../RenderAuth/RenderAuth.ts'
import { renderBoardDetail } from '../RenderBoardDetail/RenderBoardDetail.ts'
import { renderBoards } from '../RenderBoards/RenderBoards.ts'
import {
  resizeCardDetail,
  startResizeCardDetail,
  stopResizeCardDetail,
} from '../ResizeCardDetail/ResizeCardDetail.ts'
import { restoreCurrentBoard } from '../RestoreCurrentBoard/RestoreCurrentBoard.ts'
import { saveCardDetail as saveCardDetailAction } from '../SaveCardDetail/SaveCardDetail.ts'
import { createTrelloImageCache } from '../TrelloImageCache/TrelloImageCache.ts'
import {
  contextKeyCardDescriptionFocus,
  contextKeyCardLabelPickerFocus,
  contextKeyBoardFilterFocus,
  contextKeyNewCardInputFocus,
  contextKeyNewListInputFocus,
  updateContext,
} from '../UpdateContext/UpdateContext.ts'

export interface ActiveTrelloViewInstance extends VirtualDomViewInstance {
  readonly addCard: (options: any) => Promise<void>
  readonly addList: (options: any) => Promise<void>
  readonly backToBoards: () => Promise<void>
  readonly cancelNewCard: () => void
  readonly closeBoardFilter: () => void
  readonly closeCardDetail: () => void
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleAddCardActionPointerDown: () => Promise<void>
  readonly handleCardDescriptionCancelPointerDown: () => Promise<void>
  readonly handleCardLabelPickerPointerDown: () => Promise<void>
  readonly handleDragEnd: () => Promise<void>
  readonly handleDragLeave: () => Promise<void>
  readonly handleDragOver: (name: string) => Promise<void>
  readonly handleDragStart: (name: string) => Promise<void>
  readonly handleDrop: (name: string) => Promise<void>
  readonly handleImageError: (name: string) => Promise<void>
  readonly handleKeyDown: (
    name: string,
    key: string,
    ctrlKey?: boolean,
  ) => Promise<void>
  readonly handleSashPointerDown: (clientX: number) => Promise<void>
  readonly handleSashPointerMove: (clientX: number) => Promise<void>
  readonly handleSashPointerUp: () => Promise<void>
  readonly logout: () => Promise<void>
  readonly openCard: (cardId: string) => Promise<void>
  readonly openMockBoard: (options: any) => Promise<void>
  readonly refreshBoards: () => Promise<void>
  readonly reload: () => Promise<void>
  readonly renderActions: () => readonly ViewAction[]
  readonly renderFocus: (
    oldContext: Readonly<Record<string, boolean>>,
    newContext: Readonly<Record<string, boolean>>,
  ) => string
  readonly renderSelections: () => readonly ViewSelection[]
  readonly renderTitle: () => string
  readonly saveCardDetail: () => Promise<void>
  readonly startAddCard: (listId: string) => void
  readonly submitNewCard: () => Promise<void>
}

interface MutableTrelloViewActionContext extends TrelloViewActionContext {
  client: TrelloClient
  currentBoardStorage: CurrentBoardStorage
  imageCache: TrelloImageCache
  recentStorage: RecentBoardStorage
  requestRerender: () => void
  showContextMenu: (menuId: string, x: number, y: number) => Promise<void>
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

const becameActive = (
  oldContext: Readonly<Record<string, boolean>>,
  newContext: Readonly<Record<string, boolean>>,
  key: string,
): boolean => {
  return !oldContext[key] && newContext[key]
}

export const backToBoardsActiveTrelloViewInstance = async (): Promise<void> => {
  await getActiveInstance()?.backToBoards()
}

export const cancelNewCardActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.cancelNewCard()
}

export const addList = async (options: any): Promise<void> => {
  await getActiveInstance()?.addList(options)
}
export const addCard = async (options: any): Promise<void> => {
  await getActiveInstance()?.addCard(options)
}
export const openMockBoard = async (options: any): Promise<void> => {
  await getActiveInstance()?.openMockBoard(options)
}

export const closeCardDetailActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.closeCardDetail()
}

export const closeBoardFilterActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.closeBoardFilter()
}

export const logoutActiveTrelloViewInstance = async (): Promise<void> => {
  await getActiveInstance()?.logout()
}

export const refreshBoardsActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.refreshBoards()
  }

export const saveCardDetailActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.saveCardDetail()
  }

export const startAddCardActiveTrelloViewInstance = (listId: string): void => {
  getActiveInstance()?.startAddCard(listId)
}

export const openCardActiveTrelloViewInstance = async (
  cardId: string,
): Promise<void> => {
  await getActiveInstance()?.openCard(cardId)
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
): Promise<ActiveTrelloViewInstance> => {
  const state = createInitialState()
  const viewContext: MutableTrelloViewActionContext = {
    client: undefined as never,
    currentBoardStorage: createMemoryCurrentBoardStorage(),
    imageCache: undefined as never,
    recentStorage: undefined as never,
    requestRerender: undefined as never,
    showContextMenu: undefined as never,
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

  const showContextMenu = async (
    menuId: string,
    x: number,
    y: number,
  ): Promise<void> => {
    const request = (context as any)?.showContextMenu
    if (!request) {
      return
    }
    await request(menuId, x, y)
  }

  const initialize = async (rerender: boolean): Promise<void> => {
    const dependencies = dependencyState.factory()
    const {
      client,
      imageCache,
      readBoardBackgroundEnabled,
      readSearchEnabled,
      recentStorage,
      storage,
    } = dependencies
    const currentBoardStorage =
      dependencies.currentBoardStorage || createMemoryCurrentBoardStorage()
    viewContext.imageCache?.dispose()

    Object.assign(state, createInitialState())
    viewContext.client = client
    viewContext.currentBoardStorage = currentBoardStorage
    viewContext.imageCache = imageCache || createTrelloImageCache()
    viewContext.recentStorage = recentStorage
    viewContext.requestRerender = requestRerender
    viewContext.showContextMenu = showContextMenu
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

  const runEventHandler = async (
    handler: () => void | Promise<void>,
  ): Promise<void> => {
    activeInstances.delete(instance)
    activeInstances.add(instance)
    state.pendingSelections = []
    try {
      await handler()
    } finally {
      updateContext(state)
    }
  }

  const instance: ActiveTrelloViewInstance = {
    async addCard({
      listId,
      name,
    }: {
      readonly name: string
      readonly listId: string
    }): Promise<void> {
      // TODO make this one function
      await instance?.handleEvent?.({
        name: 'startAddList',
        type: 'click',
      })
      await instance?.handleEvent?.({
        name: 'newListTitle',
        type: 'input',
        value: name,
      })
      await instance?.handleEvent?.({
        name: 'addList',
        type: 'submit',
      })
    },
    async addList({ name }: { readonly name: string }): Promise<void> {
      // TODO make this one function
      await instance?.handleEvent?.({
        name: 'startAddList',
        type: 'click',
      })
      await instance?.handleEvent?.({
        name: 'newListTitle',
        type: 'input',
        value: name,
      })
      await instance?.handleEvent?.({
        name: 'addList',
        type: 'submit',
      })
    },
    async backToBoards(): Promise<void> {
      await goBackToBoards(viewContext)
      updateContext(state)
    },
    cancelNewCard(): void {
      cancelAddCard(viewContext)
      updateContext(state)
    },
    closeBoardFilter(): void {
      closeBoardFilterAction(viewContext)
      updateContext(state)
    },
    closeCardDetail(): void {
      closeCardDetailAction(viewContext)
      updateContext(state)
    },
    async dispose(): Promise<void> {
      activeInstances.delete(instance)
      viewContext.imageCache.dispose()
    },
    getContext(): Readonly<Record<string, boolean>> {
      return state.context
    },
    getCss(): string {
      return getCss(state)
    },
    getMenuEntries(menuId: string): readonly MenuEntry[] {
      return getMenuEntries(state, menuId)
    },
    async handleAddCardActionPointerDown(): Promise<void> {
      await runEventHandler(() => {})
    },
    async handleCardDescriptionCancelPointerDown(): Promise<void> {
      await runEventHandler(() => {})
    },
    async handleCardLabelPickerPointerDown(): Promise<void> {
      await runEventHandler(() => {})
    },
    async handleDragEnd(): Promise<void> {
      await runEventHandler(() => handleDragEndEvent(viewContext))
    },
    async handleDragLeave(): Promise<void> {
      await runEventHandler(() => handleDragLeaveEvent(viewContext))
    },
    async handleDragOver(name: string): Promise<void> {
      await runEventHandler(() =>
        handleDragOverEvent(viewContext, { name, type: 'dragover' }),
      )
    },
    async handleDragStart(name: string): Promise<void> {
      await runEventHandler(() =>
        handleDragStartEvent(viewContext, { name, type: 'dragstart' }),
      )
    },
    async handleDrop(name: string): Promise<void> {
      await runEventHandler(() =>
        handleDropEvent(viewContext, { name, type: 'drop' }),
      )
    },
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      await runEventHandler(async () => {
        if (event.type === 'focus') {
          handleFocusEvent(viewContext, event)
          return
        }
        if (event.type === 'input') {
          await handleInputEvent(viewContext, event)
          return
        }
        if (event.type === 'click') {
          await handleClickEvent(viewContext, event)
          return
        }
        if (event.type === 'contextmenu') {
          await handleContextMenuEvent(viewContext, event)
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
        }
      })
    },
    async handleImageError(name: string): Promise<void> {
      await runEventHandler(() => handleImageErrorEvent(viewContext, name))
    },
    async handleKeyDown(
      name: string,
      key: string,
      ctrlKey = false,
    ): Promise<void> {
      await runEventHandler(() =>
        handleKeyDownEvent(viewContext, {
          ctrlKey,
          key,
          name,
          type: 'keydown',
        } as ViewEvent & {
          readonly ctrlKey: boolean
          readonly key: string
        }),
      )
    },
    async handleSashPointerDown(clientX: number): Promise<void> {
      await runEventHandler(() =>
        startResizeCardDetail(viewContext, {
          clientX,
          name: 'resizeCardDetail',
          type: 'pointerdown',
        } as ViewEvent & { readonly clientX: number }),
      )
    },
    async handleSashPointerMove(clientX: number): Promise<void> {
      await runEventHandler(() =>
        resizeCardDetail(viewContext, {
          clientX,
          type: 'pointermove',
        } as ViewEvent & { readonly clientX: number }),
      )
    },
    async handleSashPointerUp(): Promise<void> {
      await runEventHandler(() => stopResizeCardDetail(viewContext))
    },
    async logout(): Promise<void> {
      await logout(viewContext)
      updateContext(state)
    },
    async openCard(cardId: string): Promise<void> {
      await openCard(viewContext, cardId)
      updateContext(state)
    },
    async openMockBoard({
      id,
      name,
    }: {
      readonly name: string
      readonly id: string
    }): Promise<void> {
      await instance.handleEvent?.({
        name: 'apiKey',
        type: 'input',
        value: 'abcdefghijklmnopqrstuvwxyz123456',
      })
      await instance.handleEvent?.({
        name: 'token',
        type: 'input',
        value: 'abcdefghijklmnopqrstuvwxyz123456',
      })
      await instance.handleEvent?.({
        name: 'connect',
        type: 'click',
      })
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
    renderActions(): readonly ViewAction[] {
      return renderActions(state)
    },
    renderFocus(
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ): string {
      if (becameActive(oldContext, newContext, contextKeyBoardFilterFocus)) {
        return '[name="boardFilter"]'
      }
      if (
        becameActive(oldContext, newContext, contextKeyCardLabelPickerFocus)
      ) {
        return '[name="cardLabelSearch"]'
      }
      if (
        becameActive(oldContext, newContext, contextKeyNewCardInputFocus) &&
        state.addingCardListId
      ) {
        return `[name="newCardTitle:${state.addingCardListId}"]`
      }
      if (becameActive(oldContext, newContext, contextKeyNewListInputFocus)) {
        return '[name="newListTitle"]'
      }
      if (
        becameActive(oldContext, newContext, contextKeyCardDescriptionFocus)
      ) {
        return '[name="cardDescription"]'
      }
      return ''
    },
    renderSelections(): readonly ViewSelection[] {
      const selections = state.pendingSelections
      state.pendingSelections = []
      return selections
    },
    renderTitle(): string {
      return getTitle(state)
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
    startAddCard(listId: string): void {
      startAddCard(viewContext, listId)
      updateContext(state)
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
