import type { View } from '@lvce-editor/api'
import { viewId } from '../Constants/Constants.ts'
import {
  type ActiveTrelloViewInstance,
  createInstance,
} from '../CreateInstance/CreateInstance.ts'
import { renderEventListeners } from '../RenderEventListeners/RenderEventListeners.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

type TrelloView = Omit<View<ActiveTrelloViewInstance>, 'commands'> & {
  readonly commands: NonNullable<View<ActiveTrelloViewInstance>['commands']>
  readonly eventListeners?: ReturnType<typeof renderEventListeners>
}

const runViewAction =
  (action: (instance: ActiveTrelloViewInstance) => Promise<void>) =>
  async (
    instance: ActiveTrelloViewInstance,
  ): Promise<ActiveTrelloViewInstance> => {
    await action(instance)
    return instance
  }

export const view: TrelloView = {
  commands: {
    'trello.backToBoards': runViewAction((instance) => instance.backToBoards()),
    'trello.logout': runViewAction((instance) => instance.logout()),
    'trello.refreshBoards': runViewAction((instance) =>
      instance.refreshBoards(),
    ),
  },
  create: createInstance,
  // @ts-ignore
  displayName: TrelloStrings.trello(),
  eventListeners: renderEventListeners(),
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  title: TrelloStrings.trello(),
}

export {
  resetTrelloViewDependencyFactory,
  setTrelloViewDependencyFactory,
} from '../DependencyFactory/DependencyFactory.ts'
export {
  backToBoardsActiveTrelloViewInstance,
  cancelNewCardActiveTrelloViewInstance,
  closeBoardFilterActiveTrelloViewInstance,
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
} from '../CreateInstance/CreateInstance.ts'
export { getMenuEntries } from '../MenuEntries/MenuEntries.ts'
export { renderActionsDom } from '../RenderActionsDom/RenderActionsDom.ts'
export {
  boardBackgroundEnabledPreference,
  searchEnabledPreference,
  viewId,
} from '../Constants/Constants.ts'
