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
  readonly desc?: string
  readonly id: string
  readonly idBoard?: string
  readonly idList?: string
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

export interface TrelloCommentData {
  readonly text?: string
}

export interface TrelloCommentMember {
  readonly fullName?: string
}

export interface TrelloComment {
  readonly data: TrelloCommentData
  readonly date?: string
  readonly id: string
  readonly memberCreator?: TrelloCommentMember
}

export interface TrelloCardDetail {
  readonly attachments: readonly TrelloAttachment[]
  readonly card: TrelloCard
  readonly comments: readonly TrelloComment[]
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
