import type {
  TrelloCard,
  TrelloCardDetail,
  TrelloCredentials,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { TrelloApiCache } from '../TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import {
  deleteCachedJson,
  readCachedJson,
  requestJson,
} from '../RequestJson.ts'

const cardParams = {
  fields: 'name,desc,url,idBoard,idList,labels',
} as const

const attachmentsParams = {
  fields: 'name,url,mimeType,previews',
} as const

const commentsParams = {
  fields: 'data,date,id',
  filter: 'commentCard',
  memberCreator: 'true',
  memberCreator_fields: 'avatarHash,avatarUrl,fullName,initials,username',
} as const

export const readCachedCardDetail = async (
  cache: TrelloApiCache | undefined,
  card: TrelloCard,
  credentials: TrelloCredentials,
): Promise<TrelloCardDetail | undefined> => {
  const [detailCard, attachments, comments] = await Promise.all([
    readCachedJson<TrelloCard>(
      cache,
      `/cards/${card.id}`,
      credentials,
      cardParams,
    ),
    readCachedJson<TrelloCardDetail['attachments']>(
      cache,
      `/cards/${card.id}/attachments`,
      credentials,
      attachmentsParams,
    ),
    readCachedJson<TrelloCardDetail['comments']>(
      cache,
      `/cards/${card.id}/actions`,
      credentials,
      commentsParams,
    ),
  ])
  if (!detailCard || !attachments || !comments) {
    return undefined
  }
  return {
    attachments,
    card: detailCard,
    comments,
  }
}

export const deleteCachedCardDetail = async (
  cache: TrelloApiCache | undefined,
  card: TrelloCard,
  credentials: TrelloCredentials,
): Promise<void> => {
  await deleteCachedJson(cache, `/cards/${card.id}`, credentials, cardParams)
}

export const getCardDetail = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCardDetail> => {
  const [detailCard, attachments, comments] = await Promise.all([
    requestJson<TrelloCard>(
      fetchLike,
      `/cards/${card.id}`,
      credentials,
      cardParams,
      undefined,
      cache,
    ),
    requestJson<TrelloCardDetail['attachments']>(
      fetchLike,
      `/cards/${card.id}/attachments`,
      credentials,
      attachmentsParams,
      undefined,
      cache,
    ),
    requestJson<TrelloCardDetail['comments']>(
      fetchLike,
      `/cards/${card.id}/actions`,
      credentials,
      commentsParams,
      undefined,
      cache,
    ),
  ])
  return {
    attachments,
    card: detailCard,
    comments,
  }
}
