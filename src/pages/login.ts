import { Page, Locator } from "playwright/test";

/*
* Represents a login page
*/
export class LoginPage {
    readonly page: Page;
    readonly emailField: Locator;
    readonly passwordField: Locator;
    readonly passwordVisibilitySwitch: Locator;
    readonly forgotPasswordLink: Locator;
    readonly loginBtn: Locator;
    readonly googleLoginBtn: Locator;
    readonly signupLink: Locator;
    readonly rememberMeCheckbox: Locator;

    constructor(page: Page) {   // when an instance of this class is created, the constructor is invoked
        this.page = page;
        this.emailField = page.getByPlaceholder('eg: emmanuel@email.com');
        this.passwordField = page.getByPlaceholder('********');
        this.passwordVisibilitySwitch = page.locator('form svg');
        this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password' });
        this.loginBtn = page.getByRole('button', { name: 'Sign In', exact: true });
        this.googleLoginBtn = page.getByRole('button', { name: 'icon Sign In with Google' });
        this.signupLink = page.getByRole('link', { name: 'Sign Up?' });
        this.rememberMeCheckbox = page.getByLabel('Remember me for 30 days');
    };

    async gotoLoginPage() {
        await this.page.goto("https://dashboard.100pay.co/login");
    };

    /**
     * **This method signs in the user**
     * @param email - Email address of the user
     * @param password - Alphanumeric password of the user
     * @returns A boolean indicating if the user is successfully signed in
    */
    async signinToAccount(email:string, password:string) {
        await this.gotoLoginPage()
        await this.emailField.fill(email);
        await this.passwordField.fill(password);
        await this.loginBtn.click();
        await this.page.waitForURL(/https:\/\/dashboard.100pay.co\/?/, {timeout: 5000});
        if (this.page.url().match(/https:\/\/dashboard.100pay.co\/?/)) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * **This method signs in the user using Google**
     * @param email - Email address of the user
     * @param password - Alphanumeric password of the user
     */
    async signinWithGoogle(email:string, password:string) {
        await this.gotoLoginPage()
        await this.emailField.fill(email);
        await this.passwordField.fill(password);
        await this.googleLoginBtn.click();
    };

    /**
     * This method redirects User to `Password Reset` page
     * @param email - Email address of the user
     */
    async gotoPasswordResetPage() {
        await this.gotoLoginPage();
        await this.page.getByRole('link', { name: 'Forgot Password' }).click();
    }
}