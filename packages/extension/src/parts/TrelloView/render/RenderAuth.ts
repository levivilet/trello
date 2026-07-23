import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../MergeClassNames/MergeClassNames.ts'
import { renderError, renderField } from './RenderShared.ts'
import { renderWelcome } from './RenderWelcome.ts'

export const renderAuth = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftApiKey, draftToken, error, loading } = state
  const errorDom = renderError(error)
  return [
    {
      childCount: 2,
      className: MergeClassNames.mergeClassNames('TrelloView', 'TrelloAuth'),
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2 + (errorDom.length > 0 ? 1 : 0),
      className: 'TrelloAuthForm',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'TrelloAuthFields',
      type: VirtualDomElements.Div,
    },
    ...renderField('API key', 'apiKey', draftApiKey),
    ...renderField('Token', 'token', draftToken, 'password'),
    {
      childCount: 1,
      className: 'TrelloButton',
      name: 'connect',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(loading ? 'Connecting...' : 'Connect'),
    ...errorDom,
    ...renderWelcome(),
  ]
}
