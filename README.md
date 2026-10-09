# Osama Al-Bassam — Portfolio

Personal site of a software engineer (KFUPM, B.S. Software Engineering, Honors) working on secure full-stack systems and anomaly detection.

**[o5mu.github.io/osama-portfolio](https://o5mu.github.io/osama-portfolio/)** · [Résumé](https://o5mu.github.io/osama-portfolio/cv.html)

## What's on the site

| Section | Shows |
| --- | --- |
| [Work](https://o5mu.github.io/osama-portfolio/#work) | **Integrated Waste-to-Electricity System** (senior capstone): offline architecture diagram, Random Forest power-output model at 91.1% R². **KFUPM Study Hub**: role-based access control matrix. Both link to their source. |
| [Experience](https://o5mu.github.io/osama-portfolio/#experience) | SABIC predictive-maintenance pipeline: 195,033 sensor records reduced to 16,030, three unsupervised detectors, sustained-anomaly ranking. |
| [Background](https://o5mu.github.io/osama-portfolio/#background) | Education, tools, SOC Level 1 lab training, certifications. |
| [Résumé](https://o5mu.github.io/osama-portfolio/cv.html) | Print-ready page; *Print / Save as PDF* produces a clean letter-size CV. |

## How it's built

Plain HTML, CSS and a few lines of JavaScript. No framework, no build step, no tracking.

```
index.html          the site
cv.html             print-ready résumé (styles inline)
style.css           layout, type and components
script.js           footer year, header rule on scroll, copy-email button
assets/portrait.jpg
```

- **Type:** [Archivo](https://fonts.google.com/specimen/Archivo) for headings and text, [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for labels.
- **Color:** near-black on near-white, with KFUPM teal `#085f66` as the only accent.
- **Diagrams:** the architecture diagram, RBAC table and data funnel are semantic HTML styled with CSS — no images — so they stay sharp and readable by screen readers.
- **Responsive:** tested from 375px phones to wide desktop monitors.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
npx http-server -p 5173
```

## Contact

[os.albassam@gmail.com](mailto:os.albassam@gmail.com) · [LinkedIn](https://linkedin.com/in/osama-albassam) · [GitHub](https://github.com/O5mu)
