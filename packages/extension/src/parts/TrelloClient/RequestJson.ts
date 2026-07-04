import type { TrelloCredentials } from '../TrelloTypes/TrelloTypes.ts'
import type {
  FetchLike,
  TrelloRequestInit,
  TrelloResponse,
} from './TrelloClientTypes.ts'

const baseUrl = 'https://api.trello.com/1'

const getErrorMessage = async (response: TrelloResponse): Promise<string> => {
  const text = await response.text()
  if (text) {
    return `Trello request failed: ${response.status} ${text}`
  }
  return `Trello request failed: ${response.status} ${response.statusText}`
}

export const requestJson = async <T>(
  fetchLike: FetchLike,
  path: string,
  credentials: TrelloCredentials,
  params: Readonly<Record<string, string>> = {},
  init?: TrelloRequestInit,
): Promise<T> => {
  const url = new URL(`${baseUrl}${path}`)
  url.searchParams.set('key', credentials.apiKey)
  url.searchParams.set('token', credentials.token)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const response = await fetchLike(url.href, init)
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return response.json() as Promise<T>
}
