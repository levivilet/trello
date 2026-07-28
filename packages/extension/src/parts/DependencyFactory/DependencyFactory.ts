import * as ExtensionApi from '@lvce-editor/api'
import type { TrelloViewDependencies } from '../TrelloViewState/TrelloViewState.ts'
import {
  batchRequestsEnabledPreference,
  boardBackgroundEnabledPreference,
  cardDetailPopupEnabledPreference,
  searchEnabledPreference,
} from '../Constants/Constants.ts'
import { createSecretCredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import { createCacheCurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import { createCacheRecentBoardStorage } from '../RecentBoardStorage/RecentBoardStorage.ts'
import { createTrelloClient } from '../TrelloClient/TrelloClient.ts'
import { createTrelloImageCache } from '../TrelloImageCache/TrelloImageCache.ts'

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

export const readCardDetailPopupEnabledPreference =
  async (): Promise<boolean> => {
    const api = ExtensionApi as unknown as {
      readonly getPreference?: (key: string) => Promise<unknown>
    }
    return (
      (await api.getPreference?.(cardDetailPopupEnabledPreference)) === true
    )
  }

const readBatchRequestsEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(batchRequestsEnabledPreference)) === true
}

const defaultDependencyFactory = (): TrelloViewDependencies => ({
  client: createTrelloClient(undefined, undefined, {
    readBatchRequestsEnabled: readBatchRequestsEnabledPreference,
  }),
  currentBoardStorage: createCacheCurrentBoardStorage(),
  imageCache: createTrelloImageCache(),
  readBoardBackgroundEnabled: readBoardBackgroundEnabledPreference,
  readCardDetailPopupEnabled: readCardDetailPopupEnabledPreference,
  readSearchEnabled: readSearchEnabledPreference,
  recentStorage: createCacheRecentBoardStorage(),
  storage: createSecretCredentialStorage(ExtensionApi),
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
