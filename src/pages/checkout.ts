import {Page, Locator, expect} from "playwright/test";
import {HomePage} from "./homepage-assets";

/**
 * This page lets User monitor and manage Business income and expenses
 * @extends HomePage
 */
export class CheckoutPage extends HomePage {
    readonly userBusinessDropdown: Locator;
    readonly popupWindow: Locator;
    readonly viewPayoutsLink: Locator;
    readonly AddBankBtn: Locator;
    readonly WithdrawBtn: Locator;
    readonly viewTrxsBtn: Locator;
    readonly CreatePayLinkBtn: Locator;
    readonly ViewPaymentsBtn: Locator;
    readonly CheckoutBalance: Locator;
    readonly TotalPayments: Locator;
    readonly NumOfTrxs: Locator;
    readonly NumOfPaymentLinks: Locator;
    readonly NumOfInvoices: Locator;
    readonly NumOfCustomers: Locator;

    constructor(page: Page) {
        super(page);
        this.userBusinessDropdown = page.locator('main.flex > div > div > div > div.flex > button');
        this.popupWindow = this.page.locator('div.absolute.w-screen.h-screen > div.relative.overflow-scroll');
        this.viewPayoutsLink = page.getByRole('link', { name: 'View Payouts' });
        this.AddBankBtn = page.getByRole('button', { name: 'Add Bank' });
        this.WithdrawBtn = page.getByRole('button', { name: 'Withdraw' });
        this.viewTrxsBtn = page.getByRole('button', { name: 'Transactions' });
        this.CreatePayLinkBtn = page.locator('main.flex > div > div.flex > div.rounded-xl > div.flex.gap-3 > a[href="/payment-links"] > div.hidden > button');
        this.ViewPaymentsBtn = page.getByRole('button', { name: 'View Payments' });
        this.CheckoutBalance = page.locator('main.flex > div > div.flex > div.w-full > div.flex > p.flex > span');
        this.TotalPayments = page.locator('main.flex > div > div.flex > div.w-full > div.flex > p.flex').first();
        this.NumOfTrxs = page.locator('div.flex > div.grid > a[href="/transactions"] > div > div > p.text-modernblack-10');
        this.NumOfPaymentLinks = page.locator('div.flex > div.grid > a[href="/payment-links"] > div > div > p.text-modernblack-10');
        this.NumOfInvoices = page.locator('div.flex > div.grid > a[href="/manage-invoice"] > div > div > p.text-modernblack-10');
        this.NumOfCustomers = page.locator('div.flex > div.grid > a[href="/create-invoice"] > div > div > p.text-modernblack-10');
    }

    async AddBankAcct(bankName:string, accountNumber:string) {
        await this.AddBankBtn.click();
        await expect(this.popupWindow).toBeVisible();
        await this.page.locator('div').filter({ hasText: /^Input bank name$/ }).first().click();
        await this.page.getByText(bankName, { exact: true }).click();
        await this.page.getByPlaceholder('Input account number').fill(accountNumber);
        await this.page.getByRole('button', { name: 'Verify Bank' }).click();
        const AcctNameField = this.popupWindow.locator('div.relative > form > div.mt-6').nth(1);
        await expect(AcctNameField).toBeVisible();
        await this.page.getByRole('button', {name: 'Add Bank'}).click();
        const AcctName = await AcctNameField.locator('div.bg-payred-01 > p').innerText();
        return AcctName;
    };

    async WithdrawToCashBal(amount:string, pin:string) {
        await this.WithdrawBtn.click();
        await expect(this.popupWindow).toBeVisible();
        await this.page.getByPlaceholder('Enter Amount').fill(amount);
        await this.page.getByPlaceholder('Enter Pin').fill(pin);
        // if withdrawal button is enabled, click on it.
        await expect(this.popupWindow.locator('div.relative > div.mt-8 > form > div.grid > button[type="submit"]')).toBeEnabled();
        await this.popupWindow.locator('div.relative > div.mt-8 > form > div.grid > button[type="submit"]').click();
        await expect(this.popupWindow).toBeHidden();
        return true;
    };

    async ViewTrxs() {
        await this.viewTrxsBtn.click();
    };

    async CreatePayLink() {
        await this.CreatePayLinkBtn.click();
    };

    async ViewPayments() {
        await this.ViewPaymentsBtn.click();
    };
};