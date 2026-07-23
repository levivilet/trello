import * as I18nString from '../I18NString/I18NString.ts'
import * as UiStrings from '../UiStrings/UiStrings.ts'

const getString = (value: string): string => {
  return I18nString.i18nString(value)
}

const getStringWithPlaceholder = (
  value: string,
  placeholder: string,
): string => {
  return I18nString.i18nString(value, {
    PH1: placeholder,
  })
}

export const addACard = (): string => getString(UiStrings.AddACard)
export const addCard = (): string => getString(UiStrings.AddCard)
export const addCardMenu = (): string => getString(UiStrings.AddCardMenu)
export const addDetailedDescription = (): string =>
  getString(UiStrings.AddDetailedDescription)
export const apiKey = (): string => getString(UiStrings.ApiKey)
export const apiKeyAndTokenRequired = (): string =>
  getString(UiStrings.ApiKeyAndTokenRequired)
export const apiKeyInvalid = (): string => getString(UiStrings.ApiKeyInvalid)
export const avatar = (author: string): string =>
  getStringWithPlaceholder(UiStrings.Avatar, author)
export const backToBoards = (): string => getString(UiStrings.BackToBoards)
export const boardNotFound = (boardId: string): string =>
  getStringWithPlaceholder(UiStrings.BoardNotFound, boardId)
export const boardSearchResult = (name: string): string =>
  getStringWithPlaceholder(UiStrings.BoardSearchResult, name)
export const boards = (): string => getString(UiStrings.Boards)
export const cancel = (): string => getString(UiStrings.Cancel)
export const cardAttachment = (): string => getString(UiStrings.CardAttachment)
export const cardComment = (): string => getString(UiStrings.CardComment)
export const cardComments = (count: number): string =>
  getStringWithPlaceholder(UiStrings.CardComments, String(count))
export const cardCover = (name: string): string =>
  getStringWithPlaceholder(UiStrings.CardCover, name)
export const cardDetails = (): string => getString(UiStrings.CardDetails)
export const cardNotFound = (cardId: string): string =>
  getStringWithPlaceholder(UiStrings.CardNotFound, cardId)
export const cardSearchResult = (name: string): string =>
  getStringWithPlaceholder(UiStrings.CardSearchResult, name)
export const cardTitleRequired = (): string =>
  getString(UiStrings.CardTitleRequired)
export const close = (): string => getString(UiStrings.Close)
export const closeCard = (): string => getString(UiStrings.CloseCard)
export const commentRequired = (): string =>
  getString(UiStrings.CommentRequired)
export const comments = (): string => getString(UiStrings.Comments)
export const connect = (): string => getString(UiStrings.Connect)
export const connecting = (): string => getString(UiStrings.Connecting)
export const create = (): string => getString(UiStrings.Create)
export const createLabel = (): string => getString(UiStrings.CreateLabel)
export const createNewLabel = (): string => getString(UiStrings.CreateNewLabel)
export const createNewList = (): string => getString(UiStrings.CreateNewList)
export const creating = (): string => getString(UiStrings.Creating)
export const description = (): string => getString(UiStrings.Description)
export const edit = (): string => getString(UiStrings.Edit)
export const enterCardTitle = (): string => getString(UiStrings.EnterCardTitle)
export const enterListTitle = (): string => getString(UiStrings.EnterListTitle)
export const filter = (): string => getString(UiStrings.Filter)
export const filterCards = (): string => getString(UiStrings.FilterCards)
export const filterCardsHint = (): string =>
  getString(UiStrings.FilterCardsHint)
export const images = (): string => getString(UiStrings.Images)
export const imageCouldNotBeLoaded = (): string =>
  getString(UiStrings.ImageCouldNotBeLoaded)
export const label = (): string => getString(UiStrings.Label)
export const labels = (): string => getString(UiStrings.Labels)
export const labelTitle = (): string => getString(UiStrings.LabelTitle)
export const labelTitleRequired = (): string =>
  getString(UiStrings.LabelTitleRequired)
export const keyword = (): string => getString(UiStrings.Keyword)
export const list = (): string => getString(UiStrings.List)
export const listTitleRequired = (): string =>
  getString(UiStrings.ListTitleRequired)
export const loadingBoard = (): string => getString(UiStrings.LoadingBoard)
export const loadingBoards = (): string => getString(UiStrings.LoadingBoards)
export const loadingCard = (): string => getString(UiStrings.LoadingCard)
export const loadingComments = (): string =>
  getString(UiStrings.LoadingComments)
export const loadingImages = (): string => getString(UiStrings.LoadingImages)
export const loadingLabels = (): string => getString(UiStrings.LoadingLabels)
export const noBoardsFound = (): string => getString(UiStrings.NoBoardsFound)
export const noCards = (): string => getString(UiStrings.NoCards)
export const noComments = (): string => getString(UiStrings.NoComments)
export const noCommentText = (): string => getString(UiStrings.NoCommentText)
export const noLabelsAvailable = (): string =>
  getString(UiStrings.NoLabelsAvailable)
export const noSearchResults = (): string =>
  getString(UiStrings.NoSearchResults)
export const openCard = (): string => getString(UiStrings.OpenCard)
export const openInTrello = (): string => getString(UiStrings.OpenInTrello)
export const personalBoards = (): string => getString(UiStrings.PersonalBoards)
export const recentlyViewed = (): string => getString(UiStrings.RecentlyViewed)
export const refreshBoards = (): string => getString(UiStrings.RefreshBoards)
export const save = (): string => getString(UiStrings.Save)
export const saveCard = (): string => getString(UiStrings.SaveCard)
export const saving = (): string => getString(UiStrings.Saving)
export const searchLabels = (): string => getString(UiStrings.SearchLabels)
export const searchResultsFor = (query: string): string =>
  getStringWithPlaceholder(UiStrings.SearchResultsFor, query)
export const searchTrello = (): string => getString(UiStrings.SearchTrello)
export const searching = (): string => getString(UiStrings.Searching)
export const selectAColor = (): string => getString(UiStrings.SelectAColor)
export const selectLabelColor = (color: string): string =>
  getStringWithPlaceholder(UiStrings.SelectLabelColor, color)
export const signOut = (): string => getString(UiStrings.SignOut)
export const title = (): string => getString(UiStrings.Title)
export const token = (): string => getString(UiStrings.Token)
export const trello = (): string => getString(UiStrings.Trello)
export const trelloBoard = (name: string): string =>
  getStringWithPlaceholder(UiStrings.TrelloBoard, name)
export const unknownMember = (): string => getString(UiStrings.UnknownMember)
export const welcome = (): string => getString(UiStrings.Welcome)
export const welcomeDescription = (): string =>
  getString(UiStrings.WelcomeDescription)
export const welcomePowerUp = (): string => getString(UiStrings.WelcomePowerUp)
export const welcomeApiKey = (): string => getString(UiStrings.WelcomeApiKey)
export const welcomeToken = (): string => getString(UiStrings.WelcomeToken)
export const welcomeSecurity = (): string =>
  getString(UiStrings.WelcomeSecurity)
export const writeAComment = (): string => getString(UiStrings.WriteAComment)
export const writeACommentPlaceholder = (): string =>
  getString(UiStrings.WriteACommentPlaceholder)
export const yourWorkspaces = (): string => getString(UiStrings.YourWorkspaces)
