import {Page, Locator} from "playwright/test";
import {HomePage} from "./homepage-assets";

/**
 * This page reveals only successful payments (i.e. paid transactions)
 * @extends HomePage
 */
export class PaymentsPage extends HomePage {};