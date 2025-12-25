# Indicia Next Level - Shopify Theme

Custom Shopify theme for indicia-next-level.myshopify.com

## Connecting to Shopify

### Option 1: GitHub Integration (Recommended)

1. **Push this repo to GitHub:**
   ```bash
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect in Shopify Admin:**
   - Go to **Online Store > Themes**
   - Click **Add theme > Connect from GitHub**
   - Authorize Shopify to access your GitHub account
   - Select this repository and branch
   - Shopify will automatically sync changes

### Option 2: Shopify CLI

1. **Install Shopify CLI:**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **Login and push:**
   ```bash
   shopify theme push
   ```

3. **For development with hot reload:**
   ```bash
   shopify theme dev --store=indicia-next-level.myshopify.com
   ```

## Theme Structure

```
/
├── assets/          # CSS, JS, images, fonts
├── blocks/          # Theme blocks (reusable components)
├── config/          # Theme settings
├── layout/          # Theme layouts (theme.liquid, password.liquid)
├── locales/         # Translation files
├── sections/        # Theme sections
├── snippets/        # Reusable Liquid snippets
└── templates/       # Page templates (JSON or Liquid)
```

## Custom Sections

- `Raspberry.liquid` - Product page with video hero
- `stelz-product-flavors-grid.liquid` - Product flavors grid with category tabs

## Development

When making changes:
1. Create a branch for your feature
2. Make and test changes locally using `shopify theme dev`
3. Commit and push to GitHub
4. Shopify will auto-deploy if connected via GitHub integration

## License

Proprietary - All rights reserved.

