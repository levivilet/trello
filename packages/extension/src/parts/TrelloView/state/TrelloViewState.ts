import type { CredentialStorage } from '../../CredentialStorage/CredentialStorage.ts'
import type { CurrentBoardStorage } from '../../CurrentBoardStorage/CurrentBoardStorage.ts'
import type {
  RecentBoardStorage,
  RecentBoardView,
} from '../../RecentBoardStorage/RecentBoardStorage.ts'
import type { TrelloClient } from '../../TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCardDetail,
  TrelloCredentials,
  TrelloSearchResult,
} from '../../TrelloTypes/TrelloTypes.ts'

export interface TrelloViewDependencies {
  readonly client: TrelloClient
  readonly currentBoardStorage?: CurrentBoardStorage
  readonly isTest?: boolean
  readonly readBoardBackgroundEnabled?: () => Promise<boolean>
  readonly readSearchEnabled?: () => Promise<boolean>
  readonly recentStorage: RecentBoardStorage
  readonly storage: CredentialStorage
}

export interface TrelloViewState {
  activeSearchQuery: string
  boardBackgroundEnabled: boolean
  boardDetail: TrelloBoardDetail | undefined
  boards: readonly TrelloBoard[]
  cardDetailLoading: boolean
  credentials: TrelloCredentials | undefined
  draftApiKey: string
  draftCardDescription: string
  draftCardTitle: string
  draftListTitles: Readonly<Record<string, string>>
  draftSearchQuery: string
  draftToken: string
  draggedCardId: string
  dragTargetListId: string
  editingCardDescription: boolean
  editingCardTitle: boolean
  error: string
  loading: boolean
  recentBoardViews: readonly RecentBoardView[]
  savingCardDetail: boolean
  searchEnabled: boolean
  searchResults: readonly TrelloSearchResult[]
  selectedCardDetail: TrelloCardDetail | undefined
}

export interface TrelloViewContext {
  readonly client: TrelloClient
  readonly currentBoardStorage: CurrentBoardStorage
  readonly recentStorage: RecentBoardStorage
  readonly requestRerender: () => void
  readonly state: TrelloViewState
  readonly storage: CredentialStorage
}

export interface TrelloViewActionContext {
  readonly client: TrelloClient
  readonly currentBoardStorage: CurrentBoardStorage
  readonly recentStorage: RecentBoardStorage
  readonly requestRerender: () => void
  readonly state: Readonly<TrelloViewState>
  readonly storage: CredentialStorage
}
