import type { TrelloCredentials } from '../TrelloTypes/TrelloTypes.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

const apiKeyPattern = /^[A-Za-z0-9]{32}$/

export const validateCredentials = (
  credentials: Readonly<TrelloCredentials>,
): string => {
  if (!credentials.apiKey.trim() || !credentials.token.trim()) {
    return TrelloStrings.apiKeyAndTokenRequired()
  }
  if (!apiKeyPattern.test(credentials.apiKey)) {
    return TrelloStrings.apiKeyInvalid()
  }
  return ''
}
