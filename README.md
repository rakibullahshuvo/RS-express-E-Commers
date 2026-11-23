# RS Express - static e-commerce landing page

A frontend-only storefront built with HTML, CSS and vanilla JavaScript. No backend, build step or installation.

## Run locally
Open `index.html` in any modern browser.

## Deploy on GitHub Pages
1. Create a new GitHub repository and upload everything in this folder (keep `index.html` in the repository root).
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute your site is live at `https://<username>.github.io/<repository>/`.

## Structure
```
index.html   page markup, SEO and Open Graph tags
style.css    design tokens, layout, dark mode
script.js    product data, cart, wishlist, search, quick view, filters
assets/      icons/favicon.svg, images/ (for your own local images)
```

## Notes
- Product and category photos load from Unsplash. To self-host, save images into `assets/images/` and change the `img` values in `script.js`. A neutral placeholder appears if an image fails to load.
- Fonts (Google Fonts) and icons (Font Awesome via cdnjs) load from CDNs, so an internet connection is needed.
- Cart, wishlist and theme are saved in `localStorage`.
- **Checkout and payment are not implemented.** Footer policy and social links show a "not part of this demo" message.
