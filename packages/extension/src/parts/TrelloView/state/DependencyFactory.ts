import * as ExtensionApi from '@lvce-editor/api'
import type { TrelloViewDependencies } from './TrelloViewState.ts'
import { createCacheCredentialStorage } from '../../CredentialStorage/CredentialStorage.ts'
import { createCacheRecentBoardStorage } from '../../RecentBoardStorage/RecentBoardStorage.ts'
import { createTrelloClient } from '../../TrelloClient/TrelloClient.ts'
import {
  boardBackgroundEnabledPreference,
  searchEnabledPreference,
} from '../Constants.ts'

type DependencyFactory = () => TrelloViewDependencies

const readSearchEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(searchEnabledPreference)) === true
}

const readBoardBackgroundEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(boardBackgroundEnabledPreference)) === true
}

const defaultDependencyFactory = (): TrelloViewDependencies => ({
  client: createTrelloClient(),
  readBoardBackgroundEnabled: readBoardBackgroundEnabledPreference,
  readSearchEnabled: readSearchEnabledPreference,
  recentStorage: createCacheRecentBoardStorage(),
  storage: createCacheCredentialStorage(),
})

export const dependencyState: { factory: DependencyFactory } = {
  factory: defaultDependencyFactory,
}

export const setTrelloViewDependencyFactory = (
  factory: DependencyFactory,
): void => {
  dependencyState.factory = factory
}

export const resetTrelloViewDependencyFactory = (): void => {
  dependencyState.factory = defaultDependencyFactory
}
