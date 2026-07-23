import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloAttachment } from '../../../TrelloTypes/TrelloTypes.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'
import { getAttachmentImageUrl } from '../../AttachmentHelpers.ts'

export const renderImageAttachment = (
  attachment: Readonly<TrelloAttachment>,
  attachmentImageUrls: Readonly<Record<string, string>>,
  failed: boolean,
): readonly VirtualDomNode[] => {
  const sourceUrl = getAttachmentImageUrl(attachment)
  const imageUrl = attachmentImageUrls[sourceUrl]
  if (failed || !imageUrl) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardDetailImageError',
        type: VirtualDomElements.Div,
      },
      text(TrelloStrings.imageCouldNotBeLoaded()),
    ]
  }
  return [
    {
      alt: attachment.name || TrelloStrings.cardAttachment(),
      childCount: 0,
      className: 'TrelloCardDetailImage',
      name: attachment.id,
      onError: DomEventListenerFunctions.HandleImageError,
      src: imageUrl,
      type: VirtualDomElements.Img,
    },
  ]
}
