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

export interface TrelloLabel {
  readonly color?: string
  readonly id: string
  readonly idBoard?: string
  readonly name?: string
}

<<<<<<< Updated upstream
=======
export interface TrelloCardBadges {
  readonly comments?: number
}

>>>>>>> Stashed changes
export interface TrelloCard {
  readonly badges?: TrelloCardBadges
  readonly desc?: string
  readonly id: string
  readonly idBoard?: string
  readonly idList?: string
  readonly labels?: readonly TrelloLabel[]
  readonly name: string
  readonly url?: string
}

export interface TrelloAttachmentPreview {
  readonly url?: string
}

export interface TrelloAttachment {
  readonly id: string
  readonly mimeType?: string
  readonly name?: string
  readonly previews?: readonly TrelloAttachmentPreview[]
  readonly url?: string
}

export interface TrelloCardDetail {
  readonly attachments: readonly TrelloAttachment[]
  readonly card: TrelloCard
}

export interface TrelloCardUpdate {
  readonly desc: string
  readonly name: string
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
