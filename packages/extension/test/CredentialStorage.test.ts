import { expect, test } from '@jest/globals'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'

test('memory credential storage reads and writes credentials', async () => {
  const storage = createMemoryCredentialStorage()
  await expect(storage.read()).resolves.toBeUndefined()

  await storage.write({
    apiKey: 'key',
    token: 'token',
  })

  await expect(storage.read()).resolves.toEqual({
    apiKey: 'key',
    token: 'token',
  })
})

test('memory credential storage deletes credentials', async () => {
  const storage = createMemoryCredentialStorage({
    apiKey: 'key',
    token: 'token',
  })

  await storage.delete()

  await expect(storage.read()).resolves.toBeUndefined()
})
