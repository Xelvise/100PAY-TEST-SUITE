import {Page, Locator, expect} from "playwright/test";
import {HomePage} from "./homepage-assets";

/**
 * This page reveals overall initiated transactions, be it paid or unpaid
 * @extends HomePage
 */
export class TransactionsPage extends HomePage {
    readonly TrxRows: Locator;
    readonly TrxFilterBtn: Locator;
    readonly exportTrxBtn: Locator;
    readonly OpenTrxBtn: Locator;
    readonly DownloadReceiptBtn: Locator;
    readonly CloseWindowBtn: Locator;

    constructor(page: Page) {   // when an instance of this class is created, the constructor is invoked
        super(page);    // invokes the constructor of the parent class
        this.TrxRows = page.locator('div.w-full > div.flex > div > table.w-full > tbody > tr');
        this.TrxFilterBtn = page.getByRole('button', { name: 'All Transactions' });
        this.exportTrxBtn = page.getByRole('button', { name: 'Export' });
        this.OpenTrxBtn = page.getByRole('button', {name: 'Open Transaction'});
        this.DownloadReceiptBtn = page.getByRole('button', {name: 'Download Receipt'});
        this.CloseWindowBtn = page.getByRole('button', {name: 'Cancel'});
    };

    /**
     * Filters transactions by status
     * @param filter - The status to filter by (unpaid, paid, etc)
    */
    async filterTrxBy(filter: 'unpaid'|'paid'|string) {
        await this.TrxFilterBtn.click();
        await this.page.getByRole('button', {name: filter}).click();
    };

    /**
     * Counts all Transactions found
     * @returns The number of transactions found
    */
    async totalTrxCount() {
        const trxCount = await this.TrxRows.count();
        return trxCount;
    };

    /**
     * Checks if a transaction exists
     * @param clientName - The name of the client
     * @param amount - The amount of the transaction
     * @returns Locator object of the matching transaction, False otherwise
    */
    async ViewTrxReceipt(clientName:string, amount:number) {
        const receiptDetails: { [key: string]: string } = {};
        const Trxs = await this.TrxRows.all();
        for (const row of Trxs) {
            const TrxCells = await row.locator('td').all();
            const name = await TrxCells[0].innerText(), amt = await TrxCells[1].innerText(), date = await TrxCells[4].innerText(), status = await TrxCells[5].innerText();
            if (name===clientName && amt===this.formatAmt(amount)) {
                receiptDetails['name'] = name;
                receiptDetails['amount'] = amt;
                receiptDetails['date'] = date;
                receiptDetails['status'] = status;
                break;
            };
        };
        return receiptDetails;
    };

    /**
     * Clicks on the Download Receipt button of a transaction
     * @param clientName - The name of the client
     * @param amount - The amount of the transaction
    */
    async downloadReceipt(clientName:string, amount:number) {
        const Trxs = await this.TrxRows.all();
        for (const row of Trxs) {
            const TrxCells = await row.locator('td').all();
            const name = await TrxCells[0].innerText(), amt = (await TrxCells[1].allInnerTexts())[1];
            if (name===clientName && amt===this.formatAmt(amount)) {
                await row.click();
                break;
            } else {
                return 'No matching transaction found';
            };
        };
        await this.DownloadReceiptBtn.click();
        await this.CloseWindowBtn.click();
    };

    async ExportTrxs() {
        await this.exportTrxBtn.click();
    };
};