import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TrelloAttachment } from '../../../TrelloTypes/TrelloTypes.ts'
import type { VirtualDomSegment } from '../VirtualDomSegment/VirtualDomSegment.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'
import { isImageAttachment } from '../../AttachmentHelpers.ts'
import { renderImageAttachment } from '../RenderImageAttachment/RenderImageAttachment.ts'
import { renderListTitle } from '../RenderListTitle/RenderListTitle.ts'

export const renderCardDetailImages = (
  loading: boolean,
  attachments: readonly TrelloAttachment[],
  attachmentImageUrls: Readonly<Record<string, string>>,
  failedImageIds: readonly string[],
): VirtualDomSegment => {
  if (loading) {
    return {
      childCount: 2,
      dom: [
        ...renderListTitle(TrelloStrings.images()),
        {
          childCount: 1,
          className: 'TrelloCardDetailEmpty',
          type: VirtualDomElements.Div,
        },
        text(TrelloStrings.loadingImages()),
      ],
    }
  }
  const imageAttachments = attachments.filter(isImageAttachment)
  if (imageAttachments.length === 0) {
    return { childCount: 0, dom: [] }
  }
  return {
    childCount: 2,
    dom: [
      ...renderListTitle(TrelloStrings.images()),
      {
        childCount: imageAttachments.length,
        className: 'TrelloCardDetailImages',
        type: VirtualDomElements.Div,
      },
      ...imageAttachments.flatMap((attachment) =>
        renderImageAttachment(
          attachment,
          attachmentImageUrls,
          failedImageIds.includes(attachment.id),
        ),
      ),
    ],
  }
}
