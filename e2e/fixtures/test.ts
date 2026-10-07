// The `test` every spec uses. It adds:
//   user     a fresh throwaway account (intake done), deleted after the test
//   herPage  a browser page already logged in as that user, on Home
// Each test gets its own account, so tests never share state.
import { test as base, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, logIn, type TestUser } from "./test-users";

type Fixtures = { user: TestUser; herPage: import("@playwright/test").Page };

export const test = base.extend<Fixtures>({
  user: async ({}, use) => {
    const user = await createTestUser();
    await use(user);
    await deleteTestUser(user.id);
  },
  herPage: async ({ page, user }, use) => {
    await logIn(page, user);
    await use(page);
  },
});

export { expect };
