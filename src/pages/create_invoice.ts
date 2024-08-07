import { Page, Locator, expect } from "playwright/test";
import { HomePage } from "./homepage-assets";

/**
 * This page lets User create an invoice for a client
 * 
 * It also stores the client's details for future use
 * @extends HomePage
 */
export class CreateInvoicePage extends HomePage {
    readonly alert: Locator;
    readonly selectClientDropdown: Locator;
    readonly customerNameField: Locator;
    readonly customerEmailField: Locator;
    readonly customerPhoneField: Locator;
    readonly customerIDField: Locator;
    readonly SaveAndContinueBtn: Locator;
    readonly amountField: Locator;
    readonly countryDropdown: Locator;
    readonly currencyDropdown: Locator;
    readonly VATfield: Locator;
    readonly descriptionField: Locator;
    readonly thankYouPageField: Locator;
    readonly SendInvoiceBtn: Locator;
    readonly copyInvoiceLinkBtn: Locator;


    constructor(page: Page) {   // when an instance of this class is created, the constructor is invoked
        super(page);    // invokes the constructor of the parent class
        this.alert = page.locator('section > ol > li > div:nth-child(2) > div')
        this.selectClientDropdown = page.getByRole('button', { name: 'icon Select Customer' });
        this.customerNameField = page.getByPlaceholder('Jane Doe');
        this.customerIDField = page.getByPlaceholder('123456');
        this.customerPhoneField = page.getByPlaceholder('000 0000');
        this.customerEmailField = page.getByPlaceholder('eg: someone@gmail.com');
        this.SaveAndContinueBtn = page.getByRole('button', { name: 'Save and continue', exact: true });
        this.amountField = page.getByPlaceholder('2000');
        this.countryDropdown = page.locator('div').filter({ hasText: /^Select Country$/ }).first();
        this.currencyDropdown = page.locator('div:nth-child(3) > .relative > div').first();
        this.VATfield = page.getByPlaceholder('%');
        this.descriptionField = page.locator('textarea[name="paymentDesc"]');
        this.thankYouPageField = page.getByPlaceholder('https://pay.100pay.co');
        this.SendInvoiceBtn = page.getByRole('button', { name: 'Send invoice', exact: true });
        this.copyInvoiceLinkBtn = page.getByRole('button', { name: 'icon Copy Link' });
    };

    /**
     * Save the client's details for future use
     * @param clientName - The name of the client
     * @param clientEmail - The email of the client
     * @param clientPhone - The phone number of the client
     * @param clientID - Generated payment ID
    */
    async fillInClientDetails(clientName:string, clientEmail:string, clientPhone:string, clientID:string) {
        await this.customerNameField.fill(clientName);
        await this.customerEmailField.fill(clientEmail);
        await this.customerPhoneField.fill(clientPhone);
        await this.customerIDField.fill(clientID);
    }

    /**
     * Verify that the client's details are visible on the invoice
     * @param clientName - The name of the client
     * @param clientEmail - The email of the client
     * @param clientPhone - The phone number of the client
     * @param clientID - The ID of the client
     * @returns True if the details are visible, False otherwise
     */
    async verifyInvoiceDetailsVisibility(clientName:string, clientID:string, clientEmail:string, clientPhone:string) {
        const invoiceKeys:Array<string> = [], invoiceValues:Array<string> = [];
        const invoiceDetailKeys = await this.page.locator('div.border > div.grid > div.bg-white > div.mt-5 > ul > li > span').all();
        const invoiceDetailValues = await this.page.locator('div.border > div.grid > div.bg-white > div.mt-5 > ul > li > p').all();
        const invoiceDetails: { [key: string]: string } = {};

        for (const detail of invoiceDetailKeys) {
            invoiceKeys.push(await detail.innerText());
        };
        for (const detail of invoiceDetailValues) {
            invoiceValues.push(await detail.innerText());
        };
        for (const key of invoiceKeys) {
            invoiceDetails[key] = invoiceValues[invoiceKeys.indexOf(key)];
        }
        return new Boolean(invoiceDetails['Name:'] === clientName && invoiceDetails['Customer ID:'] === clientID && invoiceDetails['Email:'] === clientEmail && invoiceDetails['Phone Number:'] === clientPhone);
    }

    /**
     * Fills in Invoice data such as Amount & currency to be paid in as well as VAT and description
     * @param amount - The amount to be paid
     * @param country - The country of the client, such as `Nigeria`, `United States`, `Uganda`
     * @param currencyAbbr - An abbreviation of the payment currency
     * @param vat - The VAT percentage
     * @param description - A brief description of the payment
     * @param thankYouPageURL - The URL of the thank you page
     */
    async fillInInvoiceData(amount:number, country:string, currencyAbbr:'USD'|'NGN'|'UGX'|'EUR'|string, vat:number, description:string, thankYouPageURL:'https://pay.100pay.co'|string) {
        await this.amountField.fill(amount.toString());
        await this.countryDropdown.click();
        await this.page.getByText(country).click();
        await this.currencyDropdown.click();
        await this.page.getByText(currencyAbbr).click();
        await this.VATfield.fill(vat.toString());
        await this.descriptionField.fill(description);
        await this.thankYouPageField.fill(thankYouPageURL);
        // await this.SendInvoiceBtn.click();
    };

    /**
     * View saved invoices
     * @returns An array of client names
     */
    async grabSavedInvoices() {
        const clientNames: Array<string> = [];
        await this.selectClientDropdown.click();
        const clientInvoices = this.page.locator('div.w-full > div > div.flex > div.relative > div.bg-white > p.py-2').all();
        for (const invoice of await clientInvoices) {
            clientNames.push(await invoice.innerText());
        };
        return clientNames;
    };

    /**
     * Check if the invoice is visible
     * @param clientName - The name of the client
     * @returns True if the client's invoice is found, False otherwise
     */
    async isClientNameFound(clientName:string) {
        const clientNames = await this.grabSavedInvoices();
        return clientNames.includes(clientName);
    }

    /**
     * Switch between pre-saved Client Invoices
     * @param clientName - The name of the client
     * @returns True if the client's invoice is found, False otherwise
     */
    async switchBtwClients(clientName:string) {
        if (await this.isClientNameFound(clientName)) {
            await this.page.getByText(clientName).click();
            return true;
        } else {
            return false;
        };
    }
};