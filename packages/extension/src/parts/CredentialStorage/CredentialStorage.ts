import type { TrelloCredentials } from '../TrelloTypes/TrelloTypes.ts'
import {
  createLocalCacheRequestUrl,
  deleteLocalCacheRequest,
  matchLocalCacheRequest,
} from '../LocalCacheRequest/LocalCacheRequest.ts'

export interface CredentialStorage {
  readonly delete: () => Promise<void>
  readonly read: () => Promise<TrelloCredentials | undefined>
  readonly write: (credentials: TrelloCredentials) => Promise<void>
}

export interface SecretStorageApi {
  readonly deleteSecret: (key: string) => Promise<void>
  readonly getSecret: (key: string) => Promise<string | undefined>
  readonly storeSecret: (key: string, value: string) => Promise<void>
}

export const cacheName = 'builtin.trello.credentials'
export const testCacheName = 'test.builtin.trello.credentials'
export const credentialsSecretKey = 'credentials'
const legacyCredentialsRequestUrl = '/credentials.json'
export const credentialsRequestUrl = createLocalCacheRequestUrl(
  legacyCredentialsRequestUrl,
)

const isCredentials = (value: unknown): value is TrelloCredentials => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.apiKey === 'string' && typeof record.token === 'string'
}

const parseCredentials = (
  value: string | undefined,
): TrelloCredentials | undefined => {
  if (value === undefined) {
    return undefined
  }
  try {
    const parsed = JSON.parse(value)
    return isCredentials(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

const isSecretStorageUnsupported = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }
  return [
    'Extensions.deleteSecret',
    'Extensions.getSecret',
    'Extensions.storeSecret',
  ].some((command) => error.message.includes(`Command not found ${command}`))
}

export const createCacheCredentialStorage = (
  selectedCacheName = cacheName,
): CredentialStorage => {
  return {
    async delete(): Promise<void> {
      const cache = await caches.open(selectedCacheName)
      await deleteLocalCacheRequest(
        cache,
        credentialsRequestUrl,
        legacyCredentialsRequestUrl,
      )
    },
    async read(): Promise<TrelloCredentials | undefined> {
      const cache = await caches.open(selectedCacheName)
      const response = await matchLocalCacheRequest(
        cache,
        credentialsRequestUrl,
        legacyCredentialsRequestUrl,
      )
      if (!response) {
        return undefined
      }
      const value = await response.json()
      if (!isCredentials(value)) {
        return undefined
      }
      return value
    },
    async write(credentials: TrelloCredentials): Promise<void> {
      const cache = await caches.open(selectedCacheName)
      await cache.put(credentialsRequestUrl, Response.json(credentials))
    },
  }
}

export const createMemoryCredentialStorage = (
  initial?: TrelloCredentials,
): CredentialStorage => {
  let value = initial
  return {
    async delete(): Promise<void> {
      value = undefined
    },
    async read(): Promise<TrelloCredentials | undefined> {
      return value
    },
    async write(credentials: TrelloCredentials): Promise<void> {
      value = credentials
    },
  }
}

export const createSecretCredentialStorage = (
  secretStorage: SecretStorageApi,
  legacyStorage: CredentialStorage = createCacheCredentialStorage(),
): CredentialStorage => {
  let secretStorageSupported = true

  const handleSecretStorageError = (error: unknown): void => {
    if (!isSecretStorageUnsupported(error)) {
      throw error
    }
    secretStorageSupported = false
  }

  return {
    async delete(): Promise<void> {
      if (secretStorageSupported) {
        try {
          await secretStorage.deleteSecret(credentialsSecretKey)
        } catch (error) {
          handleSecretStorageError(error)
        }
      }
      await legacyStorage.delete()
    },
    async read(): Promise<TrelloCredentials | undefined> {
      if (!secretStorageSupported) {
        return legacyStorage.read()
      }
      let storedCredentials: TrelloCredentials | undefined
      try {
        storedCredentials = parseCredentials(
          await secretStorage.getSecret(credentialsSecretKey),
        )
      } catch (error) {
        handleSecretStorageError(error)
        return legacyStorage.read()
      }
      if (storedCredentials) {
        return storedCredentials
      }
      const legacyCredentials = await legacyStorage.read()
      if (!legacyCredentials) {
        return undefined
      }
      try {
        await secretStorage.storeSecret(
          credentialsSecretKey,
          JSON.stringify(legacyCredentials),
        )
      } catch (error) {
        handleSecretStorageError(error)
        return legacyCredentials
      }
      await legacyStorage.delete()
      return legacyCredentials
    },
    async write(credentials: TrelloCredentials): Promise<void> {
      if (secretStorageSupported) {
        try {
          await secretStorage.storeSecret(
            credentialsSecretKey,
            JSON.stringify(credentials),
          )
        } catch (error) {
          handleSecretStorageError(error)
        }
      }
      if (secretStorageSupported) {
        await legacyStorage.delete()
      } else {
        await legacyStorage.write(credentials)
      }
    },
  }
}
