import type { TrelloApiCache } from '../TrelloApiCache/TrelloApiCache.ts'
import type { FetchLike } from '../TrelloClientTypes/TrelloClientTypes.ts'
import type {
  TrelloAttachment,
  TrelloCard,
  TrelloCredentials,
} from '../TrelloTypes/TrelloTypes.ts'
import { deleteCachedCardAttachments } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const addCardAttachment = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  file: File,
  credentials: TrelloCredentials,
  cache?: TrelloApiCache,
): Promise<TrelloAttachment> => {
  const formData = new FormData()
  formData.set('file', file, file.name)
  formData.set('name', file.name)
  if (file.type) {
    formData.set('mimeType', file.type)
  }
  const attachment = await requestJson<TrelloAttachment>(
    fetchLike,
    `/cards/${card.id}/attachments`,
    credentials,
    {},
    {
      body: formData,
      method: 'POST',
    },
  )
  await deleteCachedCardAttachments(cache, card, credentials)
  return attachment
}
