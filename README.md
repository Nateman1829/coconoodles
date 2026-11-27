# Coco Mogu and Fried Noodles — website

A plain HTML + CSS website with one small script for the order form. No build step.

## Files

- `index.html` — the page
- `style.css` — colors, fonts and layout
- `script.js` — the order form: adds up the total and emails each order to you through Web3Forms (web3forms.com)
- `images/` — photos, GCash QR code, logo (`logo.svg`, and `logo-1024.png` for Facebook or printing) and the tab icon

## Publish on GitHub Pages

1. Sign in at github.com and click **New repository**. Name it, for example, `coco-mogu`, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**.
3. Drag in `index.html`, `style.css`, `script.js`, `README.md` and the whole `images` folder (keep the folder name). Click **Commit changes**.
4. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main** and folder to **/ (root)**, then click **Save**.
5. Wait a minute or two and refresh. Your site's address appears at the top of that page, like `https://your-username.github.io/coco-mogu/`.

## Turn on order emails (one time)

1. Go to web3forms.com, enter natejoaquinaguisanda@gmail.com and create an access key. It is emailed to you.
2. Your key is already in `script.js` (`WEB3FORMS_KEY`). If you ever make a new key, paste it there.
3. Every order arrives in your inbox as "New order from …".

## Making changes later

- Prices, menu items, hours and address are plain text in `index.html`. Search for the text you want to change. If you change a price, also change the `data-price` number on that item in the order form.
- Your order email is at the top of `script.js` (`ORDER_EMAIL`) and in two `mailto:` links in `index.html`.
- Your phone number appears in the `tel:09940401443` links. If it changes, replace every one.
- To change a photo, upload a new file with the same name into `images/`.
- After editing a file on GitHub, click **Commit changes**. The site updates in a minute or two.
