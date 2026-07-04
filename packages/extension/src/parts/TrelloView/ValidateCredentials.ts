import type { TrelloCredentials } from '../TrelloTypes/TrelloTypes.ts'

const apiKeyPattern = /^[A-Za-z0-9]{32}$/
const tokenPattern = /^[A-Za-z0-9]{64}$/

export const validateCredentials = (
  credentials: Readonly<TrelloCredentials>,
): string => {
  if (!credentials.apiKey || !credentials.token) {
    return 'Enter an API key and token.'
  }
  if (!apiKeyPattern.test(credentials.apiKey)) {
    return 'API key must be 32 alphanumeric characters.'
  }
  if (!tokenPattern.test(credentials.token)) {
    return 'Token must be 64 alphanumeric characters.'
  }
  return ''
}
