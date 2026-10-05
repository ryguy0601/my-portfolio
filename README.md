# Full-Stack Portfolio & Admin Dashboard

A high-performance, dynamic portfolio and management system built with Astro (Server Mode/SSR), Bootstrap 5, Supabase (PostgreSQL), and custom SCSS. It features full-screen snap-scroll project galleries, dynamic tech-stack logo resolution, automated image carousel backdrops, particle canvas effects, and an administrative dashboard protected with password and TOTP verification.

---

## Key Features

### Immersive Snap-Scroll Gallery (`/projects`)

Full-page vertical sections featuring background carousel screenshots, glassmorphism cards, and automated technology icon mapping via Simple Icons CDN with text badge fallbacks.

### Interactive Terminal Hero (`/`)

Custom canvas particle network combined with an automated terminal typewriting simulator.

### Secure Admin Dashboard (`/admin`)

Database-driven content management supporting live project creation, editing, deletion, image management, and feature flagging.

### Multi-Factor Authentication (MFA)

Admin access uses the `ADMIN_PASSWORD` and `ADMIN_MFA_SECRET` environment variables with server-side TOTP verification.

---

## Tech Stack

| Category               | Technology                                              |
| ---------------------- | ------------------------------------------------------- |
| **Frontend Framework** | Astro (Server Mode / SSR)                                 |
| **Styling & UI**       | Bootstrap 5, Custom SCSS, Simple Icons                    |
| **Database**           | Supabase PostgreSQL                                      |
| **Admin authentication** | Environment password and TOTP (`otplib`)              |
| **Language**           | TypeScript / JavaScript / HTML5                         |

---

## Project Structure

```text
my-portfolio/
├── public/
│   ├── favicon.ico
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── FeaturedProjects.astro
│   │   └── TechBadgeList.astro
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── index.astro
│   │   │   ├── login.astro
│   │   │   └── logout.astro
│   │   │
│   │   ├── index.astro
│   │   └── projects.astro
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── index.scss
│   │   ├── main.scss
│   │   └── projects.scss
│   └── utils/
│       ├── techIcons.ts
│       └── theme.ts
│
├── .env
├── .env.enxample
├── .gitignore
├── astro.config.mjs
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

> **Note:** Development-specific directories such as `.astro`, `.vscode`, `node_modules`, and `dist` are not included in the project structure above.

---

## Setup & Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/ryguy0601/portfolio.git
cd portfolio
```

### 2. Install Dependencies

Install the required packages:

```bash
npm install
```

### 3. Configure Environment Variables

The project includes an `.env.enxample` file containing the base environment configuration.

Create your local `.env` file by copying the example:

```powershell
Copy-Item .env.enxample .env
```

Alternatively, manually create a `.env` file and copy the values from `.env.enxample`.

The example file contains the base configuration required for the application to run.

> **Note:** The `.env` file contains environment-specific configuration and should not be committed to source control. Never expose sensitive credentials such as the `SUPABASE_SERVICE_ROLE_KEY` to the public frontend bundle.

### 4. Start the Development Server

Start the application:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:4321
```

### 5. First-Time Admin Login

On the first attempt to log in through the `/admin` page, the application will provide an MFA code/setup value.

Enter the code provided by the application into the MFA field to complete the initial authentication process.

After successfully logging in, update the administrator password to a password of your choice.

> **Note:** Use a strong, unique password for the administrator account.

## Deployment

This repository uses two deployments:

- **GitHub Pages:** public static portfolio at `/`, `/projects`, and `/projects/:slug`.
- **Vercel:** SSR admin application and database mutations at `/admin`.

### GitHub Pages setup

Enable **Settings > Pages > Source: GitHub Actions** in the repository. Add these repository secrets:

```text
PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PUBLIC_ADMIN_URL
```

`PUBLIC_ADMIN_URL` should be the Vercel admin URL, for example `https://my-portfolio-admin.vercel.app/admin`.
The `Deploy public portfolio to GitHub Pages` workflow publishes the public build and removes server-only admin pages before upload.

### Vercel setup

Import the repository into Vercel and keep the framework as Astro. Add these environment variables in Vercel for **Production**:

```text
PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
ADMIN_MFA_SECRET
PUBLIC_PORTFOLIO_URL
```

Set `PUBLIC_PORTFOLIO_URL` to the GitHub Pages URL. Do not add the service-role key to browser code or commit any `.env` file.

The public Pages build is a snapshot generated from Supabase when `main` changes. After editing content in the Vercel admin dashboard, trigger the Pages workflow again to publish the updated public portfolio.

---

## Supabase Database & Table Setup

The portfolio uses Supabase PostgreSQL as its primary database. The database contains four tables supporting projects, professional experience, project-to-experience relationships, and resume management.

### Theme Settings

Run `database/theme.sql` in the Supabase SQL editor to create the `site_theme` table. The admin dashboard's **Theme** tab stores the customizable CSS theme tokens in one JSONB row and applies them across the public site. The table is intentionally a singleton so more theme controls can be added without changing the schema.

### Database Schema

#### `projects`

Stores portfolio project information.

| Column            | Type    | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| `id`              | integer | Primary key                                |
| `title`           | text    | Project title                              |
| `slug`            | text    | Unique URL-friendly project identifier     |
| `summary`         | text    | Short project summary                      |
| `content`         | text    | Detailed project content                   |
| `tech_stack`      | text    | Technologies used by the project           |
| `live_url`        | text    | Live project URL                           |
| `github_url`      | text    | GitHub repository URL                      |
| `featured`        | boolean | Determines whether the project is featured |
| `image_url`       | text    | Primary project image                      |
| `image_filenames` | array   | Project image filenames                    |

#### `work_experience`

Stores professional work experience.

| Column        | Type    | Description            |
| ------------- | ------- | ---------------------- |
| `id`          | integer | Primary key            |
| `company`     | text    | Company name           |
| `role`        | text    | Job role               |
| `start_date`  | text    | Employment start date  |
| `end_date`    | text    | Employment end date    |
| `description` | text    | Experience description |
| `order_index` | integer | Display ordering       |

#### `project_experience`

Provides a many-to-many relationship between projects and work experience.

| Column          | Type    | Description                     |
| --------------- | ------- | ------------------------------- |
| `project_id`    | integer | References `projects.id`        |
| `experience_id` | integer | References `work_experience.id` |

The composite primary key ensures that the same project and experience entry cannot be linked more than once.

#### `resume`

Stores available resume versions.

| Column         | Type      | Description                               |
| -------------- | --------- | ----------------------------------------- |
| `id`           | integer   | Primary key                               |
| `version_name` | text      | Name or identifier for the resume version |
| `file_url`     | text      | Location of the resume file               |
| `updated_at`   | timestamp | Last update timestamp                     |

### Database Relationships

```text
projects
    │
    │
    ▼
project_experience
    │
    │
    ▼
work_experience


resume
```

The `project_experience` table connects portfolio projects with relevant professional experience using foreign keys to both `projects` and `work_experience`.

### Supabase SQL Schema

The database schema consists of the following tables:

```sql
CREATE TABLE public.work_experience (
  id integer NOT NULL DEFAULT nextval('work_experience_id_seq'::regclass),
  company text NOT NULL,
  role text NOT NULL,
  start_date text NOT NULL,
  end_date text,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  CONSTRAINT work_experience_pkey PRIMARY KEY (id)
);

CREATE TABLE public.projects (
  id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  content text,
  tech_stack text NOT NULL,
  live_url text,
  github_url text,
  featured boolean DEFAULT false,
  image_url text,
  image_filenames ARRAY,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

CREATE TABLE public.project_experience (
  project_id integer NOT NULL,
  experience_id integer NOT NULL,
  CONSTRAINT project_experience_pkey PRIMARY KEY (project_id, experience_id),
  CONSTRAINT project_experience_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_experience_experience_id_fkey
    FOREIGN KEY (experience_id) REFERENCES public.work_experience(id)
);

CREATE TABLE public.resume (
  id integer NOT NULL DEFAULT nextval('resume_id_seq'::regclass),
  version_name text NOT NULL,
  file_url text NOT NULL,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT resume_pkey PRIMARY KEY (id)
);
```

---

## Multi-Factor Authentication (MFA)

The admin area is protected using Multi-Factor Authentication (MFA).

On the first login attempt, the application provides the MFA code/setup information required to complete the authentication process.

### First-Time MFA Setup

1. Start the application:

```bash
npm run dev
```

2. Navigate to:

```text
http://localhost:4321/admin
```

3. Enter the initial administrator credentials.

4. When prompted for MFA, use the code provided by the application.

5. Complete the authentication process.

6. Once logged in, update the administrator password to a password of your choice.

> **Recommendation:** Use a strong, unique password when configuring the administrator account.

---

## Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser at:

```text
http://localhost:4321
```

---

## Building for Production

Build and preview the production bundle:

```bash
npm run build
npm run preview
```
