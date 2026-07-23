import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewActionContext } from '../TrelloViewState/TrelloViewState.ts'
import {
  cancelAddCard,
  startAddCard,
  submitAddCard,
} from '../AddCard/AddCard.ts'
import {
  cancelWriteComment,
  startWriteComment,
  submitComment,
} from '../AddComment/AddComment.ts'
import { startAddList } from '../AddList/AddList.ts'
import {
  closeBoardFilter,
  openBoardFilter,
} from '../BoardFilter/BoardFilter.ts'
import { cancelCardDescriptionEdit } from '../CancelCardDescriptionEdit/CancelCardDescriptionEdit.ts'
import {
  addCardLabel,
  closeCardLabelPicker,
  openCardLabelPicker,
} from '../CardLabelPicker/CardLabelPicker.ts'
import { closeCardDetail } from '../CloseCardDetail/CloseCardDetail.ts'
import { connect } from '../Connect/Connect.ts'
import {
  closeCardLabelCreate,
  createCardLabel,
  openCardLabelCreate,
  selectCardLabelColor,
} from '../CreateCardLabel/CreateCardLabel.ts'
import {
  editCardDescription,
  editCardTitle,
} from '../EditCardDetail/EditCardDetail.ts'
import { goBackToBoards } from '../GoBackToBoards/GoBackToBoards.ts'
import { loadBoards } from '../LoadBoards/LoadBoards.ts'
import { logout } from '../Logout/Logout.ts'
import { openBoard } from '../OpenBoard/OpenBoard.ts'
import { openCard } from '../OpenCard/OpenCard.ts'
import { saveCardDetail } from '../SaveCardDetail/SaveCardDetail.ts'

export const handleClickEvent = async (
  context: TrelloViewActionContext,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  if (event.name === 'cardTitle' || event.name === 'editCardTitle') {
    editCardTitle(context)
    return
  }
  if (event.name?.startsWith('addCard:')) {
    startAddCard(context, event.name.slice('addCard:'.length))
    return
  }
  if (event.name?.startsWith('submitAddCard:')) {
    await submitAddCard(
      context,
      `addCard:${event.name.slice('submitAddCard:'.length)}`,
    )
    return
  }
  if (event.name?.startsWith('addCardLabel:')) {
    await addCardLabel(context, event.name.slice('addCardLabel:'.length))
    return
  }
  if (event.name?.startsWith('selectCardLabelColor:')) {
    selectCardLabelColor(
      context,
      event.name.slice('selectCardLabelColor:'.length),
    )
    return
  }
  switch (event.name) {
    case 'backToBoards':
      await goBackToBoards(context)
      return
    case 'cancelAddCard':
      cancelAddCard(context)
      return
    case 'cancelCardDescriptionEdit':
      cancelCardDescriptionEdit(context)
      return
    case 'cancelWriteComment':
      cancelWriteComment(context)
      return
    case 'closeBoardFilter':
      closeBoardFilter(context)
      return
    case 'closeCardDetail':
      closeCardDetail(context)
      return
    case 'closeCardLabelCreate':
      closeCardLabelCreate(context)
      return
    case 'closeCardLabelPicker':
      closeCardLabelPicker(context)
      return
    case 'connect':
      await connect(context)
      return
    case 'createCardLabel':
      await createCardLabel(context)
      return
    case 'editCardDescription':
      editCardDescription(context)
      return
    case 'logout':
      await logout(context)
      return
    case 'openBoardFilter':
      openBoardFilter(context)
      return
    case 'openCardLabelCreate':
      openCardLabelCreate(context)
      return
    case 'openCardLabelPicker':
      await openCardLabelPicker(context)
      return
    case 'refreshBoards':
      await loadBoards(context)
      return
    case 'saveCardDetail':
      await saveCardDetail(context)
      return
    case 'startAddList':
      startAddList(context)
      return
    case 'startWriteComment':
      startWriteComment(context)
      return
    case 'submitComment':
      await submitComment(context)
      return
    default:
      if (event.name?.startsWith('board:')) {
        await openBoard(context, event.name.slice('board:'.length))
        return
      }
      if (event.name?.startsWith('card:')) {
        await openCard(context, event.name.slice('card:'.length))
      }
  }
}
