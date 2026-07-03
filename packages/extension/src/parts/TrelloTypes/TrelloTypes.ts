export interface TrelloCredentials {
  readonly apiKey: string
  readonly token: string
}

export interface TrelloOrganization {
  readonly displayName?: string
  readonly id: string
  readonly name: string
}

export interface TrelloBoard {
  readonly dateLastView?: string
  readonly id: string
  readonly idOrganization?: string
  readonly name: string
  readonly organization?: TrelloOrganization
  readonly url?: string
}

export interface TrelloCard {
  readonly id: string
  readonly idBoard?: string
  readonly name: string
  readonly url?: string
}

export interface TrelloList {
  readonly cards: readonly TrelloCard[]
  readonly id: string
  readonly name: string
}

export interface TrelloBoardDetail {
  readonly board: TrelloBoard
  readonly lists: readonly TrelloList[]
}

export interface TrelloBoardSearchResult extends TrelloBoard {
  readonly type: 'board'
}

export interface TrelloCardSearchResult extends TrelloCard {
  readonly type: 'card'
}

export type TrelloSearchResult =
  | TrelloBoardSearchResult
  | TrelloCardSearchResult
