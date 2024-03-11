import { test, expect, UserPrefix } from '../fixtures';

test.use({ userPrefix: UserPrefix.BceidBasic });

test('test', async ({ inboxLoggedIn }) => {
  await expect(
    inboxLoggedIn.getByRole('heading', { name: 'Portal Inbox' })
  ).toBeVisible();
});
