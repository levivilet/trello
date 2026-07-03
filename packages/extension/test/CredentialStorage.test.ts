import { expect, test } from '@jest/globals'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'

test('memory credential storage reads and writes credentials', async () => {
  const storage = createMemoryCredentialStorage()
  await expect(storage.read()).resolves.toBeUndefined()

  await storage.write({
    apiKey: validApiKey,
    token: validToken,
  })

  await expect(storage.read()).resolves.toEqual({
    apiKey: validApiKey,
    token: validToken,
  })
})

test('memory credential storage deletes credentials', async () => {
  const storage = createMemoryCredentialStorage({
    apiKey: validApiKey,
    token: validToken,
  })

  await storage.delete()

  await expect(storage.read()).resolves.toBeUndefined()
})
