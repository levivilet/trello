export interface TrelloCredentials {
  readonly apiKey: string
  readonly token: string
}

export interface TrelloBoard {
  readonly id: string
  readonly name: string
  readonly url?: string
}

export interface TrelloCard {
  readonly id: string
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
