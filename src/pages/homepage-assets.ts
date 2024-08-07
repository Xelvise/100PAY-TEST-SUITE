import { Page, Locator, expect } from "playwright/test";
import { CreateInvoicePage } from "./create_invoice";

export class HomePage {
    page: Page;
    readonly navbar: Locator;
    readonly assetsPage: Locator;
    readonly checkoutPage: Locator;
    readonly paymentsPage: Locator;
    readonly payoutsPage: Locator;
    readonly transactionsPage: Locator;
    readonly createInvoicePage: Locator;
    readonly manageInvoicePage: Locator;
    readonly paymentLinksPage: Locator;
    readonly bankAccountsPage: Locator;
    readonly rewardspage: Locator;
    readonly settingsPage: Locator;
    readonly logoutBtn: Locator;
    readonly crescentIcon: Locator;

    constructor(page: Page) {   // when an instance of this class is created, the constructor is invoked
        this.page = page;
        this.navbar = page.locator('div.top-0.z-50.sticky.px-6')
        this.assetsPage = page.getByRole('link', { name: 'Assets' });
        this.checkoutPage = page.getByRole('link', { name: 'Checkout' });
        this.paymentsPage = page.getByRole('link', { name: 'Payments' });
        this.payoutsPage = page.getByRole('link', { name: 'Payouts' });
        this.transactionsPage = page.getByRole('link', { name: 'Transactions' });
        this.createInvoicePage = page.getByRole('link', { name: 'Create Invoice' });
        this.manageInvoicePage = page.getByRole('link', { name: 'Manage Invoice' });
        this.paymentLinksPage = page.getByRole('link', { name: 'Payment Links' });
        this.bankAccountsPage = page.getByRole('link', { name: 'Bank Accounts' });
        this.rewardspage = page.getByRole('link', { name: 'Rewards' });
        this.settingsPage = page.getByRole('link', { name: 'Settings' });
        this.logoutBtn = page.getByText('Logout');
        this.crescentIcon = page.locator('div.relative > div.top-0.z-50 > div.items-center > div.flex > div > svg');
    };

    async copyPayID() {
        await this.page.getByRole('button', { name: 'user profile image' }).click();
        await this.page.locator('div').filter({ hasText: /^\$PAY ID:$/ }).getByRole('img').click();
    };

    async grabBusinessName() {
        await this.page.getByRole('button', { name: 'user profile image' }).click();
        const name = await this.page.locator('div[dir="ltr"] > div[role="menu"] > div > div > div > div.flex-col > button > div > p').innerText();
        // await this.page.getByRole('button', { name: 'user profile image' }).click();
        return name;
    };

    async NavToProfile() {
        await this.page.getByRole('button', { name: 'user profile image' }).click();
        await this.page.getByRole('link', { name: 'Profile' }).click();
    };

    async NavToPaymentLinks() {
        await this.page.getByRole('button', { name: 'user profile image' }).click();
        await this.page.getByRole('link', { name: 'Payment Links' }).click();
    };

    async NavToSupport() {
        await this.page.getByRole('button', { name: 'user profile image' }).click();
        await this.page.getByRole('link', { name: 'Support' }).click();
    };

    async SwitchTheme(theme:'Light Mode'|'Dark Mode') {
        const switchThemeBtn = this.page.locator('div[role="menuitem"] > p').nth(3);
        await expect(async () => {
            await this.page.getByRole('button', { name: 'user profile image' }).click();
            expect((await switchThemeBtn.allInnerTexts())[1]).toContain(theme)
        }).toPass({intervals: [1_500, 1_500, 1_500], timeout: 5_000});
        await switchThemeBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
    };

    async switchToAssets() {
        await this.assetsPage.click();
        await this.page.waitForLoadState();
    };

    async switchToCheckout() {
        await this.checkoutPage.click();
        await this.page.waitForLoadState();
    };

    async switchToPayments() {
        await this.paymentsPage.click();
        await this.page.waitForLoadState();
    };

    async switchToPayouts() {
        await this.payoutsPage.click();
        await this.page.waitForLoadState();
    };

    async switchToTransactions() {
        await this.transactionsPage.click();
        await this.page.waitForLoadState();
    };

    async switchToCreateInvoice() {
        await this.createInvoicePage.click();
        await this.page.waitForLoadState();
    };

    async switchToManageInvoice() {
        await this.manageInvoicePage.click();
        await this.page.waitForLoadState();
    };

    async switchToPaymentLinks() {
        await this.paymentLinksPage.click();
        await this.page.waitForLoadState();
    };

    async switchToBankAccounts() {
        await this.bankAccountsPage.click();
        await this.page.waitForLoadState();
    };

    async switchToRewards() {
        await this.rewardspage.click();
        await this.page.waitForLoadState();
    };

    async switchToSettings() {
        await this.settingsPage.click();
        await this.page.waitForLoadState();
    };

    async logout() {
        await this.logoutBtn.click();
    };

    formatAmt(value: number) {
        const number = parseFloat(value.toString());
        if (isNaN(number)) {
            throw new Error("Invalid number");
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number).replace('$','USD ');
    };
};