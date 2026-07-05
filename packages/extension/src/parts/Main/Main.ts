import {
  activate as activateExtensionApi,
  executeCommand,
  registerCommand,
  registerView,
} from '@lvce-editor/api'
import {
  createCacheCredentialStorage,
  testCacheName as testCredentialCacheName,
} from '../CredentialStorage/CredentialStorage.ts'
import {
  createCacheCurrentBoardStorage,
  testCacheName as testCurrentBoardCacheName,
} from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import {
  createMockTrelloClient,
  type MockTrelloData,
} from '../MockTrelloClient/MockTrelloClient.ts'
import {
  createCacheRecentBoardStorage,
  testCacheName as testRecentBoardCacheName,
} from '../RecentBoardStorage/RecentBoardStorage.ts'
import { clearTrelloTestCaches } from '../TestStorage/TestStorage.ts'
import * as TrelloView from '../TrelloView/TrelloView.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerView(TrelloView.view)
  registerCommand({
    execute() {
      return executeCommand('SideBar.show', TrelloView.viewId, true)
    },
    id: 'trello.show',
  })
  registerCommand({
    async execute(data: Readonly<MockTrelloData>) {
      await clearTrelloTestCaches()
      TrelloView.setTrelloViewDependencyFactory(() => ({
        client: createMockTrelloClient(data),
        currentBoardStorage: createCacheCurrentBoardStorage(
          testCurrentBoardCacheName,
        ),
        isTest: true,
        recentStorage: createCacheRecentBoardStorage(testRecentBoardCacheName),
        storage: createCacheCredentialStorage(testCredentialCacheName),
      }))
      await TrelloView.reloadActiveTrelloViewInstances()
      return { ok: true }
    },
    id: 'trello.test.useMockData',
  })
  registerCommand({
    async execute() {
      TrelloView.resetTrelloViewDependencyFactory()
      await TrelloView.reloadActiveTrelloViewInstances()
      return { ok: true }
    },
    id: 'trello.test.reset',
  })
}

export const deactivate = (): void => {}
