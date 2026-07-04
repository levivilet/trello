import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewActionContext } from '../state/TrelloViewState.ts'
import { closeCardDetail } from './CloseCardDetail.ts'
import { connect } from './Connect.ts'
import { goBackToBoards } from './GoBackToBoards.ts'
import { loadBoards } from './LoadBoards.ts'
import { logout } from './Logout.ts'
import { openBoard } from './OpenBoard.ts'
import { openCard } from './OpenCard.ts'
import { saveCardDetail } from './SaveCardDetail.ts'

export const handleClickEvent = async (
  context: TrelloViewActionContext,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  switch (event.name) {
    case 'backToBoards':
      await goBackToBoards(context)
      return
    case 'closeCardDetail':
      closeCardDetail(context)
      return
    case 'connect':
      await connect(context)
      return
    case 'logout':
      await logout(context)
      return
    case 'refreshBoards':
      await loadBoards(context)
      return
    case 'saveCardDetail':
      await saveCardDetail(context)
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
