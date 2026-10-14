# Moses Onyango — portfolio

Plain HTML, CSS and vanilla JavaScript. No build step.

## Files

```
index.html            REPLACE your old index.html
styles.css            NEW  (the CSS used to be inline in index.html)
main.js               NEW  (the JS used to be inline in index.html)
images/               KEEP your existing folder: Mose.JPG, dev.png,
                      Uiversity-certificate.png, edureka.jpg
images/projects/      NEW  add the screenshots below
images/og-image.jpg   NEW  1200x630 social-preview image
assets/Moses-Onyango-CV.pdf   NEW  your CV
```

## Add these before publishing

| File | What it is |
|---|---|
| `images/projects/afrieuropa.jpg` | Screenshot of AfriEuropa News (16:10, about 1280x800) |
| `images/projects/ans.jpg` | Screenshot of Africa Narrative Signals |
| `images/projects/wedding-website.jpg` | Screenshot of the wedding invitation site |
| `images/projects/wedding-album.jpg` | Screenshot of the photo album |
| `images/projects/resume.jpg` | Screenshot of the interactive résumé |
| `images/og-image.jpg` | Social preview (1200x630) |
| `assets/Moses-Onyango-CV.pdf` | Your CV |

Until a screenshot exists, the card shows a styled title cover instead of a broken image.
Until the CV exists, the "Download CV" buttons automatically become "View résumé" and open your live résumé.
Compress screenshots first (squoosh.app, aim for under 200 KB each).

## Fill in the gaps (search `TODO` in index.html)

- Live links and GitHub repo links for each project (add a button to the card's `.project-actions`).
- Tech, problem, features and role for AfriEuropa, ANS and the wedding website (inside each `<template>`).
- Professional experience timeline (Experience section).
- `og:image` / `og:url` must become absolute URLs, and add a `<link rel="canonical">`, once you have a domain.

## Contact form

Still posts to your Formspree endpoint (`https://formspree.io/f/xjgaolln`) using fetch, so visitors stay on the page.
New fields (`enquiry_type`, `project_type`, `budget`) arrive in the email. In the Formspree dashboard you can
confirm that your notification email is correct and that spam filtering is on.

## Deploy

**Vercel** (you already use it): push the folder to GitHub, import the repo at vercel.com/new, framework preset "Other", deploy.
**Netlify**: drag the folder onto app.netlify.com/drop.
**GitHub Pages**: push to a repo, Settings → Pages → deploy from branch `main` / root.

To test locally: `python3 -m http.server 8000` in this folder, then open http://localhost:8000
(the CV check and form need http, not a double-clicked file).
