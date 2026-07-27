import type { TrelloAttachment } from '../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import { resolveCardAttachmentImages } from '../OpenCard/OpenCard.ts'

interface UploadResult {
  readonly attachment?: TrelloAttachment
  readonly error?: unknown
}

const uploadFile = async (
  context: TrelloViewActionContext,
  file: File,
): Promise<UploadResult> => {
  const { client, state } = context
  const { credentials, selectedCardDetail } = state
  if (!credentials || !selectedCardDetail) {
    return {}
  }
  try {
    const attachment = await client.addCardAttachment(
      selectedCardDetail.card,
      file,
      credentials,
    )
    return { attachment }
  } catch (error) {
    return { error }
  }
}

export const uploadCardAttachments = async (
  context: TrelloViewActionContext,
  fileList: FileList | undefined,
): Promise<void> => {
  const state = context.state as TrelloViewState
  const { credentials, selectedCardDetail } = state
  const files = fileList ? [...fileList] : []
  state.cardAttachmentDropActive = false
  if (!credentials || !selectedCardDetail || files.length === 0) {
    context.requestRerender()
    return
  }
  const cardId = selectedCardDetail.card.id
  state.cardAttachmentsUploading = true
  state.error = ''
  context.requestRerender()
  const results = await Promise.all(
    files.map((file) => uploadFile(context, file)),
  )
  if (state.selectedCardDetail?.card.id !== cardId) {
    return
  }
  const attachments = results.flatMap((result) => {
    return result.attachment ? [result.attachment] : []
  })
  const firstError = results.find((result) => result.error)?.error
  state.selectedCardDetail = {
    ...state.selectedCardDetail,
    attachments: [...state.selectedCardDetail.attachments, ...attachments],
  }
  state.cardAttachmentsUploading = false
  if (firstError) {
    state.error = getErrorMessage(firstError)
  }
  context.requestRerender()
  await resolveCardAttachmentImages(context, cardId, attachments)
}
