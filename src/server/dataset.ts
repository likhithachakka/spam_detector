import { SampleEmail } from './types.ts';

export interface DatasetItem {
  text: string;
  label: 'spam' | 'ham';
}

export const INITIAL_TRAINING_DATA: DatasetItem[] = [
  // --- SPAM SAMPLES ---
  {
    text: "URGENT: Your PayPal account has been temporarily restricted due to unauthorized login attempts. Click here immediately to verify your identity and restore access within 24 hours or your funds will be permanently locked: http://secure-paypal-login-verify.xyz/update",
    label: "spam",
  },
  {
    text: "CONGRATULATIONS! You have been selected as the grand winner of the 2026 International Lottery. You have won $4,500,000 USD. To claim your cash prize, reply immediately with your full name, banking details, and passport copy.",
    label: "spam",
  },
  {
    text: "Dear Beloved Friend, I am Barrister Williams Donald, legal counsel to a deceased foreign client who left an unclaimed estate worth $18.5 Million. I seek your consent to present you as the next of kin to claim these funds. 40% will be your share.",
    label: "spam",
  },
  {
    text: "Your Amazon package could not be delivered due to an incorrect shipping address and unpaid customs fees of $2.95. Update your delivery details immediately at http://amzn-delivery-tracking-update.top to prevent package return.",
    label: "spam",
  },
  {
    text: "FINAL NOTICE: Your Netflix subscription payment failed. Your membership is suspended. Update your credit card information within 12 hours to avoid cancellation: http://netflix-billing-reactivate.xyz/login",
    label: "spam",
  },
  {
    text: "URGENT SECURITY ALERT: Unauthorized transfer of $4,980.00 to Coinbase initiated from your Chase Bank account. If you did NOT authorize this transaction, call our fraud desk immediately at +1-800-555-0199 or click http://chase-security-verify.net",
    label: "spam",
  },
  {
    text: "Elon Musk Binance Bitcoin & Ethereum Giveaway! Send 0.1 BTC to receive 0.5 BTC back immediately! Limited to the next 50 participants only. Connect your Metamask wallet now at http://elon-giveaway-airdrop.live",
    label: "spam",
  },
  {
    text: "Hey, are you in the office right now? I need you to purchase 5 Apple gift cards of $100 each for an urgent client presentation right now. Scratch the back and email me the PIN codes. I am in a meeting so do not call. - Sent from my iPhone",
    label: "spam",
  },
  {
    text: "LOSE 30 LBS IN 2 WEEKS! Miracle keto dietary supplement approved by top doctors. 100% natural, no exercise needed. 80% discount today only! Buy now and claim your free trial bottle while stock lasts!",
    label: "spam",
  },
  {
    text: "Your computer has been infected with Trojan.Spyware.VBS. Windows Defender was locked. Call Microsoft Certified Technicians immediately at 1-888-234-9871. Do not shut down your computer or your hard drive will be wiped.",
    label: "spam",
  },
  {
    text: "We noticed suspicious sign-in activity on your Google Account from Moscow, Russia. If this was not you, change your password now at http://account-security-google-verify.biz/recovery",
    label: "spam",
  },
  {
    text: "Pre-approved loan up to $50,000 with NO credit check! Low 1.5% interest rate. Instant approval within 10 minutes. Click here to deposit funds into your checking account today.",
    label: "spam",
  },
  {
    text: "Work from home and earn $500 to $1,500 daily! No experience required. Simple data entry tasks. Contact Mary via WhatsApp at +234-80-1234-5678 to start earning instantly.",
    label: "spam",
  },
  {
    text: "ATTENTION IRS TAXPAYER: You have an outstanding tax refund of $1,842.50 pending. To process your direct deposit, submit your Social Security Number and banking credentials at http://irs-tax-refund-portal.info",
    label: "spam",
  },
  {
    text: "Exclusive VIP Casino Bonus: 500 Free Spins + 400% Deposit Match! Win real cash jackpots today. Claim your secret promo code before midnight: http://spin-win-jackpot777.fun",
    label: "spam",
  },
  {
    text: "DocuSign: Document requires your urgent electronic signature: 'Q3 Severance & Wire Agreement.pdf'. Review and sign within 6 hours: http://docusign-signature-portal.top/auth",
    label: "spam",
  },
  {
    text: "Hot singles in your local neighborhood want to chat with you right now! Click here to view private photos and messages without registration.",
    label: "spam",
  },
  {
    text: "Meta Business Support: Your Facebook page violates copyright terms and will be unpublished within 24 hours. Submit an appeal to prevent permanent deletion: http://meta-appeal-case9482.cc",
    label: "spam",
  },
  {
    text: "SMS ALERT: Your bank debit card ending in 4102 has been locked due to suspicious activity. Verify credentials at http://bit.ly/bank-unlock-pin to reactivate your card.",
    label: "spam",
  },
  {
    text: "Refinance your mortgage at historic low rates! Zero closing costs, bad credit accepted. Fast quote in 60 seconds with no obligation. Lower your monthly payment now.",
    label: "spam",
  },
  {
    text: "INVOICE #94821 ATTACHMENT: Thank you for your Geek Squad annual subscription renewal of $399.00. This amount was debited from your card. Call cancellation helpline: +1-855-401-2299.",
    label: "spam",
  },
  {
    text: "Crypto Bull Run Alert: Buy this 1000x altcoin before Binance listing tomorrow! Guaranteed returns. Join VIP Telegram signal channel now.",
    label: "spam",
  },

  // --- HAM (LEGITIMATE) SAMPLES ---
  {
    text: "Hi Alex, hope you are having a productive week. Attached are the updated slides for tomorrow's quarterly product review. Let me know if you would like me to modify any metrics before the meeting with Sarah.",
    label: "ham",
  },
  {
    text: "Your GitHub pull request #142 'Refactor authentication middleware' has been approved by reviewer David. All CI test suites passed successfully. Merging into main branch.",
    label: "ham",
  },
  {
    text: "Your order #49281 from Target has shipped! Track your package via UPS with tracking number 1Z9999999999999999. Estimated delivery is Friday, October 3rd.",
    label: "ham",
  },
  {
    text: "Hi team, quick reminder that our sprint retrospective is scheduled for today at 3:00 PM in Conference Room B. Please add your discussion points to the shared Notion document prior to the call.",
    label: "ham",
  },
  {
    text: "Here is your electronic receipt for your recent ride with Uber on September 28. Total: $24.50 charged to Visa ending in 8192. Thank you for riding with us.",
    label: "ham",
  },
  {
    text: "Hey Dad, just wanted to check in and see how Mom's surgery went today. Give me a call whenever you have a free moment this evening. Sending love from both of us.",
    label: "ham",
  },
  {
    text: "Your monthly electricity statement from Pacific Gas & Electric is now ready for view. Amount due: $84.20 on October 18, 2026. Log in to your portal at pge.com to review your usage breakdown.",
    label: "ham",
  },
  {
    text: "Hi everyone, the engineering sync has been rescheduled to Thursday at 10:30 AM EST to accommodate the European timezone team. The Google Meet link remains unchanged.",
    label: "ham",
  },
  {
    text: "Google Calendar reminder: Dentist appointment with Dr. Lee tomorrow at 9:00 AM. Please arrive 10 minutes early to fill out any insurance updates.",
    label: "ham",
  },
  {
    text: "Thank you for attending the Web Security & Cloud Architecture webinar. Here is the link to the video recording and PDF deck we referenced during Q&A.",
    label: "ham",
  },
  {
    text: "Your flight confirmation code is K92JFW for United Airlines Flight 428 from SFO to JFK on October 12, 2026. Terminal 3, Seat 14B. Check in begins 24 hours prior to departure.",
    label: "ham",
  },
  {
    text: "Hi Karen, I reviewed your pull request comments and pushed a fix for the edge case where the user profile image is undefined. Could you please take another look when you have a moment?",
    label: "ham",
  },
  {
    text: "Spotify Subscription Receipt: Your Spotify Premium Family plan has renewed for $16.99. Payment method: Mastercard ending in 3310. Enjoy unlimited music streaming.",
    label: "ham",
  },
  {
    text: "Hey Chris, do you want to grab lunch near the office cafeteria around 12:30? We could try that new Mexican burrito spot on 4th street.",
    label: "ham",
  },
  {
    text: "Slack notification: Marcus mentioned you in #core-infrastructure: 'Can you verify if the Redis cache cluster latency has recovered after the memory limit increase?'",
    label: "ham",
  },
  {
    text: "Hi team, please remember to submit your end-of-month expense reports through Concur by 5:00 PM this Friday so our accounting department can process reimbursements on time.",
    label: "ham",
  },
  {
    text: "Your public library books 'Design Patterns' and 'Designing Data-Intensive Applications' are due in 3 days. Renew them online via your library account or return them to any branch.",
    label: "ham",
  },
  {
    text: "Weekly newsletter from Python Weekly: Issue 642 - FastAPI 0.115 released, async best practices, and new static analysis tools for modern Python codebases.",
    label: "ham",
  },
  {
    text: "Hi Michael, thank you for contacting Customer Support. We have processed your refund of $34.00 for order #88124. Please allow 3-5 business days for the credit to appear on your bank statement.",
    label: "ham",
  },
  {
    text: "Meeting notes: We decided to proceed with TypeScript 5.8 migration next sprint. Action items assigned to Sarah (build pipeline) and John (lint rules). Next sync on Monday.",
    label: "ham",
  },
  {
    text: "Your Apple ID was used to sign in to iCloud via a web browser on macOS. If you signed in recently, you can disregard this message. If not, manage your Apple account at appleid.apple.com.",
    label: "ham",
  },
  {
    text: "Hi David, I have uploaded the updated Figma prototypes for the mobile checkout flow. Please review the payment review step when you have time and leave any feedback in the file.",
    label: "ham",
  }
];

export const TEST_BENCHMARK_DATA: DatasetItem[] = [
  // Validation / Test split
  {
    text: "SECURITY ALERT: We detected unauthorized sign-in attempts on your Wells Fargo online account. Access has been temporarily restricted. Verify your credentials immediately: http://wellsfargo-secure-login-restore.info",
    label: "spam",
  },
  {
    text: "Hi Team, the project deployment is scheduled for 8:00 PM tonight. Please make sure all feature branches are merged and passing automated tests by 5:00 PM.",
    label: "ham",
  },
  {
    text: "Dear Winner, your email has won $1,000,000 in the Google Global Sweepstakes. Send your phone number and bank account to claim your reward immediately.",
    label: "spam",
  },
  {
    text: "Here is your weekly summary of GitHub activity. You opened 4 pull requests and closed 6 issues across the repository.",
    label: "ham",
  },
  {
    text: "URGENT IRS Notice: A tax audit warrant has been issued in your name. Pay $1,200 in overdue taxes via Target gift cards to avoid immediate arrest by local federal marshals.",
    label: "spam",
  },
  {
    text: "Hey, can you review the draft proposal for the new marketing campaign before our meeting at 2 PM tomorrow? Thanks!",
    label: "ham",
  },
  {
    text: "Crypto airdrop claim: 2,500 SOL tokens allocated to your active wallet address. Claim before the deadline: http://solana-airdrop-rewards.fun/claim",
    label: "spam",
  },
  {
    text: "Your reservation at The Italian Kitchen is confirmed for 4 guests on Saturday, October 4 at 7:30 PM. Call us if you need to modify your reservation.",
    label: "ham",
  }
];

export const SAMPLE_PRESETS: SampleEmail[] = [
  {
    id: "sample-paypal-phish",
    title: "PayPal Urgent Restriction Phishing",
    type: "spam",
    category: "phishing",
    sender: "service-security@paypa1-update-center.xyz",
    subject: "URGENT: Your PayPal account has been limited (Action Required)",
    content: `Dear Customer,

We have detected suspicious login activities on your PayPal account from an unrecognized IP address in Bucharest, Romania.

For your protection, we have temporarily restricted access to your account and withheld pending transactions.

To restore full account functionality, you must verify your identity and confirm your billing information within 24 hours:

https://secure-login-verify.paypal-support-desk.xyz/identity/confirm

Failure to complete verification within 24 hours will result in permanent account suspension and forfeiture of current balance according to Section 10.2 of the User Agreement.

Thank you,
PayPal Customer Security Center`,
    description: "Classic credential phishing email spoofing PayPal with extreme urgency, fake geographic threat, and malicious lookalike domain."
  },
  {
    id: "sample-nigerian-prince",
    title: "Unclaimed $18.5M Inheritance Scam",
    type: "spam",
    category: "financial-scam",
    sender: "barrister.richardson982@yahoo.com",
    subject: "STRICTLY CONFIDENTIAL: Partnership Proposal / Unclaimed Inheritance",
    content: `Dear Respected Friend,

I am Barrister David Richardson, senior legal attorney based in London, UK. I am contacting you regarding a deceased client of mine, Mr. George Harrison, an international gold merchant who died intestate in a tragic accident leaving an unclaimed balance of $18,500,000 USD in a private European bank.

Since he died without a designated next-of-kin, the bank management has issued a mandate to confiscate these funds unless a legitimate relative steps forward. Because you share a similar surname, I am proposing to present you as his legal beneficiary.

Upon successful transfer of the funds into your foreign bank account, we shall divide the proceeds:
- 45% for your cooperation
- 50% for myself
- 5% for miscellaneous expenses

Kindly reply with your full legal name, private mobile number, and banking details to proceed immediately.

Yours Faithfully,
Barrister David Richardson`,
    description: "Classic 419 Advance-Fee scam exploiting greed, authority impersonation, and large fictional sums."
  },
  {
    id: "sample-crypto-airdrop",
    title: "Elon Musk BTC / ETH Giveaway",
    type: "spam",
    category: "crypto",
    sender: "no-reply@tesla-crypto-foundation.biz",
    subject: "LIVE: 5,000 BTC & 50,000 ETH Official Community Giveaway",
    content: `Special Announcement from Elon Musk & The Binance Foundation:

To celebrate the next bull run and promote crypto adoption worldwide, we are hosting the largest cryptocurrency giveaway in history!

Rules are simple:
1. Send between 0.1 BTC to 5 BTC to our designated giveaway smart contract address below.
2. You will instantly receive 3X the amount back (0.3 BTC to 15 BTC) deposited directly to your originating wallet.

Smart Contract Address: 1MuskGiveawayOfficialBTCAddress949219
Or claim via Web3 Wallet: http://elon-airdrop-claim.live/connect

Hurry! Over 82% of the giveaway pool has already been claimed! Limited to the first 500 transactions.`,
    description: "High-yield cryptocurrency doubling scam with artificial scarcity and fake celebrity endorsement."
  },
  {
    id: "sample-ceo-giftcard",
    title: "CEO Urgent Gift Card Smishing / Spear Phishing",
    type: "spam",
    category: "urgent-spoof",
    sender: "ceo.mark.zuckerberg.office@gmail.com",
    subject: "Urgent request - Are you at your desk?",
    content: `Hi,

Are you available right now? I am stuck in an all-day executive board meeting and cannot take phone calls.

I need a quick favor for an urgent client surprise gift: Could you run to the nearest Target or Apple Store and purchase 6 Apple Gift Cards of $200 each?

Once purchased, scratch the silver protection tape off the back and email me clear photos of the 16-digit redemption codes right away.

I will have accounting reimburse you via wire transfer before the end of the day. Treat this with top confidentiality.

Best regards,
Mark
Chief Executive Officer`,
    description: "Spear-phishing / Business Email Compromise (BEC) masquerading as the CEO requesting un-traceable gift cards."
  },
  {
    id: "sample-sms-usps",
    title: "USPS / FedEx Tracking Package Smishing",
    type: "spam",
    category: "phishing",
    sender: "+1 (832) 991-0492",
    subject: "SMS Delivery Notification",
    content: `[USPS Alert]: Your package #US94821034 cannot be delivered due to missing house number and an unpaid customs handling fee of $1.99.

Update your delivery address and settle fee immediately to prevent parcel return:
http://bit.ly/usps-redelivery-update-9912

Carrier will hold item for 24 hours only.`,
    description: "Typical package delivery SMS phishing (Smishing) targeting unsuspecting online shoppers with link shortener."
  },
  {
    id: "sample-legit-github",
    title: "GitHub Pull Request Notification (Legitimate)",
    type: "ham",
    category: "work-email",
    sender: "notifications@github.com",
    subject: "[frontend-repo] Pull Request #84: Add dark mode toggle and improve accessibility",
    content: `Hi @developer,

Sarah Jenkins (sarah-j) has requested your review on Pull Request #84 in repository company/frontend-app.

Title: Add dark mode toggle and improve accessibility
Branch: feature/dark-mode -> main

Changes:
+ 142 additions
- 18 deletions
Files changed: 6

Sarah commented:
"Refactored the theme provider hook and verified high-contrast WCAG 2.1 AA compliance. Please test the keyboard navigation on the settings page."

You can view the full diff and approve the pull request directly on GitHub:
https://github.com/company/frontend-app/pull/84`,
    description: "Standard legitimate developer notification from an authenticated domain with no deceptive signals."
  },
  {
    id: "sample-legit-flight",
    title: "Delta Air Lines Flight Booking Confirmation",
    type: "ham",
    category: "account-receipt",
    sender: "ticketreceipt@delta.com",
    subject: "Your Flight Receipt - Confirmation Code #H7Y4KL",
    content: `Dear James Wilson,

Thank you for choosing Delta. Here is your flight confirmation and electronic ticket receipt.

Confirmation Code: H7Y4KL
Ticket Number: 0062391048210

Flight Details:
- Flight: DL 1492
- Departure: San Francisco (SFO) - Friday, Oct 16, 2026 at 08:15 AM
- Arrival: New York (JFK) - Friday, Oct 16, 2026 at 04:45 PM
- Seat: 12A (Main Cabin)
- Baggage: 1 Carry-on included, 1 Checked bag ($35 paid)

Payment Summary:
- Airfare: $382.40
- Taxes & Airport Fees: $41.80
- Total Paid: $424.20 via Visa ending in 9104

You can manage your trip, select meals, or check in 24 hours prior to departure at https://www.delta.com/mytrips.

Safe travels!
Delta Air Lines Customer Support`,
    description: "Authentic airline itinerary with verifiable flight details and standard payment breakdown."
  },
  {
    id: "sample-legit-meeting",
    title: "Team Sync & Sprint Planning (Legitimate)",
    type: "ham",
    category: "work-email",
    sender: "emily.chen@acme-corp.internal",
    subject: "Sprint 42 Planning & Roadmap Review Agenda",
    content: `Hi team,

Here is our agenda for tomorrow's Sprint 42 planning session at 10:00 AM PST.

Agenda:
1. Review Sprint 41 velocity and burndown metrics (15 min)
2. Prioritize Q4 customer feature requests: In-app reporting and Webhooks v2 (25 min)
3. Technical debt backlog: Upgrade database drivers and optimize search queries (15 min)
4. Capacity planning & holiday schedule check (5 min)

Please review the Jira backlog board prior to our session and add story point estimates if you have already reviewed the acceptance criteria.

Google Meet: meet.google.com/abc-wxyz-qrs

Best,
Emily Chen
Lead Product Manager`,
    description: "Genuine internal collaboration email with realistic workplace terminology and structure."
  }
];
