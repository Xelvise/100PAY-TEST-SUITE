import {Page, Locator, expect} from '@playwright/test';
import { HomePage } from './homepage-assets';

/**
 * This page reveals details of all Payment Links created by User
 * @extends HomePage
 */
export class PaymentLinksPage extends HomePage {
    readonly CreateNewLinkBtn: Locator;
    readonly CancelBtn: Locator;
    readonly PaymentLinkNameField: Locator;
    readonly CurrencyDropdown: Locator;
    readonly AmountField: Locator;
    readonly QRcodeField: Locator;
    readonly DescriptionField: Locator;
    readonly ThankYouPageField: Locator;
    readonly CreateLinkBtn: Locator;
    readonly popupWindow: Locator;

    constructor(page: Page) {
        super(page);
        // this.CreateNewLinkBtn = page.getByRole('button', { name: 'Create new link' });
        this.CreateNewLinkBtn = page.locator('div[class="w-[157px]"] > a');
        this.CancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
        this.PaymentLinkNameField = page.getByPlaceholder('Enter a link name');
        this.CurrencyDropdown = page.locator('.grid > div:nth-child(2) > div').first();
        this.AmountField = page.locator('input[name="amount"]');
        this.QRcodeField = page.getByPlaceholder('Enter number on QR code');
        this.DescriptionField = page.getByPlaceholder('Enter a description');
        this.ThankYouPageField = page.getByPlaceholder('https://pay.100pay.co');
        this.CreateLinkBtn = page.getByRole('button', { name: 'Create Link', exact: true });
        this.popupWindow = this.page.locator('div.absolute.w-screen.h-screen > div.relative.overflow-scroll');
    };

    /**
     * Create a new Payment Link
     * @param linkName - The name of the Payment Link
     * @param currency - The currency of the Payment Link
     * @param amount - The amount to be paid (Optional)
     * @param QRcode - The number on the QR code
     * @param description - The description of the Payment Link
     * @param thankYouPage - The URL of the thank you page
     * @returns The URL of the created Payment
     */
    async createPaymentLink(linkName:string, currency:'USD'|'NGN'|'UGX'|'AED'|string, amount:number, QRcode:string, description:string, thankYouPage:string) {
        // await expect(async () => {
        await this.CreateNewLinkBtn.dispatchEvent('click');
            // expect(this.page.url()).toBe('https://dashboard.100pay.co/payment-links/create')
        // }).toPass({intervals: [2_000, 2_000, 2_000, 2_000], timeout: 10_000});
        await this.PaymentLinkNameField.fill(linkName);
        await this.CurrencyDropdown.click();
        await this.page.getByText(currency).click();
        await this.AmountField.fill(amount.toString());
        await this.QRcodeField.fill(QRcode);
        await this.DescriptionField.fill(description);
        await this.ThankYouPageField.clear();
        await this.ThankYouPageField.fill(thankYouPage);
    };

    /**
     * @returns The number of Payment Links created by User
     */
    async NumOfPaymentLinks() {
        const numOfRows = await this.page.locator('div.w-full > div > div.flex > div > table.w-full > tbody > tr').count();
        return numOfRows;
    };

    async latestPaymentLink() {
        const content: { [key: string]: string } = {};
        const latestRecord = this.page.locator('div.w-full > div > div.flex > div > table.w-full > tbody > tr').first();
        const values = await latestRecord.locator('td').all();
        content['name'] = await values[0].innerText();
        content['amount'] = await values[1].innerText();
        content['date'] = await values[2].innerText();
        return content;
    }
};