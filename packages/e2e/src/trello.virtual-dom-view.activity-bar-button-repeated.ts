import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.activity-bar-button-repeated'

const waitFor = async (assertion: () => Promise<void>): Promise<void> => {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await assertion()
      return
    } catch (error) {
      if (attempt === 99) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  await Command.execute('ActivityBar.handleExtensionsChanged')
  await Command.executeExtensionCommand('trello.test.useMockData', {
    boards: [],
  })

  const trelloItem = Locator('.ActivityBarItem[title="Trello"]')
  const explorerView = Locator('.Viewlet.Explorer')
  const apiKey = Locator('input[name="apiKey"]')
  await expect(trelloItem).toBeVisible()

  await SideBar.open('Explorer')
  await waitFor(() => expect(explorerView).toBeVisible())

  // eslint-disable-next-line e2e/no-direct-click
  await trelloItem.click()
  await waitFor(() =>
    expect(trelloItem).toHaveAttribute('aria-selected', 'true'),
  )
  await waitFor(() => expect(apiKey).toBeVisible())

  await SideBar.open('Explorer')
  await waitFor(() => expect(explorerView).toBeVisible())

  // eslint-disable-next-line e2e/no-direct-click
  await trelloItem.click()
  await waitFor(() =>
    expect(trelloItem).toHaveAttribute('aria-selected', 'true'),
  )
  await waitFor(() => expect(apiKey).toBeVisible())
}
