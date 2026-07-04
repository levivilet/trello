import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloCardUpdate,
  TrelloCredentials,
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
