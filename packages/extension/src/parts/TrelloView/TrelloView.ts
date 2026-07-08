import type { View } from '@lvce-editor/api'
import { viewId } from './Constants.ts'
import { createInstance } from './CreateInstance.ts'
import { renderEventListeners } from './render/RenderEventListeners.ts'

type TrelloView = View & {
  readonly eventListeners?: ReturnType<typeof renderEventListeners>
}

export const view: TrelloView = {
  create: createInstance,
  // @ts-ignore
  displayName: 'Trello',
  eventListeners: renderEventListeners(),
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  title: 'Trello',
}

export {
  resetTrelloViewDependencyFactory,
  setTrelloViewDependencyFactory,
} from './state/DependencyFactory.ts'
export {
  backToBoardsActiveTrelloViewInstance,
  cancelNewCardActiveTrelloViewInstance,
  closeCardDetailActiveTrelloViewInstance,
  logoutActiveTrelloViewInstance,
  openCardActiveTrelloViewInstance,
  refreshBoardsActiveTrelloViewInstance,
  reloadActiveTrelloViewInstances,
  saveCardDetailActiveTrelloViewInstance,
  startAddCardActiveTrelloViewInstance,
  submitNewCardActiveTrelloViewInstance,
  addList,
  addCard,
  openMockBoard,
} from './CreateInstance.ts'
export { getMenuEntries } from './MenuEntries.ts'
export { renderActions } from './render/RenderActions.ts'
export {
  boardBackgroundEnabledPreference,
  searchEnabledPreference,
  viewId,
} from './Constants.ts'
