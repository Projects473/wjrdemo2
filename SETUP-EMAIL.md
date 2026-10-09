# Booking confirmation emails: setup guide

When Wayne saves a booking on `admin.html`, the customer gets a confirmation email with:

- the car and the pick-up and return dates
- the number of days, the rate and the estimated total
- what to bring and the rental terms
- a link to the rental agreement
- Wayne's WhatsApp number

The customer's email address is required on the bookings page.

The website has no server of its own, so the email is sent through **EmailJS**, a free service built for this. Until EmailJS is set up, the bookings page still works: after saving, Wayne gets a button that opens the same email, already written, in his phone's email app, and he taps Send.

Setup takes about 10 minutes, once.

## 1. Create the EmailJS account

1. Go to https://www.emailjs.com and sign up for the free plan. Using `wjrtt@outlook.com` is best, so the account belongs to WJR.
2. The free plan allows a limited number of emails per month, about 200 when this was written. Check the current limit on their pricing page. That is plenty for rental confirmations.

## 2. Connect the email address that sends the confirmations

1. In EmailJS, open **Email Services > Add New Service**.
2. Choose **Outlook** and sign in with `wjrtt@outlook.com`, so emails come from WJR's own address and replies go to Wayne. If Outlook won't connect, a Gmail account works the same way.
3. Click **Create Service** and note the **Service ID**, which looks like `service_ab12cd3`.

## 3. Create the email template

1. Open **Email Templates > Create New Template**.
2. In the template settings, fill in:
   - **Subject:** `{{subject}}`
   - **To Email:** `{{to_email}}`
   - **From Name:** `WJR Taxi Tours & Auto Rentals`
   - **Reply To:** `{{reply_to}}`
3. In **Content**, switch to the code or HTML editor if there is one, delete the sample text and type exactly:

       {{{message_html}}}

   There are **three** curly brackets on each side. The bookings page builds the whole email, including the logo, the booking details and the rental terms, so the template only needs this one line.
4. Save, and note the **Template ID**, which looks like `template_x9y8z7`.

## 4. Copy the public key

Open **Account** (or **Account > General**) and copy the **Public Key**. It is meant to be used on websites, so it is safe in the site files.

If EmailJS offers a setting to only allow requests from certain websites, add `projects473.github.io`.

## 5. Connect the website

1. On GitHub, open `js/rentals.js` and click the pencil icon.
2. Fill in the three values on the `email:` line, for example:

       email: { publicKey: "AbC123xyz", serviceId: "service_ab12cd3", templateId: "template_x9y8z7", replyTo: "wjrtt@outlook.com" },

3. Commit. In the one-file version, make the same change inside `admin.html`, near the bottom.

## 6. Test

1. Open the bookings page and add a test booking with your own email address.
2. You should see "Confirmation email sent to ..." and receive the email within a minute. Check the spam folder the first time and mark it "Not spam".
3. Delete the test booking.

## Good to know

- **The checkbox:** Wayne can untick "Email the customer a booking confirmation" before saving to skip the email.
- **Resending:** each upcoming booking in the list has an **Email** button that sends the confirmation again.
- **If sending fails** (no internet, or the monthly limit reached), the booking is still saved and a button appears to send the email from Wayne's email app instead.
- **Privacy:** customer email addresses are stored encrypted with Wayne's password, like names and phone numbers.
- **Changing the wording:** the email text is in `admin.html`, in the section headed "confirmation email". Ask Savvy Tech to change it.
