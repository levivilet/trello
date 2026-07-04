import type {
  View,
  ViewContext,
  ViewEvent,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import * as ExtensionApi from '@lvce-editor/api'
import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  TrelloAttachment,
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloComment,
  TrelloCredentials,
  TrelloLabel,
  TrelloSearchResult,
} from '../TrelloTypes/TrelloTypes.ts'
import {
  createCacheCredentialStorage,
  type CredentialStorage,
} from '../CredentialStorage/CredentialStorage.ts'
import {
  createCacheRecentBoardStorage,
  type RecentBoardStorage,
  type RecentBoardView,
  updateRecentBoardViews,
} from '../RecentBoardStorage/RecentBoardStorage.ts'
import {
  createTrelloClient,
  type TrelloClient,
} from '../TrelloClient/TrelloClient.ts'
import * as Dom from '../VirtualDom/VirtualDom.ts'

export const viewId = 'trello.views.boards'
export const searchEnabledPreference = 'trello.searchEnabled'

const apiKeyPattern = /^[A-Za-z0-9]{32}$/
const tokenPattern = /^[A-Za-z0-9]{64}$/
const imageUrlPattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i

interface TrelloViewDependencies {
  readonly client: TrelloClient
  readonly readSearchEnabled?: () => Promise<boolean>
  readonly recentStorage: RecentBoardStorage
  readonly storage: CredentialStorage
}

interface TrelloViewState {
  activeSearchQuery: string
  boardDetail: TrelloBoardDetail | undefined
  boards: readonly TrelloBoard[]
  cardDetailLoading: boolean
  credentials: TrelloCredentials | undefined
  draftApiKey: string
  draftCardDescription: string
  draftCardTitle: string
  draftSearchQuery: string
  draftToken: string
  error: string
  loading: boolean
  recentBoardViews: readonly RecentBoardView[]
  savingCardDetail: boolean
  searchEnabled: boolean
  searchResults: readonly TrelloSearchResult[]
  selectedCardDetail: TrelloCardDetail | undefined
}

type DependencyFactory = () => TrelloViewDependencies

const readSearchEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(searchEnabledPreference)) === true
}

const defaultDependencyFactory = (): TrelloViewDependencies => ({
  client: createTrelloClient(),
  readSearchEnabled: readSearchEnabledPreference,
  recentStorage: createCacheRecentBoardStorage(),
  storage: createCacheCredentialStorage(),
})

const dependencyState: { factory: DependencyFactory } = {
  factory: defaultDependencyFactory,
}

export const setTrelloViewDependencyFactory = (
  factory: DependencyFactory,
): void => {
  dependencyState.factory = factory
}

export const resetTrelloViewDependencyFactory = (): void => {
  dependencyState.factory = defaultDependencyFactory
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

const validateCredentials = (
  credentials: Readonly<TrelloCredentials>,
): string => {
  if (!credentials.apiKey || !credentials.token) {
    return 'Enter an API key and token.'
  }
  if (!apiKeyPattern.test(credentials.apiKey)) {
    return 'API key must be 32 alphanumeric characters.'
  }
  if (!tokenPattern.test(credentials.token)) {
    return 'Token must be 64 alphanumeric characters.'
  }
  return ''
}

const renderError = (error: string): readonly Dom.TreeNode[] => {
  if (!error) {
    return []
  }
  return [Dom.div('TrelloError', [Dom.textNode(error)])]
}

const renderTitle = (text: string): Dom.TreeNode => {
  return Dom.node(VirtualDomElements.H2, { className: 'TrelloTitle' }, [
    Dom.textNode(text),
  ])
}

const renderListTitle = (text: string): Dom.TreeNode => {
  return Dom.node(VirtualDomElements.H3, { className: 'TrelloListTitle' }, [
    Dom.textNode(text),
  ])
}

const renderToolbar = (children: readonly Dom.TreeNode[]): Dom.TreeNode => {
  return Dom.div('TrelloToolbar', children)
}

const renderField = (
  label: string,
  name: string,
  value: string,
): Dom.TreeNode => {
  return Dom.div('TrelloField', [
    Dom.textNode(label),
    Dom.input(name, value, label),
  ])
}

const renderTextAreaField = (
  label: string,
  name: string,
  value: string,
): Dom.TreeNode => {
  return Dom.div('TrelloField', [
    Dom.textNode(label),
    Dom.textArea(name, value, label),
  ])
}

const renderSearchForm = (state: Readonly<TrelloViewState>): Dom.TreeNode => {
  return Dom.form('search', 'TrelloSearchForm', [
    Dom.input('search', state.draftSearchQuery, 'Search Trello'),
  ])
}

const renderWelcomeText = (text: string): Dom.TreeNode => {
  return Dom.div('TrelloWelcomeText', [Dom.textNode(text)])
}

const renderWelcome = (): Dom.TreeNode => {
  return Dom.div('TrelloWelcome', [
    Dom.node(VirtualDomElements.H3, { className: 'TrelloWelcomeTitle' }, [
      Dom.textNode('Welcome to Trello'),
    ]),
    renderWelcomeText(
      'Connect your Trello account to browse your boards from Lvce Editor.',
    ),
    renderWelcomeText(
      'Create or open a Trello Power-Up at https://trello.com/power-ups/admin, then open the API Key tab and generate an API key.',
    ),
    renderWelcomeText(
      "Use that key to generate a token from Trello's authorization page, then paste both values here.",
    ),
    renderWelcomeText(
      'The API key identifies the app. The token grants access to your Trello account, so keep the token private.',
    ),
  ])
}

const renderAuth = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const title = renderTitle('Trello')
  const apiKey = renderField('API key', 'apiKey', state.draftApiKey)
  const token = renderField('Token', 'token', state.draftToken)
  const connect = Dom.button(
    'connect',
    state.loading ? 'Connecting...' : 'Connect',
  )
  return Dom.flatten(
    Dom.div('TrelloView TrelloAuth', [
      title,
      apiKey,
      token,
      connect,
      ...renderError(state.error),
      renderWelcome(),
    ]),
  )
}

const renderBoardContent = (
  state: Readonly<TrelloViewState>,
): readonly Dom.TreeNode[] => {
  if (state.activeSearchQuery) {
    return renderSearchContent(state)
  }
  if (state.loading) {
    return [Dom.textNode('Loading boards...')]
  }
  if (state.boards.length === 0) {
    return [Dom.textNode('No boards found')]
  }
  const recentBoards = getRecentlyViewedBoards(state)
  const workspaceSections = getWorkspaceSections(state)
  return [
    ...renderRecentlyViewed(recentBoards),
    Dom.div('TrelloWorkspaces', [
      renderListTitle('Your workspaces'),
      ...workspaceSections.map(renderWorkspaceSection),
    ]),
  ]
}

const parseDate = (value: string | undefined): number => {
  if (!value) {
    return 0
  }
  const time = Date.parse(value)
  if (Number.isNaN(time)) {
    return 0
  }
  return time
}

const getLocalViewedAt = (
  recentBoardViews: readonly RecentBoardView[],
  boardId: string,
): number => {
  const recentBoardView = recentBoardViews.find(
    (item) => item.boardId === boardId,
  )
  return parseDate(recentBoardView?.viewedAt)
}

const getBoardViewedAt = (
  state: Readonly<TrelloViewState>,
  board: TrelloBoard,
): number => {
  return Math.max(
    parseDate(board.dateLastView),
    getLocalViewedAt(state.recentBoardViews, board.id),
  )
}

const sortBoardsByViewedAt = (
  state: Readonly<TrelloViewState>,
  boards: readonly TrelloBoard[],
): readonly TrelloBoard[] => {
  const originalIndexes = new Map(
    state.boards.map((board, index) => [board.id, index]),
  )
  return boards.toSorted((a, b) => {
    const viewedAtDiff = getBoardViewedAt(state, b) - getBoardViewedAt(state, a)
    if (viewedAtDiff !== 0) {
      return viewedAtDiff
    }
    return (originalIndexes.get(a.id) ?? 0) - (originalIndexes.get(b.id) ?? 0)
  })
}

const getRecentlyViewedBoards = (
  state: Readonly<TrelloViewState>,
): readonly TrelloBoard[] => {
  return sortBoardsByViewedAt(state, state.boards)
    .filter((board) => getBoardViewedAt(state, board) > 0)
    .slice(0, 4)
}

interface WorkspaceSection {
  readonly boards: readonly TrelloBoard[]
  readonly name: string
}

const getWorkspaceName = (board: TrelloBoard): string => {
  return (
    board.organization?.displayName ||
    board.organization?.name ||
    'Personal boards'
  )
}

const getWorkspaceSections = (
  state: Readonly<TrelloViewState>,
): readonly WorkspaceSection[] => {
  const sections = new Map<string, TrelloBoard[]>()
  for (const board of state.boards) {
    const name = getWorkspaceName(board)
    const boards = sections.get(name) || []
    boards.push(board)
    sections.set(name, boards)
  }
  return Array.from(
    sections,
    (entry: readonly [string, readonly TrelloBoard[]]): WorkspaceSection => {
      const [name, boards] = entry
      return {
        boards: sortBoardsByViewedAt(state, boards),
        name,
      }
    },
  )
}

const renderBoardButton = (board: TrelloBoard): Dom.TreeNode => {
  return Dom.button(`board:${board.id}`, board.name, 'TrelloBoardButton')
}

const renderBoardGrid = (boards: readonly TrelloBoard[]): Dom.TreeNode => {
  return Dom.div('TrelloBoardGrid', boards.map(renderBoardButton))
}

const renderRecentlyViewed = (
  boards: readonly TrelloBoard[],
): readonly Dom.TreeNode[] => {
  if (boards.length === 0) {
    return []
  }
  return [
    Dom.div('TrelloSection', [
      renderListTitle('Recently viewed'),
      renderBoardGrid(boards),
    ]),
  ]
}

const renderWorkspaceSection = (
  section: Readonly<WorkspaceSection>,
): Dom.TreeNode => {
  return Dom.div('TrelloWorkspace', [
    renderListTitle(section.name),
    renderBoardGrid(section.boards),
  ])
}

const renderSearchResult = (
  result: Readonly<TrelloSearchResult>,
): Dom.TreeNode => {
  if (result.type === 'board') {
    return Dom.button(
      `board:${result.id}`,
      `Board: ${result.name}`,
      'TrelloSearchResult',
    )
  }
  return Dom.div('TrelloSearchResult', [Dom.textNode(`Card: ${result.name}`)])
}

const renderSearchContent = (
  state: Readonly<TrelloViewState>,
): readonly Dom.TreeNode[] => {
  if (state.loading) {
    return [Dom.textNode('Searching...')]
  }
  if (state.searchResults.length === 0) {
    return [
      renderListTitle(`Search results for "${state.activeSearchQuery}"`),
      Dom.textNode('No search results'),
    ]
  }
  return [
    Dom.div('TrelloSearchSection', [
      renderListTitle(`Search results for "${state.activeSearchQuery}"`),
      Dom.div(
        'TrelloSearchResults',
        state.searchResults.map(renderSearchResult),
      ),
    ]),
  ]
}

const renderBoards = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const toolbarChildren = [
    ...(state.searchEnabled ? [renderSearchForm(state)] : []),
    Dom.button('refreshBoards', 'Refresh'),
    Dom.button('logout', 'Sign out'),
  ]
  const toolbar = renderToolbar(toolbarChildren)
  const children = [
    toolbar,
    renderTitle('Boards'),
    ...renderBoardContent(state),
    ...renderError(state.error),
  ]
  return Dom.flatten(Dom.div('TrelloView TrelloBoards', children))
}

const getCardCommentCount = (card: Readonly<TrelloCard>): number => {
  return card.badges?.comments || 0
}

const getCardCommentCountText = (count: number): string => {
  if (count === 1) {
    return '1 comment'
  }
  return `${count} comments`
}

const renderCardCommentCount = (
  card: Readonly<TrelloCard>,
): readonly Dom.TreeNode[] => {
  const commentCount = getCardCommentCount(card)
  if (commentCount <= 0) {
    return []
  }
  return [
    Dom.div('TrelloCardMeta', [
      Dom.textNode(getCardCommentCountText(commentCount)),
    ]),
  ]
}

const renderCard = (card: Readonly<TrelloCard>): Dom.TreeNode => {
  return Dom.node(
    VirtualDomElements.Button,
    {
      className: 'TrelloCard',
      name: `card:${card.id}`,
      onClick: 'handleClick',
    },
    [
      Dom.div('TrelloCardTitle', [Dom.textNode(card.name)]),
      ...renderCardCommentCount(card),
    ],
  )
}

const renderCards = (cards: readonly TrelloCard[]): readonly Dom.TreeNode[] => {
  if (cards.length === 0) {
    return [Dom.textNode('No cards')]
  }
  return cards.map(renderCard)
}

const isImageAttachment = (attachment: Readonly<TrelloAttachment>): boolean => {
  if (attachment.mimeType?.startsWith('image/')) {
    return true
  }
  if (attachment.url && imageUrlPattern.test(attachment.url)) {
    return true
  }
  return Boolean(attachment.previews?.some((preview) => preview.url))
}

const getAttachmentImageUrl = (
  attachment: Readonly<TrelloAttachment>,
): string => {
  if (attachment.url && imageUrlPattern.test(attachment.url)) {
    return attachment.url
  }
  if (attachment.mimeType?.startsWith('image/') && attachment.url) {
    return attachment.url
  }
  const previews = attachment.previews || []
  return previews.at(-1)?.url || attachment.url || ''
}

const renderImageAttachment = (
  attachment: Readonly<TrelloAttachment>,
): Dom.TreeNode => {
  return Dom.image(
    'TrelloCardDetailImage',
    getAttachmentImageUrl(attachment),
    attachment.name || 'Card attachment',
  )
}

const renderCardDetailImages = (
  attachments: readonly TrelloAttachment[],
): Dom.TreeNode => {
  const imageAttachments = attachments.filter(isImageAttachment)
  if (imageAttachments.length === 0) {
    return Dom.div('TrelloCardDetailEmpty', [Dom.textNode('No images')])
  }
  return Dom.div(
    'TrelloCardDetailImages',
    imageAttachments.map(renderImageAttachment),
  )
}

const getCommentAuthor = (comment: Readonly<TrelloComment>): string => {
  return comment.memberCreator?.fullName?.trim() || 'Unknown member'
}

const getCommentText = (comment: Readonly<TrelloComment>): string => {
  return comment.data.text?.trim() || 'No comment text'
}

const renderCardDetailComment = (
  comment: Readonly<TrelloComment>,
): Dom.TreeNode => {
  const author = Dom.textNode(getCommentAuthor(comment))
  const text = Dom.textNode(getCommentText(comment))
  return Dom.div('TrelloCardComment', [
    Dom.div('TrelloCardCommentAuthor', [author]),
    Dom.div('TrelloCardCommentText', [text]),
  ])
}

const renderCardDetailComments = (
  comments: readonly TrelloComment[],
): Dom.TreeNode => {
  if (comments.length === 0) {
    return Dom.div('TrelloCardDetailEmpty', [Dom.textNode('No comments')])
  }
  return Dom.div('TrelloCardComments', comments.map(renderCardDetailComment))
}

const getLabelText = (label: Readonly<TrelloLabel>): string => {
  return label.name?.trim() || label.color?.trim() || 'Label'
}

const getLabelColorClassName = (color: string | undefined): string => {
  switch (color) {
    case 'black':
    case 'blue':
    case 'green':
    case 'lime':
    case 'orange':
    case 'pink':
    case 'purple':
    case 'red':
    case 'sky':
    case 'yellow':
      return `TrelloCardLabelColor${color[0].toUpperCase()}${color.slice(1)}`
    default:
      return 'TrelloCardLabelColorNeutral'
  }
}

const renderCardDetailLabel = (label: Readonly<TrelloLabel>): Dom.TreeNode => {
  return Dom.div(`TrelloCardLabel ${getLabelColorClassName(label.color)}`, [
    Dom.textNode(getLabelText(label)),
  ])
}

const renderCardDetailLabels = (
  labels: readonly TrelloLabel[] | undefined,
): readonly Dom.TreeNode[] => {
  if (!labels || labels.length === 0) {
    return []
  }
  return [Dom.div('TrelloCardLabels', labels.map(renderCardDetailLabel))]
}

const renderCardDetailPanel = (
  state: Readonly<TrelloViewState>,
): readonly Dom.TreeNode[] => {
  if (state.cardDetailLoading) {
    return [
      Dom.div('TrelloCardDetailPanel', [
        renderListTitle('Card details'),
        Dom.textNode('Loading card...'),
      ]),
    ]
  }
  if (!state.selectedCardDetail) {
    return []
  }
  const { attachments, card, comments } = state.selectedCardDetail
  const descriptionPreview =
    state.draftCardDescription.trim() || 'No description'
  const children = [
    Dom.button('closeCardDetail', 'Close'),
    renderField('Title', 'cardTitle', state.draftCardTitle),
    ...renderCardDetailLabels(card.labels),
    renderTextAreaField(
      'Description',
      'cardDescription',
      state.draftCardDescription,
    ),
    Dom.button('saveCardDetail', state.savingCardDetail ? 'Saving...' : 'Save'),
    Dom.div('TrelloCardDescription', [Dom.textNode(descriptionPreview)]),
    renderListTitle('Comments'),
    renderCardDetailComments(comments),
    renderListTitle('Images'),
    renderCardDetailImages(attachments),
    ...(card.url
      ? [Dom.link('TrelloCardDetailLink', card.url, 'Open in Trello')]
      : []),
  ]
  return [Dom.div('TrelloCardDetailPanel', children)]
}

const renderBoardDetailContent = (
  state: Readonly<TrelloViewState>,
  lists: readonly Dom.TreeNode[],
): readonly Dom.TreeNode[] => {
  if (state.loading) {
    return [Dom.textNode('Loading board...')]
  }
  return [
    Dom.div('TrelloBoardDetailContent', [
      Dom.div('TrelloLists', lists),
      ...renderCardDetailPanel(state),
    ]),
  ]
}

const renderBoardDetail = (
  state: Readonly<TrelloViewState>,
  detail: TrelloBoardDetail,
): readonly VirtualDomNode[] => {
  const lists = detail.lists.map((list) => {
    const cards = renderCards(list.cards)
    return Dom.div('TrelloList', [
      renderListTitle(list.name),
      Dom.div('TrelloCards', cards),
    ])
  })
  const toolbar = renderToolbar([
    Dom.button('backToBoards', 'Back'),
    Dom.button('logout', 'Sign out'),
  ])
  const children = [
    toolbar,
    renderTitle(detail.board.name),
    ...renderBoardDetailContent(state, lists),
    ...renderError(state.error),
  ]
  return Dom.flatten(Dom.div('TrelloView TrelloBoardDetail', children))
}

const createInitialState = (): TrelloViewState => {
  return {
    activeSearchQuery: '',
    boardDetail: undefined,
    boards: [],
    cardDetailLoading: false,
    credentials: undefined,
    draftApiKey: '',
    draftCardDescription: '',
    draftCardTitle: '',
    draftSearchQuery: '',
    draftToken: '',
    error: '',
    loading: false,
    recentBoardViews: [],
    savingCardDetail: false,
    searchEnabled: false,
    searchResults: [],
    selectedCardDetail: undefined,
  }
}

const createInstance = async (
  context?: ViewContext,
): Promise<VirtualDomViewInstance> => {
  const { client, readSearchEnabled, recentStorage, storage } =
    dependencyState.factory()
  const state = createInitialState()

  const requestRerender = (): void => {
    // @ts-ignore
    const request = context?.requestRerender
    if (!request) {
      return
    }
    globalThis.setTimeout(() => {
      void request()
    }, 0)
  }

  const clearBoardSpecificState = (): void => {
    state.boardDetail = undefined
    state.selectedCardDetail = undefined
    state.cardDetailLoading = false
    state.draftCardDescription = ''
    state.draftCardTitle = ''
    state.savingCardDetail = false
  }

  const loadBoards = async (rerender = true): Promise<void> => {
    if (!state.credentials) {
      return
    }
    state.loading = true
    state.error = ''
    clearBoardSpecificState()
    state.activeSearchQuery = ''
    state.searchResults = []
    try {
      state.boards = await client.listBoards(state.credentials)
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.loading = false
    }
    if (rerender) {
      requestRerender()
    }
  }

  if (readSearchEnabled) {
    state.searchEnabled = await readSearchEnabled()
  }
  state.recentBoardViews = await recentStorage.read()
  const storedCredentials = await storage.read()
  if (storedCredentials) {
    state.credentials = storedCredentials
    state.draftApiKey = storedCredentials.apiKey
    state.draftToken = storedCredentials.token
    await loadBoards(false)
  }

  const connect = async (): Promise<void> => {
    const credentials = {
      apiKey: state.draftApiKey.trim(),
      token: state.draftToken.trim(),
    }
    state.draftApiKey = credentials.apiKey
    state.draftToken = credentials.token
    const validationError = validateCredentials(credentials)
    if (validationError) {
      state.error = validationError
      requestRerender()
      return
    }
    state.loading = true
    state.error = ''
    requestRerender()
    try {
      const boards = await client.listBoards(credentials)
      await storage.write(credentials)
      state.credentials = credentials
      state.boards = boards
      clearBoardSpecificState()
      state.activeSearchQuery = ''
      state.searchResults = []
    } catch (error) {
      state.credentials = undefined
      state.boards = []
      clearBoardSpecificState()
      state.activeSearchQuery = ''
      state.searchResults = []
      state.error = getErrorMessage(error)
    } finally {
      state.loading = false
    }
    requestRerender()
  }

  const openBoard = async (boardId: string): Promise<void> => {
    if (!state.credentials) {
      return
    }
    const board =
      state.boards.find((item) => item.id === boardId) ||
      state.searchResults.find(
        (item): item is TrelloBoard & { readonly type: 'board' } => {
          return item.type === 'board' && item.id === boardId
        },
      )
    if (!board) {
      state.error = `Board not found: ${boardId}`
      requestRerender()
      return
    }
    state.loading = true
    state.error = ''
    state.selectedCardDetail = undefined
    state.cardDetailLoading = false
    state.draftCardDescription = ''
    state.draftCardTitle = ''
    state.savingCardDetail = false
    state.recentBoardViews = updateRecentBoardViews(
      state.recentBoardViews,
      board.id,
      new Date().toISOString(),
    )
    await recentStorage.write(state.recentBoardViews)
    try {
      state.boardDetail = await client.getBoardDetail(board, state.credentials)
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.loading = false
    }
    requestRerender()
  }

  const findBoardCard = (cardId: string): TrelloCard | undefined => {
    const lists = state.boardDetail?.lists || []
    for (const list of lists) {
      const card = list.cards.find((item) => item.id === cardId)
      if (card) {
        return card
      }
    }
    return undefined
  }

  const openCard = async (cardId: string): Promise<void> => {
    if (!state.credentials || !state.boardDetail) {
      return
    }
    const card = findBoardCard(cardId)
    if (!card) {
      state.error = `Card not found: ${cardId}`
      requestRerender()
      return
    }
    state.cardDetailLoading = true
    state.selectedCardDetail = undefined
    state.error = ''
    requestRerender()
    try {
      const cardDetail = await client.getCardDetail(card, state.credentials)
      state.selectedCardDetail = cardDetail
      state.draftCardTitle = cardDetail.card.name
      state.draftCardDescription = cardDetail.card.desc || ''
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.cardDetailLoading = false
    }
    requestRerender()
  }

  const closeCardDetail = (): void => {
    state.selectedCardDetail = undefined
    state.cardDetailLoading = false
    state.draftCardDescription = ''
    state.draftCardTitle = ''
    state.error = ''
    requestRerender()
  }

  const updateBoardDetailCard = (card: TrelloCard): void => {
    if (!state.boardDetail) {
      return
    }
    state.boardDetail = {
      ...state.boardDetail,
      lists: state.boardDetail.lists.map((list) => {
        return {
          ...list,
          cards: list.cards.map((item) => {
            if (item.id !== card.id) {
              return item
            }
            return {
              ...item,
              ...card,
            }
          }),
        }
      }),
    }
  }

  const saveCardDetail = async (): Promise<void> => {
    if (
      !state.credentials ||
      !state.selectedCardDetail ||
      state.savingCardDetail
    ) {
      return
    }
    const name = state.draftCardTitle.trim()
    if (!name) {
      state.error = 'Card title is required.'
      requestRerender()
      return
    }
    state.error = ''
    state.savingCardDetail = true
    requestRerender()
    try {
      const card = await client.updateCard(
        state.selectedCardDetail.card,
        {
          desc: state.draftCardDescription,
          name,
        },
        state.credentials,
      )
      state.selectedCardDetail = {
        ...state.selectedCardDetail,
        card,
      }
      state.draftCardTitle = card.name
      state.draftCardDescription = card.desc || ''
      updateBoardDetailCard(card)
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.savingCardDetail = false
    }
    requestRerender()
  }

  const logout = async (): Promise<void> => {
    await storage.delete()
    await recentStorage.delete()
    Object.assign(state, createInitialState())
    requestRerender()
  }

  const goBackToBoards = (): void => {
    clearBoardSpecificState()
    state.error = ''
    requestRerender()
  }

  const submitSearch = async (): Promise<void> => {
    if (!state.credentials || !state.searchEnabled) {
      return
    }
    const query = state.draftSearchQuery.trim()
    state.draftSearchQuery = query
    state.error = ''
    clearBoardSpecificState()
    if (!query) {
      state.activeSearchQuery = ''
      state.searchResults = []
      requestRerender()
      return
    }
    state.activeSearchQuery = query
    state.searchResults = []
    state.loading = true
    requestRerender()
    try {
      state.searchResults = await client.search(query, state.credentials)
    } catch (error) {
      state.error = getErrorMessage(error)
    } finally {
      state.loading = false
    }
    requestRerender()
  }

  const handleInputEvent = (event: Readonly<ViewEvent>): void => {
    if (event.name === 'apiKey') {
      state.draftApiKey = typeof event.value === 'string' ? event.value : ''
      return
    }
    if (event.name === 'token') {
      state.draftToken = typeof event.value === 'string' ? event.value : ''
      return
    }
    if (event.name === 'search') {
      state.draftSearchQuery =
        typeof event.value === 'string' ? event.value : ''
      return
    }
    if (event.name === 'cardTitle') {
      state.draftCardTitle = typeof event.value === 'string' ? event.value : ''
      return
    }
    if (event.name === 'cardDescription') {
      state.draftCardDescription =
        typeof event.value === 'string' ? event.value : ''
    }
  }

  const handleClickEvent = async (
    event: Readonly<ViewEvent>,
  ): Promise<void> => {
    switch (event.name) {
      case 'backToBoards':
        goBackToBoards()
        return
      case 'closeCardDetail':
        closeCardDetail()
        return
      case 'connect':
        await connect()
        return
      case 'logout':
        await logout()
        return
      case 'refreshBoards':
        await loadBoards()
        return
      case 'saveCardDetail':
        await saveCardDetail()
        return
      default:
        if (event.name?.startsWith('board:')) {
          await openBoard(event.name.slice('board:'.length))
          return
        }
        if (event.name?.startsWith('card:')) {
          await openCard(event.name.slice('card:'.length))
        }
    }
  }

  const handleSubmitEvent = async (
    event: Readonly<ViewEvent>,
  ): Promise<void> => {
    if (event.name === 'search') {
      await submitSearch()
    }
  }

  return {
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'input') {
        handleInputEvent(event)
        return
      }
      if (event.type === 'click') {
        await handleClickEvent(event)
        return
      }
      if (event.type === 'submit') {
        await handleSubmitEvent(event)
      }
    },
    render(): readonly VirtualDomNode[] {
      if (!state.credentials) {
        return renderAuth(state)
      }
      if (state.boardDetail) {
        return renderBoardDetail(state, state.boardDetail)
      }
      return renderBoards(state)
    },
    saveState(): unknown {
      return {
        boardId: state.boardDetail?.board.id,
        cardId: state.selectedCardDetail?.card.id,
        isAuthenticated: Boolean(state.credentials),
      }
    },
  }
}

export const view: View = {
  create: createInstance,
  // @ts-ignore
  displayName: 'Trello',
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  title: 'Trello',
}
