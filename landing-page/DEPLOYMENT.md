# Deployment Instructions for Link Share for Gmail™ Landing Page

This landing page is designed to be deployed at `gls.cenvalabs.com` (or your chosen domain).

## Quick Start

### Option 1: Deploy with Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy the landing page:**
   ```bash
   cd landing-page
   vercel
   ```

3. **Configure your domain:**
   - Go to Vercel dashboard
   - Add your custom domain (`gls.cenvalabs.com`)
   - Update your DNS records as instructed

### Option 2: Deploy with Netlify (Free & Easy)

1. **Connect your repository to Netlify:**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Select your repository

2. **Configure build settings:**
   - Build command: Leave empty (static HTML/CSS)
   - Publish directory: `landing-page`

3. **Add custom domain:**
   - In Netlify settings, add your domain (`gls.cenvalabs.com`)
   - Update DNS records as instructed

### Option 3: Deploy with GitHub Pages

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select `main` branch and `/landing-page` folder

2. **Update DNS:**
   - Point `gls.cenvalabs.com` CNAME to `yourusername.github.io`

### Option 4: Traditional Web Hosting

1. **Upload files via FTP/SFTP:**
   - Connect to your web hosting
   - Upload all files from the `landing-page` folder to your public directory

2. **Configure your domain:**
   - Update DNS A record to point to your hosting IP

## Files to Deploy

```
landing-page/
├── index.html
├── styles.css
└── privacy-policy.html (optional)
└── terms-of-service.html (optional)
```

## Pre-deployment Checklist

- [ ] Domain `gls.cenvalabs.com` is registered and ready
- [ ] DNS is configured (or will be configured with hosting provider)
- [ ] All links in the landing page are working correctly
- [ ] Images and logo files are loading properly
- [ ] Privacy Policy and Terms of Service pages exist (or update footer links)
- [ ] Google OAuth documentation links are accessible

## DNS Configuration Examples

### For Vercel:
```
gls    CNAME    cname.vercel-dns.com
```

### For Netlify:
```
gls    CNAME    your-site.netlify.app
```

### For traditional hosting:
```
gls    A        123.45.67.89
```

## Environment Variables

No environment variables are needed. This is a pure static HTML/CSS landing page.

## Support

For deployment issues:
- **Vercel:** https://vercel.com/support
- **Netlify:** https://support.netlify.com
- **GitHub Pages:** https://docs.github.com/en/pages

## Next Steps

After deploying the landing page:

1. Update Google Cloud Console with the homepage URL: `https://gls.cenvalabs.com`
2. Test that Google's verification tools can access your homepage
3. Submit the updated OAuth application for re-verification
4. Add the landing page URL to your Chrome Web Store listing

## Testing Your Deployment

Once deployed, verify:

1. **Homepage loads:** Visit `https://gls.cenvalabs.com`
2. **Links work:** Click on all CTA buttons and footer links
3. **Responsive design:** Test on mobile devices
4. **Images load:** Verify logo appears correctly
5. **Google can see it:** Use Google's URL inspection tool on your homepage
