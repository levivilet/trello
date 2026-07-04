import type {
  TrelloCard,
  TrelloCardDetail,
  TrelloCredentials,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { FetchLike } from '../TrelloClientTypes.ts'
import { requestJson } from '../RequestJson.ts'

export const getCardDetail = async (
  fetchLike: FetchLike,
  card: TrelloCard,
  credentials: TrelloCredentials,
): Promise<TrelloCardDetail> => {
  const [detailCard, attachments, comments] = await Promise.all([
    requestJson<TrelloCard>(fetchLike, `/cards/${card.id}`, credentials, {
      fields: 'name,desc,url,idBoard,idList,labels',
    }),
    requestJson<TrelloCardDetail['attachments']>(
      fetchLike,
      `/cards/${card.id}/attachments`,
      credentials,
      {
        fields: 'name,url,mimeType,previews',
      },
    ),
    requestJson<TrelloCardDetail['comments']>(
      fetchLike,
      `/cards/${card.id}/actions`,
      credentials,
      {
        fields: 'data,date,id',
        filter: 'commentCard',
        memberCreator: 'true',
        memberCreator_fields: 'avatarHash,avatarUrl,fullName,initials,username',
      },
    ),
  ])
  return {
    attachments,
    card: detailCard,
    comments,
  }
}
