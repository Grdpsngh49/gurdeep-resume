# DevOps Resume Portfolio

This is a static multi-page portfolio site designed for Vercel deployment.

## Edit your content

Update all portfolio details in one file:

- `/content/portfolio-content.json`

That file controls:

- your profile and contact details
- your resume download link
- technical skills
- outages and incidents handled
- projects and innovations
- experience

## Add your resume

1. Put your PDF in `/uploads/`
2. Use `resume.pdf` or update `site.resumeFile` in `/content/portfolio-content.json`

## Local preview

Because this site loads content from JSON, preview it through a local server instead of opening the HTML file directly.

Example:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000`

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Import the repository in Vercel
3. Framework preset: `Other`
4. Build command: leave empty
5. Output directory: leave empty

Vercel will serve the static files directly.
