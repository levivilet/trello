import type {
  ViewContext,
  ViewEvent,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewActionContext } from './state/TrelloViewState.ts'
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

export const createInstance = async (
  context?: ViewContext,
): Promise<VirtualDomViewInstance> => {
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

  const viewContext: TrelloViewActionContext = {
    client,
    currentBoardStorage,
    recentStorage,
    requestRerender,
    state,
    storage,
  }

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

  return {
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'input') {
        handleInputEvent(state, event)
        return
      }
      if (event.type === 'click') {
        await handleClickEvent(viewContext, event)
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
}
