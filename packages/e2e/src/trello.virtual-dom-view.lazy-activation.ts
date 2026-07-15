import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.lazy-activation'

interface RunningExtension {
  readonly activationEvent: string
  readonly id: string
}

const extensionId = 'builtin.trello'
const viewId = 'trello.views.boards'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('ActivityBar.handleExtensionsChanged')

  const item = Locator('.ActivityBarItem[title="Trello"]')
  await expect(item).toBeVisible()
  await expect(item).toHaveAttribute('aria-selected', 'false')

  const runningExtensionsBefore = (await Command.execute(
    'ExtensionManagement.getRunningExtensions',
  )) as readonly RunningExtension[]
  const extensionRunningBefore = runningExtensionsBefore.some(
    (extension) => extension.id === extensionId,
  )
  if (extensionRunningBefore) {
    throw new Error(
      `Expected ${extensionId} not to be running before its view becomes active`,
    )
  }

  // eslint-disable-next-line e2e/no-direct-click
  await item.click()

  const apiKey = Locator('input[name="apiKey"]')
  await expect(item).toHaveAttribute('aria-selected', 'true')
  await expect(apiKey).toBeVisible()

  const runningExtensionsAfter = (await Command.execute(
    'ExtensionManagement.getRunningExtensions',
  )) as readonly RunningExtension[]
  const extensionAfter = runningExtensionsAfter.find(
    (extension) => extension.id === extensionId,
  )
  if (!extensionAfter) {
    throw new Error(
      `Expected ${extensionId} to be running after its view becomes active`,
    )
  }
  if (extensionAfter.activationEvent !== `onView:${viewId}`) {
    throw new Error(`Expected ${extensionId} to be activated by ${viewId}`)
  }
}
