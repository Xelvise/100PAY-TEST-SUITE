import { Page, Locator } from "playwright/test";
import { LoginPage } from "./login";

export class ForgotPasswordPage extends LoginPage {
    readonly emailField: Locator;
    readonly continueBtn: Locator;
    readonly backBtn: Locator;

    constructor(page: Page) {
        super(page);    // invokes the constructor of the parent class
        this.emailField = page.getByPlaceholder('eg: emmanuel@email.com');
        this.continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
        this.backBtn = page.getByRole('link', { name: 'Back' });
    }

    async resetPassword(email:string) {
        await super.gotoPasswordResetPage();
        await this.emailField.fill(email);
        await this.continueBtn.click();
    }
}