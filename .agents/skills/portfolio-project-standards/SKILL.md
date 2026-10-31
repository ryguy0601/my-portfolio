---
name: portfolio-project-standards
description: >-
  Enforces portfolio standards whenever creating, updating, or scaffolding a new project or repository.
  Ensures that demo images follow the demoPics/ convention required by the portfolio sync engine,
  and that README.md files follow the high-impact architecture, badge, and summary formatting expected.
---

# Portfolio Project Standards: `demoPics/` & README Formatting

Whenever scaffolding, building, or contributing to a project/repository in this workspace, you must adhere to the portfolio integration requirements so that the automated GitHub sync engine, public showcase, and ATS Resume Builder can index, screenshot, and describe the project without manual configuration.

---

## 1. Demo Image Folder Convention: `demoPics/`

The portfolio synchronization engine automatically crawls repositories for visual demonstration assets. Every repository must follow this structure:

### Directory Location & Structure
```text
<repo-root>/
├── demoPics/
│   ├── pic1.png   (or <feature>-overview.png)
│   ├── pic2.png   (or <feature>-dashboard.png)
│   └── ...
```

### Requirements for Images:
1. **Directory Name**: Must be named exactly `demoPics/` (case-sensitive) located at the root of the repository.
2. **File Formats**: High-resolution `.png` or `.webp` (avoid lossy, blurred JPEG).
3. **Primary Cover Image**:
   - The first image alphabetically (e.g. `pic1.png` or `01-overview.png`) serves as the primary card cover thumbnail on the `/projects` showcase and the interactive modal dialogs.
   - Subsequent images (`pic2.png`, `pic3.png`, etc.) populate the full-screen photo gallery carousel.
4. **Content Quality**:
   - Screenshots must show the actual application in action (UI dashboard, CLI terminal execution, or architecture workflow).
   - Crisp resolution (minimum `1280x720` or `1920x1080`), dark-mode preferred to match the portfolio aesthetic.
   - No placeholder images or empty mockups.

---

## 2. README.md Formatting Standards

The portfolio crawler reads the repository's `README.md` to extract project summaries, architecture details, and technical badges for ATS resume bullet generation and project modal content.

### Standard Template Structure:

```markdown
# <Icon/Emoji> <Project Title>

<1-2 sentence high-impact elevator pitch stating what the application is, the primary architecture/technologies used, and the real-world engineering problem it solves.>

<div align="center">

![Tech 1](https://img.shields.io/badge/<Tech1>-<HexColor>?style=for-the-badge&logo=<LogoName>&logoColor=white)
![Tech 2](https://img.shields.io/badge/<Tech2>-<HexColor>?style=for-the-badge&logo=<LogoName>&logoColor=white)
...

</div>

---

## 🌟 Key Features
- **<Core Feature 1>:** <Achievement-oriented description with technical specifics, e.g., algorithms, latency, concurrency.>
- **<Core Feature 2>:** <Description highlighting architectural decisions, data models, or automated pipelines.>
- **<Core Feature 3>:** <Security, performance, or deployment highlight.>

---

## 🏗 Architecture & Tech Stack
```text
<ASCII architecture diagram, component flowchart, or data pipeline sequence>
```

- **Frontend / Client:** <Technologies, styling, state management>
- **Backend / Microservices:** <APIs, languages, frameworks, messaging>
- **Database & Storage:** <Databases, caching layers, schemas>
- **Automation / AI / Testing:** <Libraries, testing frameworks, CI/CD>

---

## 🚀 Setup & Installation
```bash
# Clone the repository
git clone https://github.com/<owner>/<repo-name>.git
cd <repo-name>

# Install dependencies and start
...
```
```

---

## 3. Resume Bullet Point Formatting

When writing descriptions or project summaries, use **bold markdown tags** for tech stacks and metrics so the portfolio resume engine and ATS builder can parse and format them automatically:

- **Action Verb** + **Technical Implementation** + **Result/Metric**:
  - *Example:* "Engineered a multithreaded visual regression and DOM-aware alignment testing engine using **Python**, **Playwright**, and **Pillow** to catch UI layout shifts between environments."
  - *Example:* "Implemented **Longest Common Subsequence (LCS)** dynamic programming algorithms to align corresponding DOM elements side-by-side prior to pixel matching, eliminating false positives from responsive reflows."
