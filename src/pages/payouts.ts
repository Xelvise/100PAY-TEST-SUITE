import {Page, Locator} from "playwright/test";
import {HomePage} from "./homepage-assets";

/**
 * This page reveals all withdrawal requests, be it pending or completed
 * @extends HomePage
 */
export class PayoutsPage extends HomePage {
    readonly PayoutRows: Locator;
    readonly InstantPayoutToggle: Locator;
    readonly ExportPayoutsBtn: Locator;
    readonly PayoutsFilterBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.PayoutRows = page.locator('div.w-full > div.flex > div > table.w-full > tbody > tr');
        this.InstantPayoutToggle = page.locator('#payout');
        this.ExportPayoutsBtn = page.getByRole('button', { name: 'Export' });
        this.PayoutsFilterBtn = page.getByRole('button', { name: 'All Payouts' });
    };
};