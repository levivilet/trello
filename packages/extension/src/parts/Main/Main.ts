import {
  activate as activateExtensionApi,
  executeCommand,
  registerCommand,
  registerView,
} from '@lvce-editor/api'
import { createMemoryCredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import { createMemoryCurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import {
  createMockTrelloClient,
  type MockTrelloData,
} from '../MockTrelloClient/MockTrelloClient.ts'
import { createMemoryRecentBoardStorage } from '../RecentBoardStorage/RecentBoardStorage.ts'
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
    execute(data: Readonly<MockTrelloData>) {
      const storage = createMemoryCredentialStorage()
      const currentBoardStorage = createMemoryCurrentBoardStorage()
      const recentStorage = createMemoryRecentBoardStorage()
      TrelloView.setTrelloViewDependencyFactory(() => ({
        client: createMockTrelloClient(data),
        currentBoardStorage,
        recentStorage,
        storage,
      }))
      return { ok: true }
    },
    id: 'trello.test.useMockData',
  })
  registerCommand({
    execute() {
      TrelloView.resetTrelloViewDependencyFactory()
      return { ok: true }
    },
    id: 'trello.test.reset',
  })
}

export const deactivate = (): void => {}
