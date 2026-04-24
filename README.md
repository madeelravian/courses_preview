# Course Preview Library

Static showcase page for course previews, designed to deploy directly on GitHub Pages.

## How to use

1. Put your public Cloudflare R2 links into `data/courses.json`.
2. Update each course title, description, tags, and metadata.
3. Push this repository to GitHub.
4. Enable GitHub Pages from the repository settings using the root branch.

You can also host the JSON manifest somewhere public and load it like this:

`https://your-username.github.io/your-repo/?manifest=https://your-public-manifest.example/courses.json`

## Course data format

Each course entry supports these fields:

- `title`: visible course name.
- `description`: short preview summary.
- `url`: public R2 file URL.
- `type`: optional label like `PDF`, `Video`, or `Guide`.
- `duration`: optional metadata.
- `level`: optional metadata.
- `tags`: optional list of labels.
- `ctaLabel`: optional button text.

## Important R2 note

GitHub Pages is a static host, so this site cannot securely browse a private R2 bucket by itself.
Use public file URLs or generate a public JSON manifest that this page can fetch.