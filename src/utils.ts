import  {MailSlurp, InboxDto}  from 'mailslurp-client';
import { MatchOptionFieldEnum, MatchOptionShouldEnum } from 'mailslurp-client';
import { config } from "dotenv";
config({path: './.env'});   // load environment variables from .env file

const apiKey = process.env.MAILSLURP_API_KEY;
if (!apiKey) {throw new Error("MAILSLURP_API_KEY is not defined")}
// create a new instance of MailSlurp
export const mailslurp = new MailSlurp({apiKey});

// function to retrieve payment invoice URL from Client's email, if sent
export async function retrieveInvoiceURL(inbox_id: string) {
    const invoice_mail = await mailslurp.waitController.waitForMatchingFirstEmail({
        inboxId: inbox_id,
        unreadOnly: true,
        timeout: 2*60*1000,    // 2 minutes
        matchOptions: {
            matches: [{value: "You have a due Invoice", field: MatchOptionFieldEnum.SUBJECT, should: MatchOptionShouldEnum.CONTAIN}]
        }
    })
    const content = await mailslurp.emailController.getEmailLinks({emailId: invoice_mail.id});
    console.log(`Extracted URL - ${content.links[0]}`);
    return content.links[0];    // return the URL to complete account setup
};

export function CurrentDate(): string {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2,'0');
    const day = date.getDate().toString().padStart(2,'0');
    const year = date.getFullYear().toString();
    return `${month}/${day}/${year}`;
}



