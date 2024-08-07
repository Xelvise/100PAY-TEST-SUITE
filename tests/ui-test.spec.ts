// test function was extended to include custom fixtures and a storage state for each worker. 
// The storage state ensures the browser context of each & every worker is populated with an already authenticated session state 

import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '../src/ui-auth-fixtures';
import { retrieveInvoiceURL, CurrentDate, mailslurp } from '../src/utils';
import { faker } from '@faker-js/faker';

const folderPath = path.join(__dirname, 'tests', 'ui-test.spec.ts-snapshots');
const url = 'https://dashboard.100pay.co', clientName = faker.person.fullName(), clientID = faker.string.numeric(6), clientMobile = '080'+faker.string.numeric(8), clientMail = faker.internet.email({provider: 'gmail.com'}), Description = faker.finance.transactionType(), Amount = faker.number.int({min: 500, max: 10000});
test.describe.configure({ retries: 1 });

test('@POS - Verify that invoice description is half populated with User entries, prior to saving', async ({InvoicePage}) => {
    // navigate to create invoice page
    await InvoicePage.page.goto(url, {waitUntil: 'domcontentloaded'});
    await InvoicePage.switchToCreateInvoice();
    // fill in Client's details
    await InvoicePage.fillInClientDetails(clientName, clientMail, clientMobile, clientID);
    await InvoicePage.SaveAndContinueBtn.click();
    await InvoicePage.page.waitForLoadState('domcontentloaded')
    // verify that saved details of client are visible on the page
    const status = await InvoicePage.verifyInvoiceDetailsVisibility(clientName, clientID, clientMail, clientMobile);
    expect.soft(status).toBeTruthy();
});


test('@POS - Verify that Customer data, when saved, is visible and accessible from Dropdown menu', async ({InvoicePage}) => {
    // navigate to create invoice page
    await InvoicePage.page.goto(url, {waitUntil: 'domcontentloaded'});
    await InvoicePage.switchToCreateInvoice();
    // fill in Client's details
    await InvoicePage.fillInClientDetails(clientName, clientMail, clientMobile, clientID);
    await InvoicePage.SaveAndContinueBtn.click();
    await InvoicePage.page.waitForLoadState('networkidle');
    await expect(async () => {
        await InvoicePage.page.reload({waitUntil: 'domcontentloaded'});
        // verify that saved client details are accessible from the dropdown menu
        expect(await InvoicePage.isClientNameFound(clientName)).toBeTruthy();
    }).toPass({intervals: [1_500, 2_000, 2_000, 2_000], timeout: 10000});
    await InvoicePage.page.getByText(clientName).first().click();
    // verify that saved details of client are visible on the page
    const status = await InvoicePage.verifyInvoiceDetailsVisibility(clientName, clientID, clientMail, clientMobile);
    expect(status).toBeTruthy();
});


test('@POS - Verify that Invoice details, when completely filled, are sent showing a successful alert', async ({InvoicePage}) => {
    // navigate to create invoice page
    await InvoicePage.page.goto(url, {waitUntil: 'domcontentloaded'});
    await InvoicePage.switchToCreateInvoice();
    // fill in Client's details
    await InvoicePage.fillInClientDetails(clientName, clientMail, clientMobile, clientID);
    await InvoicePage.SaveAndContinueBtn.click();
    await InvoicePage.page.waitForLoadState('domcontentloaded');
    // fill in Invoice details
    await InvoicePage.fillInInvoiceData(Amount, 'United States', 'USD', 10, Description, 'https://pay.100pay.co');
    const networkResponse = InvoicePage.page.waitForResponse(response => response.url() === 'https://api.100pay.co/api/v1/pay/user/charge' && response.request().method() === 'POST');
    await InvoicePage.SendInvoiceBtn.click();
    await networkResponse;
    // verify that alert message is displayed
    await expect.soft(InvoicePage.alert.first()).toBeVisible();
    expect.soft(await InvoicePage.alert.first().innerText()).toContain('Customer Invoice Created');
});


test('@NEG - Verify that Invoice details, without a ThankYouPage URL, are not sent but indicates an error message', async ({InvoicePage}) => {
    // navigate to create invoice page
    await InvoicePage.page.goto(url, {waitUntil: 'domcontentloaded'});
    await InvoicePage.switchToCreateInvoice();
    // fill in Client's details
    await InvoicePage.fillInClientDetails(clientName, clientMail, clientMobile, clientID);
    await InvoicePage.SaveAndContinueBtn.click();
    await InvoicePage.page.waitForLoadState('domcontentloaded');
    // fill in Invoice details
    await InvoicePage.fillInInvoiceData(Amount, 'United States', 'USD', 10, Description, '');
    const networkResponse = InvoicePage.page.waitForResponse(response => response.url() === 'https://api.100pay.co/api/v1/pay/user/charge' && response.request().method() === 'POST');
    await InvoicePage.SendInvoiceBtn.click();
    await networkResponse;
    // verify that alert message is displayed
    await expect.soft(InvoicePage.alert.first()).toBeVisible();
    expect.soft(await InvoicePage.alert.first().innerText()).not.toContain('Customer Invoice Created');
});


test.describe.skip(() => {
    test.describe.configure({ mode: 'serial' });
    let invoiceURL: string, businessName: string;

    test('@POS - Verify that successfully sent Invoice gets delivered to Customer\'s pre-set email address', async ({InvoicePage}) => {
        test.setTimeout(2.5*60*1000);
        const inbox = await mailslurp.inboxController.createInboxWithDefaults();
        // navigate to create invoice page
        await InvoicePage.page.goto(url, {waitUntil: 'domcontentloaded'});
        await InvoicePage.switchToCreateInvoice();
        businessName = await InvoicePage.grabBusinessName();
        // fill in Client's details
        await InvoicePage.fillInClientDetails(clientName, clientMail, clientMobile, clientID);
        await InvoicePage.SaveAndContinueBtn.click();
        await InvoicePage.page.waitForLoadState('domcontentloaded');
        // fill in Invoice details
        await InvoicePage.fillInInvoiceData(Amount, 'United States', 'USD', 10, Description, 'https://pay.100pay.co');
        const networkResponse = InvoicePage.page.waitForResponse(response => response.url() === 'https://api.100pay.co/api/v1/pay/user/charge' && response.request().method() === 'POST');
        await InvoicePage.SendInvoiceBtn.click();
        const response = await networkResponse;
        expect(response.status()).toBe(200);
        // retrieve the invoice URL from the client's email
        invoiceURL = await retrieveInvoiceURL(inbox.id);
        expect(invoiceURL).toContain('https://pay.100pay.co/pay/');
    });

    test('@POS - Verify that Customer can view Invoice details and make payment, using the URL sent to their email', async ({InvoicePage}) => {
        // navigate to the invoice URL
        await InvoicePage.page.goto(invoiceURL, {waitUntil: 'domcontentloaded'});
        expect(InvoicePage.page.url()).toBe(invoiceURL);
        await expect(InvoicePage.page.getByText(businessName)).toBeVisible();
    });
});

test('@POS - Verify that successfully sent Invoice is accurately shown on Transaction history and tagged "unpaid"', async ({InvoicePage, transactionPage}) => {
    // navigate to create invoice page
    await InvoicePage.page.goto(url, {waitUntil: 'domcontentloaded'});
    await InvoicePage.switchToCreateInvoice();
    // fill in Client's details
    await InvoicePage.fillInClientDetails(clientName, clientMail, clientMobile, clientID);
    await InvoicePage.SaveAndContinueBtn.click();
    await InvoicePage.page.waitForLoadState('domcontentloaded');
    // fill in Invoice details
    await InvoicePage.fillInInvoiceData(Amount, 'United States', 'USD', 10, Description, 'https://pay.100pay.co');
    const networkResponse = InvoicePage.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/pay/user/charge' && response.request().method()==='POST');
    await InvoicePage.SendInvoiceBtn.click();
    const response = await networkResponse;
    expect(response.status()).toBe(200);
    await InvoicePage.page.reload();
    // navigate to Transactions page
    await InvoicePage.switchToTransactions();
    await transactionPage.page.waitForLoadState('domcontentloaded');
    // await transactionPage.page.pause();
    await expect(transactionPage.TrxRows.first()).toBeVisible({timeout: 10000});
    const {name, amount, date, status} = await transactionPage.ViewTrxReceipt(clientName, Amount);
    expect.soft(name).toBe(clientName);
    expect.soft(amount).toBe(transactionPage.formatAmt(Amount));
    expect.soft(date).toBe(CurrentDate());
    expect.soft(status).toBe('UNPAID');
});


test.describe(() => {
    test.describe.configure({ mode: 'serial' });
    let link: string, clippedLink: unknown, businessName: string;

    test('@POS - Verify that new Payment links can be generated and copied successfully, given the required details', async ({paymentLinksPage}) => {
        await paymentLinksPage.page.goto(url, {waitUntil: 'domcontentloaded'});
        // navigate to Payment Links page
        businessName = await paymentLinksPage.grabBusinessName();
        await paymentLinksPage.switchToPaymentLinks();
        await paymentLinksPage.page.waitForLoadState('domcontentloaded');
        // create a new Payment Link
        await paymentLinksPage.createPaymentLink(Description, 'USD', Amount, faker.string.numeric(6), faker.person.jobDescriptor(), 'https://pay.100pay.co');
        const networkResponse = paymentLinksPage.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/pay/payment_page' && response.request().method()==='POST');
        await paymentLinksPage.CreateLinkBtn.click();
        const response = await networkResponse;
        expect(response.status()).toBe(200);
        link = await paymentLinksPage.popupWindow.locator('div.relative > div.relative > div.mb-4 > div.w-full > p').last().innerText();
        expect(link).toContain('https://');
        // await expect(async () => {
        //     await paymentLinksPage.popupWindow.locator('div:nth-child(4) > .cursor-pointer').click();
        //     clippedLink = await paymentLinksPage.page.evaluate("navigator.clipboard.readText()");
        //     console.log(clippedLink);
        //     expect.soft(clippedLink).toBe(link);
        // }).toPass({intervals: [2_000, 2_000, 2_000], timeout: 10_000})
    });

    test('@POS - Verify that generated payment link is valid and accessible', async ({paymentLinksPage}) => {
        const uri = String(clippedLink ? clippedLink : link);
        await paymentLinksPage.page.goto(uri, {waitUntil: 'domcontentloaded'});
        expect(paymentLinksPage.page.url()).toBe(uri);
        await expect(paymentLinksPage.page.getByText(businessName)).toBeVisible();
    });

});

test('@POS - Verify that successfully generated payment links are recorded accurately', async ({paymentLinksPage}) => {
    await paymentLinksPage.page.goto(url, {waitUntil: 'domcontentloaded'});
    // navigate to Payment Links page
    await paymentLinksPage.switchToPaymentLinks();
    await paymentLinksPage.page.waitForLoadState('domcontentloaded');
    // create a new Payment Link
    await paymentLinksPage.createPaymentLink(Description, 'USD', Amount, faker.string.numeric(6), faker.person.jobDescriptor(), 'https://pay.100pay.co');
    const networkResponse = paymentLinksPage.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/pay/payment_page' && response.request().method()==='POST');
    await paymentLinksPage.CreateLinkBtn.click();
    const response = await networkResponse;
    expect(response.status()).toBe(200);
    await paymentLinksPage.popupWindow.getByRole('button', { name: 'Cancel' }).click();
    expect(await paymentLinksPage.NumOfPaymentLinks()).toBeGreaterThanOrEqual(1);
    const {name, amount, date} = await paymentLinksPage.latestPaymentLink();
    expect.soft(name).toBe(Description);
    expect.soft(amount).toContain(paymentLinksPage.formatAmt(Amount));
    expect.soft(date).toBe(CurrentDate());
});


test('@POS - Verify that bank name is visible, upon adding Account details', async ({bankAcctsPage}) => {
    await bankAcctsPage.page.goto(url, {waitUntil: 'domcontentloaded'});
    // navigate to Bank Accounts page
    await bankAcctsPage.switchToBankAccounts();
    await bankAcctsPage.page.waitForLoadState('domcontentloaded');
    // add a new Bank Account
    await bankAcctsPage.enterBankDetails('PalmPay', 8132198222);
    const networkResponse = bankAcctsPage.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/user/validate-account-number' && response.request().method()==='POST');
    await bankAcctsPage.VerifyBankBtn.click();
    const response = await networkResponse;
    expect(response.status()).toBe(200);
    await expect(bankAcctsPage.AcctNameField).toBeVisible();
    const AcctName = await bankAcctsPage.AcctNameField.locator('div > p').innerText()
    expect(AcctName.length).toBeGreaterThan(0);
});


test('@POS - Verify that a Bank account can be added successfully', async ({bankAcctsPage}) => {
    await bankAcctsPage.page.goto(url, {waitUntil: 'domcontentloaded'});
    // navigate to Bank Accounts page
    await bankAcctsPage.switchToBankAccounts();
    await bankAcctsPage.page.waitForLoadState('domcontentloaded');
    // add a new Bank Account
    await bankAcctsPage.enterBankDetails('PalmPay', 8132198222);
    const networkResponse = bankAcctsPage.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/user/validate-account-number' && response.request().method()==='POST');
    await bankAcctsPage.VerifyBankBtn.click();
    const response = await networkResponse;
    expect(response.status()).toBe(200);
    await expect(bankAcctsPage.AcctNameField).toBeVisible();
    const AcctName = await bankAcctsPage.AcctNameField.locator('div > p').innerText()
    expect.soft(AcctName.length).toBeGreaterThan(0);
    await bankAcctsPage.AddBankBtn.click();
    await bankAcctsPage.page.waitForLoadState('domcontentloaded');
    await expect(bankAcctsPage.popupWindow).toBeHidden({timeout: 10000});
    const status = await bankAcctsPage.isAcctSaved(8132198222, 'PalmPay');
    expect(status).toBeTruthy();
    expect(await bankAcctsPage.NumOfBankAccts()).toBe(1);
});


test('@POS - Verify that Instant Payout can be enabled on a bank account', async ({bankAcctsPage}) => {
    await bankAcctsPage.page.goto(url, {waitUntil: 'domcontentloaded'});
    // navigate to Bank Accounts page
    await bankAcctsPage.switchToBankAccounts();
    await bankAcctsPage.page.waitForLoadState('domcontentloaded');
    // add a new Bank Account
    await bankAcctsPage.enterBankDetails('PalmPay', 8132198222);
    const networkResponse = bankAcctsPage.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/user/validate-account-number' && response.request().method()==='POST');
    await bankAcctsPage.VerifyBankBtn.click();
    const response = await networkResponse;
    expect(response.status()).toBe(200);
    await expect(bankAcctsPage.AcctNameField).toBeVisible();
    const AcctName = await bankAcctsPage.AcctNameField.locator('div > p').innerText()
    expect.soft(AcctName.length).toBeGreaterThan(0);
    await bankAcctsPage.AddBankBtn.click();
    await bankAcctsPage.page.waitForLoadState('domcontentloaded');
    await expect(bankAcctsPage.popupWindow).toBeHidden({timeout: 10000});
    const status = await bankAcctsPage.isAcctSaved(8132198222, 'PalmPay');
    expect(status).toBeTruthy();
    // verify that instant payout has been toggled
    await bankAcctsPage.enableInstantPayout(8132198222, 'PalmPay');
    // verify that newly added bank account has been enabled for instant payout
    await expect(bankAcctsPage.AcctRows.first().locator('td').first().locator('svg')).toBeVisible();
});


test('@POS - Verify that User can switch between Light and Dark themes', async ({homepage}) => {
    await homepage.page.goto(url, {waitUntil: 'domcontentloaded'});
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    };
    await homepage.navbar.screenshot({path: 'ui-test.spec.ts-snapshots/light-theme-chromium-linux.png'});
    // switch to Dark theme
    // await homepage.SwitchTheme('Dark Mode');
    await homepage.crescentIcon.click();
    await homepage.page.waitForLoadState('domcontentloaded');
    expect.soft(await homepage.navbar.screenshot()).not.toMatchSnapshot('light-theme.png');
    // switch to Light theme
    // await homepage.SwitchTheme('Light Mode');
    await homepage.crescentIcon.click();
    await homepage.page.waitForLoadState('domcontentloaded');
    await homepage.page.waitForTimeout(1500);
    expect.soft(await homepage.navbar.screenshot()).toMatchSnapshot('light-theme.png');
});