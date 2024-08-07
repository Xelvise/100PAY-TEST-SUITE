import {Page, Locator, expect} from "playwright/test";
import {HomePage} from "./homepage-assets";

/**
 * This page lets Users save thier Bank accounts and reveals all
 * @extends HomePage
 */
export class BankAccountsPage extends HomePage {
    readonly AcctRows: Locator;
    readonly InstantPayoutToggle: Locator;
    readonly AddNewBtn: Locator;
    readonly DoneBtn: Locator;
    readonly DisableAcctBtn: Locator;
    readonly popupWindow: Locator;
    readonly VerifyBankBtn: Locator;
    readonly AddBankBtn: Locator;
    readonly AcctNameField: Locator

    constructor(page: Page) {   // when an instance of this class is created, the constructor is invoked
        super(page);    // invokes the constructor of the parent class
        this.AcctRows = page.locator('div.flex > div.w-full > div.flex > div > table.w-full > tbody > tr');
        this.InstantPayoutToggle = page.locator('#payout');
        this.AddNewBtn = page.getByRole('button', { name: 'Add New' });
        this.DoneBtn = page.getByRole('button', { name: 'Done' });
        this.DisableAcctBtn = page.getByRole('button', { name: 'Disable' });
        this.popupWindow = page.locator('div.absolute.w-screen.h-screen > div.relative.overflow-scroll');
        this.VerifyBankBtn = page.getByRole('button', { name: 'Verify Bank' });
        this.AddBankBtn = page.getByRole('button', { name: 'Add Bank' });
        this.AcctNameField = this.popupWindow.locator('div.relative > form > div.mt-6').nth(1);
    };

    /**
     * Add a new bank account
     * @param bankName - The name of the bank
     * @param accountNumber - The account number
     * @returns The account name
     */
    async enterBankDetails(bankName:'Access Bank'|'United Bank For Africa'|'PalmPay'|'Kuda Bank'|string, accountNumber:number) {
        await this.AddNewBtn.click();
        await expect(this.popupWindow).toBeVisible();
        await this.page.locator('div').filter({ hasText: /^Input bank name$/ }).first().click();
        await this.page.getByText(bankName).first().click();
        await this.page.getByPlaceholder('Input account number').fill(accountNumber.toString());
    };

    /**
     * Checks if Instant Payout is activated
     * @returns True if activated, False otherwise
     */
    async isPayoutToggled() {
        if (await this.InstantPayoutToggle.getAttribute('data-state') === 'checked') {
            return true;
        };
        return false;
    }

    /**
     * Checks if the bank account is saved
     * @param accountNumber - The account number
     * @param bankName - The name of the bank
     * @returns True if saved, False otherwise
     */
    async isAcctSaved(accountNumber:number, bankName:string) {
        const bankAccts = await this.AcctRows.all();
        for (const each of bankAccts) {
            const acctDetails = await each.locator('td').all();
            if (await acctDetails[1].innerText()===accountNumber.toString() && await acctDetails[0].innerText()===bankName) {
                return true;
            }
        };
        return false;
    };


    /**
     * Activates Instant Payout
     * @param accountNumber - The account number
     * @param bankName - The name of the bank
     * @returns True if activated, False otherwise
     */
    async enableInstantPayout(accountNumber: number, bankName: string) {
        expect(await this.isPayoutToggled()).toBeFalsy();
        await this.InstantPayoutToggle.click();
        const popup = this.page.locator('div.absolute.w-full.h-screen > div');
        await expect(popup).toBeVisible();
        const accts = await popup.locator('div.gap-2.my-5 > div').all()
        for (const each of accts) {
            const acctNum = await each.locator('p').nth(0).innerText();
            const bank = await each.locator('p').nth(1).innerText();
            if (acctNum===accountNumber.toString() && bank.match(new RegExp(bankName,'i')) !== null) {
                await each.click();
                break;
            } else {
                return 'Bank Account not found';
            };
        };
        const responsePromise = this.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/pay/bank_accounts' && response.status()===200 && response.request().method() === 'GET')
        await this.page.getByRole('button', { name: 'Done' }).click();
        await responsePromise;
        expect(popup).toBeHidden({timeout: 10000});
        await this.page.waitForLoadState('domcontentloaded');
        expect(await this.isPayoutToggled()).toBeTruthy();
    };

    /**
     * Deactivates Instant Payout
     * @returns True if deactivated, False otherwise
     */
    async disableInstantPayout() {
        expect(await this.isPayoutToggled()).toBeTruthy();
        await this.InstantPayoutToggle.click();
        const popup = this.page.locator('div.absolute.w-full.h-screen > div');
        await expect(popup).toBeVisible();
        const responsePromise = this.page.waitForResponse(response => response.url()==='https://api.100pay.co/api/v1/pay/bank_accounts' && response.status()===200 && response.request().method() === 'GET');
        await this.page.getByRole('button', { name: 'Disable' }).click();
        await responsePromise;
        expect(popup).toBeHidden({timeout: 10000});
        await this.page.waitForLoadState('domcontentloaded');
        expect(await this.isPayoutToggled()).toBeFalsy();
    };

    /**
     * Deletes a bank account
     * @param accountNumber - The account number
     * @param bankName - The name of the bank
     * @returns True if deleted, False otherwise
     */
    async deleteBankAcct(accountNumber:number, bankName:string) {
        expect(await this.isAcctSaved(accountNumber, bankName)).toBeTruthy();
        await this.page.getByRole('row', { name: `${bankName} ${accountNumber}` }).getByRole('paragraph').click();  // click on the delete button
        await expect(this.popupWindow).toBeVisible();
        await this.page.getByRole('button', { name: 'Confirm' }).click();
        await this.page.waitForLoadState('domcontentloaded');
        expect(await this.isAcctSaved(accountNumber, bankName)).toBeFalsy();
        return true;
    };

    async NumOfBankAccts() {
        const bankAccts = await this.AcctRows.count();
        return bankAccts;
    };
};
