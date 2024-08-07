import { Page, Locator, expect } from "playwright/test";

/*
 * Represents User signup page.
 * 
 * Onbards User and tailors UX based on user's profession.
 */
export class SignupPage {
    readonly page: Page;
    readonly firstNameField: Locator;
    readonly lastNameField: Locator;
    readonly emailField: Locator;
    readonly phoneField: Locator;
    readonly countryDropdown: Locator;
    readonly passwordField: Locator;
    readonly passwordVisibilitySwitch: Locator;
    readonly signupBtn: Locator;
    readonly googleSignupBtn: Locator;
    readonly loginLink: Locator;
    readonly popupWindow: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameField = page.locator('input[name="firstName"]');
        this.lastNameField = page.locator('input[name="lastName"]');
        this.emailField = page.getByPlaceholder('eg: emmanuel@email.com');
        this.phoneField = page.getByPlaceholder('000 000');
        this.countryDropdown = page.locator('div').filter({ hasText: /^Select Country$/ }).first();
        this.passwordField = page.getByPlaceholder('********');
        this.passwordVisibilitySwitch = page.locator('div').filter({ hasText: /^Password$/ }).getByRole('img');
        this.signupBtn = page.getByRole('button', { name: 'Sign Up', exact: true });
        this.googleSignupBtn = page.getByRole('button', { name: 'icon Sign Up with Google' });
        this.loginLink = page.getByRole('link', { name: 'Sign In?' });
        this.popupWindow = this.page.locator('div.absolute.w-screen.h-screen > div.relative.overflow-scroll');
    };

    /**
     * @returns The URL of the page the user is redirected to after clicking the signup link
     * @description This method navigates the user to the signup page
     */ 
    async gotoSignupPage() {
        await this.page.goto("https://dashboard.100pay.co/register");
    };

    /**
     * @param firstName - First name of the user
     * @param lastName - Last name of the user
     * @param email - Email address of the user
     * @param phone_no - Phone number of the user
     * @param country - Country in full, like `Nigeria`, `United States`, `Uganda`, `Bangladesh`, etc.
     * @param password - Alphanumeric password of the user
     */
    async createAccount(firstName:string, lastName:string, email:string, phone_no:string, country:string, password:string) {
        await this.gotoSignupPage();
        await this.firstNameField.fill(firstName);
        await this.lastNameField.fill(lastName);
        await this.emailField.fill(email);
        await this.countryDropdown.click();
        await this.page.getByText(country).click();
        await this.phoneField.fill(phone_no);
        await this.passwordField.fill(password);
        await this.signupBtn.click();
        expect(async() => { expect(this.page.url()).toContain('https://dashboard.100pay.co/') })
        .toPass({timeout: 10_000});
    };

    /**
     * @param firstName - First name of the user
     * @param lastName - Last name of the user
     * @param email - Email address of the user
     * @param phone_no - Phone number of the user
     * @param country - Country abbreviation, like `NG`, `US`, `UG`, `AE`
     * @param password - Alphanumeric password of the user
     * @returns `true` if the account was created successfully, `false` otherwise
     * @description This method creates an account for the user using Google
     */
    async createAccountWithGoogle(firstName:string, lastName:string, email:string, phone_no:string, country:string, password:string) {
        await this.gotoSignupPage();
        await this.firstNameField.fill(firstName);
        await this.lastNameField.fill(lastName);
        await this.emailField.fill(email);
        await this.countryDropdown.click();
        await this.page.getByText(country).click();
        await this.phoneField.fill(phone_no);
        await this.passwordField.fill(password);
        await this.googleSignupBtn.click();
    };

    /**
     * @param trxPIN - 6-digits Transaction PIN for the user
     * @returns `true` if the transaction PIN was set successfully, `false` otherwise
     * @description This method sets the transaction PIN for the user
     */
    async setTransactionPIN(trxPIN:string) {
        await expect(this.popupWindow).toBeVisible({timeout: 10_000});
        await this.page.getByRole('button', { name: 'Create Pin' }).click();
        await this.page.locator('div').filter({ hasText: /^Enter Transaction Pin Continue$/ }).getByRole('button').first().click();
        await this.page.getByRole('spinbutton').fill(trxPIN);
        await this.page.getByRole('button', { name: 'Continue' }).click();
        await this.page.locator('div').filter({ hasText: /^Re-enter Transaction Pin Done$/ }).getByRole('button').first().click();
        await this.page.getByRole('spinbutton').fill(trxPIN);
        await this.page.getByRole('button', { name: 'Done' }).click();
    };

    /**
     * @param option The user's profession or use case
     * @returns The URL of the page the user is redirected to after selecting an option
     * @description This method customizes the user experience based on the option selected
     */
    async customizeUX(option: 'Professional/freelancer'|'In my Wordpress site'|'As a Developer'|'For payments:') {
        if (await this.popupWindow.locator('div.w-full.p-4 > div > h1.font-bold').innerText() === 'How do you plan on using 100Pay?') {
            const options = await this.popupWindow.locator('div.w-full.p-4 > div.grid > div.bg-modernblack-01').all();
            for (const choice of options) {
                const target = choice.locator('div.flex > p.border-b');
                if (await target.innerText() === option) {
                    await target.click();
                    break;
                };
            };
            // await this.popupWindow.locator('div.relative > div.grid > button.bg-payred-06.text-white').waitFor({timeout:5000});
            await this.popupWindow.locator('div.relative > div.grid > button.bg-payred-06.text-white').click();
            await this.page.waitForLoadState('networkidle');
            if (await this.popupWindow.isHidden()) {
                return true;
            };
        };
        return false;
    };

    /**
     * @returns The URL of the page the user is redirected to after clicking the login link
     * @description This method navigates the user to the login page
     */
    async gotoLoginPage() {
        await this.gotoSignupPage();
        await this.page.getByRole('link', { name: 'Sign In?' }).click();
    }
};