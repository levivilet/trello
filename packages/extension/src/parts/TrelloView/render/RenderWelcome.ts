import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as TrelloStrings from '../../TrelloStrings/TrelloStrings.ts'
import { trelloPowerUpsUrl } from '../Constants.ts'

const renderWelcomeText = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloWelcomeText',
      type: VirtualDomElements.Div,
    },
    text(value),
  ]
}

const renderWelcomeNote = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloWelcomeNote',
      type: VirtualDomElements.Div,
    },
    text(value),
  ]
}

const renderWelcomeLink = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloWelcomeLink',
      href: trelloPowerUpsUrl,
      target: '_blank',
      type: VirtualDomElements.A,
    },
    text(trelloPowerUpsUrl),
  ]
}

const renderWelcomeStep = (
  number: string,
  children: readonly VirtualDomNode[],
  childCount: number,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloWelcomeStep',
      type: VirtualDomElements.Li,
    },
    {
      childCount: 1,
      className: 'TrelloWelcomeStepNumber',
      type: VirtualDomElements.Span,
    },
    text(number),
    {
      childCount,
      className: 'TrelloWelcomeStepText',
      type: VirtualDomElements.Span,
    },
    ...children,
  ]
}

const renderWelcomeSteps = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 3,
      className: 'TrelloWelcomeSteps',
      type: VirtualDomElements.Ol,
    },
    ...renderWelcomeStep(
      '1',
      [text(TrelloStrings.welcomePowerUp()), ...renderWelcomeLink(), text('.')],
      3,
    ),
    ...renderWelcomeStep('2', [text(TrelloStrings.welcomeApiKey())], 1),
    ...renderWelcomeStep('3', [text(TrelloStrings.welcomeToken())], 1),
  ]
}

export const renderWelcome = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 4,
      className: 'TrelloWelcome',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloWelcomeTitle',
      type: VirtualDomElements.H3,
    },
    text(TrelloStrings.welcome()),
    ...renderWelcomeText(TrelloStrings.welcomeDescription()),
    ...renderWelcomeSteps(),
    ...renderWelcomeNote(TrelloStrings.welcomeSecurity()),
  ]
}
