# Hollis & Avery Law: homepage design preview

Design preview prepared by Premier Code Inc.

Preview: https://attorney.premiercodeinc.com/

Hollis & Avery Law, PLLC is a **fictional firm**. Its attorneys, phone, email, address, hours, fee and articles are samples, and every page says so. The photos are royalty-free stock (Wikimedia Commons and Pexels) and do not show the firm, its people, its office or its clients.

## The three options

Use the switcher at the bottom left of each page to move between them.

| Option | Concept | Link |
|---|---|---|
| Option A | **Quiet authority.** Deep navy and ivory, Libre Caslon Text headings with Source Sans 3, thin gold rules and a dusk hero. | https://attorney.premiercodeinc.com/option-a/ |
| Option B | **Main Street firm.** Bright white and limestone with oxblood and brass, Source Serif 4 and Source Sans 3, a three-tier header and practice-area cards. | https://attorney.premiercodeinc.com/option-b/ |
| Option C | **Warm counsel.** Deep teal, cream and brass, Libre Baskerville with Figtree, a split hero with the sample consultation card. | https://attorney.premiercodeinc.com/option-c/ |

Photo credits: https://attorney.premiercodeinc.com/credits.html

## Placeholders to confirm with the client

Each option has these `<!-- PLACEHOLDER -->` comments:

| Placeholder | What the client decides |
|---|---|
| Quick-exit link ("Leave this site quickly") | Whether to keep it, and where it goes. It currently opens `https://weather.com/` and replaces the history entry. |
| Consultation fee and format | The real length, fee and format. An advertised fee must be honored for up to a year (Texas Rule 7.02(d)). |
| Attorney review of FAQ | Which attorney reviews the FAQ and Insights for accuracy, and their name in the "Reviewed by" line. |
| reCAPTCHA v3 | The site key, the script and the token check. The honeypot field (`company_website`) is already in place, and the server must discard submissions that fill it. |

## What a real firm must replace

Everything below is sample content:

- The firm name and legal entity, exactly as registered.
- The attorney names, roles, bar admission years and the attorney responsible for the site's content (Rule 7.02(a)).
- The office street address (the primary practice location, Rule 7.02(a)). The demo uses "1234 Main Street, Anytown, TX".
- The phone number (the demo uses the reserved `(817) 555-0198`), the email (`hello@example.com`) and the office hours.
- The consultation steps, fee and format.
- The service-area cities, if they differ.
- The practice areas the firm actually takes.
- The Insights articles. These are teasers only; the articles themselves need writing.
- The stock photos, if the firm wants its own. If any stock photos stay, keep `credits.html`.
- The form: it is a preview that sends nothing. It needs a real handler with reCAPTCHA v3, the honeypot check, rate limiting and a transactional email sender.

## Remove at launch

- The option switcher: the block between the `REMOVE AT LAUNCH` comments in each option, plus each option's switcher override rules in `styles.css`.
- The two options the client doesn't choose, and the root redirect in `index.html`.
- The design preview bar at the top of each page, and the "Sample", "Fictional" and "Design preview" labels once the content is real.
- `<meta name="robots" content="noindex, nofollow">` on every page.
- The `Disallow: /` block in `robots.txt`.

Remove noindex only after the homepage is filed with the State Bar of Texas Advertising Review Committee (within 10 days of launch, Rules 7.04 and 7.05).
