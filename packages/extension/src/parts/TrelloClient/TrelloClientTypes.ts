import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloCardUpdate,
  TrelloCredentials,
  TrelloList,
  TrelloListUpdate,
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'

export interface TrelloCacheFirstResult<T> {
  readonly cached: T | undefined
  readonly fresh: Promise<T>
}

export interface TrelloClient {
  readonly getBoardDetail: (
    board: TrelloBoard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloBoardDetail>
  readonly getBoardDetailCacheFirst: (
    board: TrelloBoard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCacheFirstResult<TrelloBoardDetail>>
  readonly getCardDetail: (
    card: TrelloCard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCardDetail>
  readonly getCardDetailCacheFirst: (
    card: TrelloCard,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCacheFirstResult<TrelloCardDetail>>
  readonly listBoards: (
    credentials: TrelloCredentials,
  ) => Promise<readonly TrelloBoard[]>
  readonly listBoardsCacheFirst: (
    credentials: TrelloCredentials,
  ) => Promise<TrelloCacheFirstResult<readonly TrelloBoard[]>>
  readonly search: (
    query: string,
    credentials: TrelloCredentials,
  ) => Promise<readonly TrelloSearchResult[]>
  readonly searchCacheFirst: (
    query: string,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCacheFirstResult<readonly TrelloSearchResult[]>>
  readonly updateCard: (
    card: TrelloCard,
    update: TrelloCardUpdate,
    credentials: TrelloCredentials,
  ) => Promise<TrelloCard>
  readonly updateList: (
    list: TrelloList,
    update: TrelloListUpdate,
    credentials: TrelloCredentials,
  ) => Promise<TrelloList>
}

export interface TrelloResponse {
  readonly json: () => Promise<unknown>
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly text: () => Promise<string>
}

export interface TrelloRequestInit {
  readonly method?: string
}

export type FetchLike = (
  input: string,
  init?: TrelloRequestInit,
) => Promise<TrelloResponse>
