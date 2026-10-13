# Listing Studio

> Private, local-first product listing copy for independent sellers.

Listing Studio helps Etsy, eBay, Depop, Shopify, and Instagram sellers turn rough product notes into polished marketplace listings. Enter a few details, choose a writing voice, and get a title, description, tags, and pricing guidance in seconds.

It is built with plain HTML, CSS, and JavaScript, so it runs directly in a browser with no build step or account.

## Why Listing Studio?

Writing every product listing from scratch is repetitive, especially for small sellers working alone. Listing Studio keeps the workflow simple and private by processing the details directly in the browser.

Listing Studio takes a browser-first approach:

- The core experience works offline in the browser.
- Product details are not sent to a hosted application server.
- No account, API key, or AI service subscription is required.
- Sellers can edit every generated result before publishing.

Privacy and simplicity are part of the product, not an afterthought.

## Features

- Marketplace listing title generation
- Product description generation
- Search-friendly tag suggestions
- Price positioning guidance
- Etsy, eBay, Depop, Shopify, and Instagram targets
- Warm, Playful, and Minimal writing voices
- Editable generated title and description
- Copy-all and description-only clipboard actions
- Product image upload and drag-and-drop preview
- Light mode and dark mode
- Saved theme preference
- Animated interactions and result transitions
- Browser-based offline writer
- Responsive layout for desktop and mobile
- No account, API key, backend, or installation required

## Quick start

### Option 1: Open directly

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Enter your product details.
4. Click **Generate my listing**.

No dependencies or installation are required for the default offline experience.

### Option 2: Use VS Code

1. Open the repository folder in VS Code.
2. Open `index.html`.
3. Right-click the file.
4. Choose **Open with Live Server**.

Live Server is optional. Opening the HTML file directly also works.

## How to use it

1. Add an optional product photo.
2. Describe what you are selling.
3. Select a category and condition.
4. Add materials, dimensions, colors, features, or the product story.
5. Enter the price and target marketplace.
6. Choose a voice.
7. Generate the listing.
8. Edit the result if needed.
9. Copy the final listing into your marketplace.

## Project structure

```text
listing-studio/
├── index.html   # Application markup and accessible UI structure
├── styles.css   # Responsive styling, themes, and animations
├── script.js    # Form logic, browser writer, and interactions
└── README.md    # Project documentation
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Browser File API
- Browser Clipboard API
- Browser Local Storage
- Google Fonts for the visual type system

The application has no framework and no npm dependency tree.

## Privacy model

- Product information is processed in the browser.
- No account is required.
- No API key is required.
- The application can run without internet after its fonts are cached or replaced locally.

The product photo is used only for local preview. The current writer does not upload or analyze the photo.

## Limitations

- The offline writer uses templates and keyword extraction rather than image understanding.
- Browser clipboard permissions may vary by browser and file-opening method.
- The generated copy should be reviewed before publishing.
- The current version does not publish listings directly to marketplace APIs.

## Roadmap

- Image-aware listing suggestions
- Marketplace-specific title length checks
- Saved product templates
- Export to Markdown, CSV, or plain text
- Bulk listing generation
- Optional local listing history
- First-user feedback and seller workflow improvements

## Side-hustle opportunity

Listing Studio can be useful as:

- A free local tool for sellers
- A paid niche version for jewelry, vintage, ceramics, or digital products
- A customized listing assistant for small shops
- A private desktop app for sellers with sensitive product information
- A marketplace-specific writing workflow

The simple architecture makes it possible to customize writing templates and workflows without being locked into a hosted service.

## Contributing

Contributions are welcome. Useful improvements include:

- Better offline writing templates
- Additional marketplace formats
- Accessibility improvements
- More product-specific writing templates
- Seller research and usability feedback

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Test the app by opening `index.html`.
5. Open a pull request with a clear description.

## License

Choose a license before publishing the repository. MIT is a simple option for a small open-source project:

```text
MIT License
```

If you use the project publicly, add a `LICENSE` file containing the complete license text.

## Status

Listing Studio is an early-stage prototype designed to validate a privacy-first listing workflow with independent sellers.
