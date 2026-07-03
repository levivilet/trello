import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloCardUpdate,
  TrelloCredentials,
  TrelloList,
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'

export interface TrelloClient {
  readonly getBoardDetail: (
    board: TrelloBoard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloBoardDetail>
  readonly getCardDetail: (
    card: TrelloCard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCardDetail>
  readonly listBoards: (
    credentials: TrelloCredentials,
  ) => Promise<readonly TrelloBoard[]>
  readonly search: (
    query: string,
    credentials: TrelloCredentials,
  ) => Promise<readonly TrelloSearchResult[]>
  readonly updateCard: (
    card: TrelloCard,
    update: TrelloCardUpdate,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCard>
}

interface TrelloResponse {
  readonly json: () => Promise<unknown>
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly text: () => Promise<string>
}

interface TrelloRequestInit {
  readonly method?: string
}

export type FetchLike = (
  input: string,
  init?: TrelloRequestInit,
) => Promise<TrelloResponse>

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

interface TrelloSearchResponse {
  readonly boards?: readonly TrelloBoard[]
  readonly cards?: readonly TrelloCard[]
}

const normalizeSearchResponse = (
  response: Readonly<TrelloSearchResponse>,
): readonly TrelloSearchResult[] => {
  const cards = response.cards || []
  const boards = response.boards || []
  return [
    ...cards.map((card): TrelloSearchResult => {
      return {
        ...card,
        type: 'card',
      }
    }),
    ...boards.map((board): TrelloSearchResult => {
      return {
        ...board,
        type: 'board',
      }
    }),
  ]
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
              fields: 'name,url,idBoard,idList',
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
    async getCardDetail(
      card: TrelloCard,
      credentials: TrelloCredentials,
    ): Promise<TrelloCardDetail> {
      const [detailCard, attachments] = await Promise.all([
        requestJson<TrelloCard>(fetchLike, `/cards/${card.id}`, credentials, {
          fields: 'name,desc,url,idBoard,idList',
        }),
        requestJson<TrelloCardDetail['attachments']>(
          fetchLike,
          `/cards/${card.id}/attachments`,
          credentials,
          {
            fields: 'name,url,mimeType,previews',
          },
        ),
      ])
      return {
        attachments,
        card: detailCard,
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
          fields: 'name,url,dateLastView,idOrganization',
          organization: 'true',
          organization_fields: 'name,displayName',
        },
      )
    },
    async search(
      query: string,
      credentials: TrelloCredentials,
    ): Promise<readonly TrelloSearchResult[]> {
      const response = await requestJson<TrelloSearchResponse>(
        fetchLike,
        '/search',
        credentials,
        {
          board_fields: 'name,url',
          boards_limit: '10',
          card_fields: 'name,url,idBoard',
          cards_limit: '10',
          modelTypes: 'cards,boards',
          query,
        },
      )
      return normalizeSearchResponse(response)
    },
    async updateCard(
      card: TrelloCard,
      update: TrelloCardUpdate,
      credentials: TrelloCredentials,
    ): Promise<TrelloCard> {
      return requestJson<TrelloCard>(
        fetchLike,
        `/cards/${card.id}`,
        credentials,
        {
          desc: update.desc,
          fields: 'name,desc,url,idBoard,idList',
          name: update.name,
        },
        {
          method: 'PUT',
        },
      )
    },
  }
}
