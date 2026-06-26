import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCredentials,
  TrelloList,
} from '../TrelloTypes/TrelloTypes.ts'

export interface TrelloClient {
  readonly getBoardDetail: (
    board: TrelloBoard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloBoardDetail>
  readonly listBoards: (
    credentials: TrelloCredentials,
  ) => Promise<readonly TrelloBoard[]>
}

interface TrelloResponse {
  readonly json: () => Promise<unknown>
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly text: () => Promise<string>
}

export type FetchLike = (input: string) => Promise<TrelloResponse>

const baseUrl = 'https://api.trello.com/1'

const getErrorMessage = async (response: TrelloResponse): Promise<string> => {
  const text = await response.text()
  if (text) {
    return `Trello request failed: ${response.status} ${text}`
  }
  return `Trello request failed: ${response.status} ${response.statusText}`
}

const requestJson = async <T>(
  fetchLike: FetchLike,
  path: string,
  credentials: TrelloCredentials,
  params: Readonly<Record<string, string>> = {},
): Promise<T> => {
  const url = new URL(`${baseUrl}${path}`)
  url.searchParams.set('key', credentials.apiKey)
  url.searchParams.set('token', credentials.token)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const response = await fetchLike(url.href)
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return response.json() as Promise<T>
}

export const createTrelloClient = (
  fetchLike: FetchLike = fetch,
): TrelloClient => {
  return {
    async getBoardDetail(
      board: TrelloBoard,
      credentials: TrelloCredentials,
    ): Promise<TrelloBoardDetail> {
      const lists = await requestJson<readonly Omit<TrelloList, 'cards'>[]>(
        fetchLike,
        `/boards/${board.id}/lists`,
        credentials,
        {
          fields: 'name',
        },
      )
      const listsWithCards = await Promise.all(
        lists.map(async (list): Promise<TrelloList> => {
          const cards = await requestJson<readonly TrelloCard[]>(
            fetchLike,
            `/lists/${list.id}/cards`,
            credentials,
            {
              fields: 'name,url',
            },
          )
          return {
            cards,
            id: list.id,
            name: list.name,
          }
        }),
      )
      return {
        board,
        lists: listsWithCards,
      }
    },
    async listBoards(
      credentials: TrelloCredentials,
    ): Promise<readonly TrelloBoard[]> {
      return requestJson<readonly TrelloBoard[]>(
        fetchLike,
        '/members/me/boards',
        credentials,
        {
          fields: 'name,url',
        },
      )
    },
  }
}
