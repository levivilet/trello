import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloCard,
  TrelloCardDetail,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import {
  deleteCachedJson,
  readCachedJson,
  requestJson,
  requestJsonBatch,
} from '../RequestJson/RequestJson.ts'

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

type TrelloCardDetailBatchResult = readonly [
  TrelloCard,
  TrelloCardDetail['attachments'],
  TrelloCardDetail['comments'],
]

const getBatchCard = async (
  result: Readonly<Promise<TrelloCardDetailBatchResult>>,
): Promise<TrelloCard> => {
  const values = await result
  return values[0]
}

const getBatchAttachments = async (
  result: Readonly<Promise<TrelloCardDetailBatchResult>>,
): Promise<TrelloCardDetail['attachments']> => {
  const values = await result
  return values[1]
}

const getBatchComments = async (
  result: Readonly<Promise<TrelloCardDetailBatchResult>>,
): Promise<TrelloCardDetail['comments']> => {
  const values = await result
  return values[2]
}

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

export const deleteCachedCardComments = async (
  cache: TrelloApiCache | undefined,
  card: TrelloCard,
  credentials: TrelloCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/cards/${card.id}/actions`,
    credentials,
    commentsParams,
  )
}

export const getCardDetailCard = (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCard> => {
  return requestJson<TrelloCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    cardParams,
    undefined,
    cache,
  )
}

export const getCardDetailAttachments = (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCardDetail['attachments']> => {
  return requestJson<TrelloCardDetail['attachments']>(
    fetchLike,
    `/cards/${card.id}/attachments`,
    credentials,
    attachmentsParams,
    undefined,
    cache,
  )
}

export const getCardDetailComments = (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloCardDetail['comments']> => {
  return requestJson<TrelloCardDetail['comments']>(
    fetchLike,
    `/cards/${card.id}/actions`,
    credentials,
    commentsParams,
    undefined,
    cache,
  )
}

export const getCardDetail = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
  batchRequestsEnabled = false,
): Promise<TrelloCardDetail> => {
  const {
    attachments,
    card: detailCard,
    comments,
  } = getCardDetailParts(
    fetchLike,
    card,
    credentials,
    cache,
    batchRequestsEnabled,
  )
  const [resolvedCard, resolvedAttachments, resolvedComments] =
    await Promise.all([detailCard, attachments, comments])
  return {
    attachments: resolvedAttachments,
    card: resolvedCard,
    comments: resolvedComments,
  }
}

export const getCardDetailParts = (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
  batchRequestsEnabled = false,
): {
  readonly attachments: Promise<TrelloCardDetail['attachments']>
  readonly card: Promise<TrelloCard>
  readonly comments: Promise<TrelloCardDetail['comments']>
} => {
  if (!batchRequestsEnabled) {
    const detailCard = getCardDetailCard(fetchLike, card, credentials, cache)
    const attachments = getCardDetailAttachments(
      fetchLike,
      card,
      credentials,
      cache,
    )
    const comments = getCardDetailComments(fetchLike, card, credentials, cache)
    return {
      attachments,
      card: detailCard,
      comments,
    }
  }
  const result = requestJsonBatch<TrelloCardDetailBatchResult>(
    fetchLike,
    [
      {
        params: cardParams,
        path: `/cards/${card.id}`,
      },
      {
        params: attachmentsParams,
        path: `/cards/${card.id}/attachments`,
      },
      {
        params: commentsParams,
        path: `/cards/${card.id}/actions`,
      },
    ],
    credentials,
    cache,
  )
  return {
    attachments: getBatchAttachments(result),
    card: getBatchCard(result),
    comments: getBatchComments(result),
  }
}
