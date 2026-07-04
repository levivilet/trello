import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as Dom from '../../VirtualDom/VirtualDom.ts'
import { trelloPowerUpsUrl } from '../Constants.ts'

const renderWelcomeText = (text: string): Dom.TreeNode => {
  return Dom.div('TrelloWelcomeText', [Dom.textNode(text)])
}

const renderWelcomeContent = (
  children: readonly Dom.TreeNode[],
): Dom.TreeNode => {
  return Dom.div('TrelloWelcomeText', children)
}

export const renderWelcome = (): Dom.TreeNode => {
  return Dom.div('TrelloWelcome', [
    Dom.node(VirtualDomElements.H3, { className: 'TrelloWelcomeTitle' }, [
      Dom.textNode('Welcome to Trello'),
    ]),
    renderWelcomeText(
      'Connect your Trello account to browse your boards from Lvce Editor.',
    ),
    renderWelcomeContent([
      Dom.textNode('Create or open a Trello Power-Up at '),
      Dom.link('TrelloWelcomeLink', trelloPowerUpsUrl, trelloPowerUpsUrl),
      Dom.textNode(', then open the API Key tab and generate an API key.'),
    ]),
    renderWelcomeText(
      "Use that key to generate a token from Trello's authorization page, then paste both values here.",
    ),
    renderWelcomeText(
      'The API key identifies the app. The token grants access to your Trello account, so keep the token private.',
    ),
  ])
}
