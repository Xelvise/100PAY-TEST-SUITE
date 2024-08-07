import { test as defaultTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { SignupPage } from './pages/register';
import { CreateInvoicePage } from './pages/create_invoice';
import { BankAccountsPage } from './pages/bank_accounts';
import { PaymentLinksPage } from './pages/payment_links';
import { TransactionsPage } from './pages/transactions';
import { HomePage } from './pages/homepage-assets';

type MyFixtures = {
    homepage: HomePage,
    signupPage: SignupPage,
    InvoicePage: CreateInvoicePage,
    paymentLinksPage: PaymentLinksPage,
    bankAcctsPage: BankAccountsPage,
    transactionPage: TransactionsPage
};

export * from '@playwright/test';
export const test = defaultTest.extend<MyFixtures, { workerStorageState: string }>({
    // Define fixtures for each test
    homepage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    signupPage: async ({ page }, use) => {
        await use(new SignupPage(page));
    },
    InvoicePage: async ({ page }, use) => {
        await use(new CreateInvoicePage(page));
    },
    paymentLinksPage: async ({ page }, use) => {
        await use(new PaymentLinksPage(page));
    },
    bankAcctsPage: async ({ page }, use) => {
        await use(new BankAccountsPage(page));
    },
    transactionPage: async ({ page }, use) => {
        await use(new TransactionsPage(page));
    },

    // Use the same storage state for all tests in this worker.
    storageState: ({ workerStorageState }, use) => use(workerStorageState),

    // Authenticate once per worker with a worker-scoped fixture.
    workerStorageState: [async ({ browser }, use) => {
    // Use parallelIndex as a unique identifier for each worker.
    const id = test.info().parallelIndex;
    const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

    if (fs.existsSync(fileName)) {
      // Reuse existing authentication state if any.
      await use(fileName);
      return;
    }

    // Important: make sure we authenticate in a clean environment by unsetting storage state.
    const page = await browser.newPage({ storageState: undefined });
    const signup_page = new SignupPage(page);
    // Perform authentication steps using newly created account credentials
    // Alternatively, you can have a list of precreated accounts for testing.
    await signup_page.createAccount(faker.person.firstName(), faker.person.lastName(), faker.internet.email({provider: 'gmail.com'}), '080'+faker.string.numeric(8), 'Nigeria', faker.internet.password());
    await page.waitForLoadState('domcontentloaded');
    await signup_page.setTransactionPIN(faker.string.numeric(6));
    await page.waitForLoadState('domcontentloaded');
    await expect(async() => {
        await signup_page.popupWindow.locator('div.w-full.p-4 > div.grid.gap-5 > div').nth(1).click();
        await page.getByRole('button', { name: 'Create Payment Link' }).click();
        await expect(signup_page.popupWindow).toBeHidden();
    }).toPass({intervals: [1_000, 2_000, 3_000, 3_000], timeout: 10_000});

    await page.waitForLoadState();
    // End of authentication steps.
    // Save session state into JSON file.
    await page.context().storageState({ path: fileName });
    await page.close();
    await use(fileName);
    }, 
    { scope: 'worker' }],
});