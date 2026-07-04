import type {
  ViewContext,
  ViewEvent,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewActionContext } from './state/TrelloViewState.ts'
import { handleClickEvent } from './actions/HandleClickEvent.ts'
import { handleInputEvent } from './actions/HandleInputEvent.ts'
import { handleSubmitEvent } from './actions/HandleSubmitEvent.ts'
import { loadBoards } from './actions/LoadBoards.ts'
import { renderAuth } from './render/RenderAuth.ts'
import { renderBoardDetail } from './render/RenderBoardDetail.ts'
import { renderBoards } from './render/RenderBoards.ts'
import { createInitialState } from './state/CreateInitialState.ts'
import { dependencyState } from './state/DependencyFactory.ts'

export const createInstance = async (
  context?: ViewContext,
): Promise<VirtualDomViewInstance> => {
  const { client, readSearchEnabled, recentStorage, storage } =
    dependencyState.factory()
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
    recentStorage,
    requestRerender,
    state,
    storage,
  }

  if (readSearchEnabled) {
    state.searchEnabled = await readSearchEnabled()
  }
  state.recentBoardViews = await recentStorage.read()
  const storedCredentials = await storage.read()
  if (storedCredentials) {
    state.credentials = storedCredentials
    state.draftApiKey = storedCredentials.apiKey
    state.draftToken = storedCredentials.token
    await loadBoards(viewContext, false)
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
