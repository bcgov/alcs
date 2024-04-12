import { test, expect, UserPrefix } from './fixtures';

test.use({ userPrefix: UserPrefix.BceidBasic });

test('should redirect to inbox after login', async ({ inboxLoggedIn }) => {
  await expect(inboxLoggedIn.getByRole('heading', { name: 'Portal Inbox' })).toBeVisible();
});
