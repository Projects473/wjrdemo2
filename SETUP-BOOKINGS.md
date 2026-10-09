# Rental bookings: setup guide

Wayne manages rental bookings on a private page, `admin.html`, for example https://projects473.github.io/wjrdemo2/admin.html. Each booking he saves is written into this GitHub repository (`data/bookings.json`), and the website's availability calendar crosses those dates out.

- **No Google account needed, and Wayne does not need a GitHub account.** The page saves to GitHub using an **access key** that you create once from the `projects473` account.
- **Customer names, phone numbers and notes are encrypted** with Wayne's password before they are saved. The repository is public, so anyone could open `data/bookings.json`, but they would only see the car, the dates and scrambled text.
- **The public website** only reads the car and dates.

## 1. Create the access key (you, about 3 minutes)

The access key is a GitHub "fine-grained personal access token" that can only change files in the `wjrdemo2` repository.

1. Sign in to GitHub as **projects473**.
2. Click your profile picture, then **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.
3. Fill in:
   - **Token name:** `WJR bookings`
   - **Expiration:** the longest available (GitHub may limit this to a year). Put a reminder in your calendar a week before it expires.
   - **Repository access:** *Only select repositories* and choose **wjrdemo2**.
   - **Permissions > Repository permissions > Contents:** *Read and write*. Leave everything else as it is.
4. Click **Generate token** and copy it. It starts with `github_pat_`. GitHub only shows it once.

If `projects473` is an organisation rather than a personal account, an owner may need to allow fine-grained tokens under the organisation's settings first.

## 2. Upload the files

Make sure these are in the repository:

- `admin.html`
- `data/bookings.json`, which holds the example bookings for now
- the updated `index.html`, `js/rentals.js` and `js/main.js`

In the one-file version, upload `admin.html` and `bookings.json` next to `index.html` instead.

## 3. Set up Wayne's phone (once per phone)

1. On Wayne's phone, open `.../wjrdemo2/admin.html`.
2. Paste the access key and tap **Connect**.
   - Shortcut: send Wayne the link `.../wjrdemo2/admin.html#key=` followed by the key. Opening it once saves the key on his phone and removes it from the address bar. Delete the message afterwards.
3. The first time, the page asks for a new **password**. Wayne picks one with at least 8 characters; three words together are easy to remember and hard to guess. This password locks the customer details.
4. In the browser menu, tap **Add to Home Screen** so the page opens like an app.

On a second phone or computer, repeat steps 1 and 2, then enter the same password.

## 4. Wayne's routine

1. Confirm the booking with the customer on WhatsApp.
2. Open the bookings page and enter his password.
3. Choose the car, tap the pick-up day, then the return day, add the customer's name and phone if he wants, and tap **Save booking**. If the dates clash with another booking, the page warns him first.
4. The website calendar shows the new booking within about a minute.
5. To cancel a booking, tap **Delete** next to it, then **Tap to confirm**.

The example bookings show as "Example booking". Delete them once real bookings start.

## Good to know

- **Forgotten password:** the dates still work, but the details of existing bookings can't be read. You can reset by setting the file back to the example in this zip, which removes all bookings.
- **Changing the password:** use **Change password** at the bottom of the bookings page. Every booking is re-locked with the new password.
- **Lost phone or leaked key:** on GitHub, delete the token (**Settings > Developer settings > Fine-grained tokens**) and create a new one. Then open the bookings page and tap **Disconnect this device** on any old device.
- **Expired key:** the bookings page says the key was refused. Create a new token the same way and paste it in.
- **History:** every change is saved as a commit in the repository, so earlier versions of the bookings file can be recovered from GitHub's history.
- Each save makes GitHub Pages republish the site, which is normal and takes about a minute.
