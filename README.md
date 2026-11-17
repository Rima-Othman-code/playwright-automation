# Playwright TypeScript Automation Framework (UI & API)

[![Playwright Automation CI](https://img.shields.io/github/actions/workflow/status/Rima-Othman-code/playwright-automation/playwright.yml?branch=main&label=Playwright%20Automation%20CI)](https://github.com/Rima-Othman-code/playwright-automation/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.65.1-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)

End-to-end UI and API automation framework for **SauceDemo** and the **Simple Books API**.

## 1. Project Title & Badge

**Playwright TypeScript Automation Framework (UI & API)**

[![Playwright Automation CI](https://img.shields.io/github/actions/workflow/status/Rima-Othman-code/playwright-automation/playwright.yml?branch=main&label=Playwright%20Automation%20CI)](https://github.com/Rima-Othman-code/playwright-automation/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.65.1-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)

## 2. Project Description

A scalable, modular end-to-end test automation framework built with **Playwright** and **TypeScript**, covering cross-browser UI flows on **SauceDemo** (`Chromium` & `Firefox`) and RESTful API lifecycle testing on the **Simple Books API**. It implements the Page Object Model (POM), custom fixtures with pre-authenticated `storageState.json` session reuse, and an encapsulated API service client. All 12 test executions run automatically in CI via **GitHub Actions** with downloadable HTML reports.

**Tech stack**

| Layer | Version in this repo |
| --- | --- |
| Playwright (`@playwright/test`) | 1.65.1 |
| TypeScript | 6.0.3 |
| Node.js types (`@types/node`) | 25.9.9 |
| Browsers | Chromium and Firefox |
| CI | GitHub Actions (`ubuntu-latest`, Node.js 20) |

UI base URL: `https://www.saucedemo.com`. API base URL: `https://simple-books-api.click`.

## 3. Prerequisites

- **Node.js** (v20.x or higher — includes `npm`)
- **Git**

## 4. Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Rima-Othman-code/playwright-automation.git
   cd playwright-automation
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install Playwright browsers:**

   ```bash
   npx playwright install chromium firefox
   ```

## 5. Running Tests

The suite has three Playwright projects: `chromium` and `firefox` (UI, `tests/ui`) and `api` (`tests/api`). The four UI scenarios run once per browser, so a full run is **12 executions** of **8 scenarios** (8 UI + 4 API).

| Goal | Command |
| --- | --- |
| All tests | `npm test` |
| UI only (Chromium and Firefox) | `npm run test:ui` |
| API only | `npm run test:api` |
| Both UI and API | `npx playwright test --project=chromium --project=firefox --project=api` |
| Headed mode | `npx playwright test --headed` |

`npm test` and the “both” command run the same three projects. Headed mode opens a real browser window. Combine it with a subset:

```bash
npm run test:ui -- --headed
npm run test:api -- --headed
npx playwright test --project=chromium --headed
```

Locally, retries are off and workers are Playwright’s default. In CI, tests retry once and run with 2 workers. `test.only` is forbidden when `CI` is set.

## 6. Architecture & Structure

The suite uses the **Page Object Model** for UI, a **single API client** for HTTP calls, and **Playwright fixtures** so specs receive pages instead of constructing them. Login for the sort and checkout scenarios is done once in global setup and reused through `storageState.json`.

```text
playwright-automation/
├── .github/workflows/playwright.yml   # CI: install, test, upload the HTML report
├── src/
│   ├── api/BooksApiClient.ts          # Simple Books API wrapper (status, books, auth, orders)
│   ├── data/users.json                # SauceDemo users and checkout data
│   ├── fixtures/base.fixture.ts       # Page-object fixtures and authenticatedPage
│   ├── pages/
│   │   ├── LoginPage.ts               # Login form and error message
│   │   ├── InventoryPage.ts           # Product list, sort, add to cart
│   │   ├── CartPage.ts                # Cart contents and checkout entry
│   │   └── CheckoutPage.ts            # Shipping details and order completion
│   ├── utils/data-generator.ts        # Unique email for API client registration
│   ├── global-setup.ts                # Logs start time and writes storageState.json
│   └── global-teardown.ts             # Logs suite end time
├── tests/
│   ├── ui/saucedemo.spec.ts           # TC_UI_001–TC_UI_004 (Chromium and Firefox)
│   └── api/simple-books.spec.ts       # TC_API_001–TC_API_004 (serial)
├── playwright.config.ts               # Projects, reporters, retries, base URLs
├── tsconfig.json                      # TypeScript (ES2022, strict, JSON imports)
├── package.json                       # npm scripts
├── package-lock.json                  # Locked dependency versions
├── storageState.json                  # Generated login session (created by global setup)
└── reports/html-report/               # Generated HTML report (created by a test run)
```

`authenticatedPage` opens a new context with `storageState.json`, so TC_UI_003 and TC_UI_004 skip the login form. API tests run serially because later cases depend on the book id and token from earlier cases.

## 7. Test Scenarios

Eight scenarios. UI cases run on Chromium and Firefox. API cases run against `https://simple-books-api.click`.

### UI test cases (SauceDemo)

| ID | Scenario | What it checks |
| --- | --- | --- |
| TC_UI_001 | Successful login with the standard user | Lands on `inventory.html`, title is `Products`, and 6 products are listed |
| TC_UI_002 | Locked-out user login | The error banner is visible and matches the locked-out message |
| TC_UI_003 | Sort by price (low to high) with a saved session | Prices on the inventory page are in ascending order |
| TC_UI_004 | Checkout with 2 products | Cart badge is `2`, the cart has 2 items, and the header is `Thank you for your order!` |

### API test cases (Simple Books API)

| ID | Scenario | What it checks |
| --- | --- | --- |
| TC_API_001 | API health | `GET /status` returns 200 and `status` is `OK` |
| TC_API_002 | Filtered book list | `GET /books?type=fiction&limit=5` returns 1–5 fiction books, then stores an available book id |
| TC_API_003 | Register an API client | `POST /api-clients` returns 201 and a bearer `accessToken` (unique email each run) |
| TC_API_004 | Order lifecycle | Create order (201), get it (200), delete it (204), then get it again (404) |

## 8. Viewing Reports

Playwright writes an HTML report to `reports/html-report` and does not open it automatically (`open: 'never'` in `playwright.config.ts`). The `list` reporter still prints results in the terminal. On failure, the report can include a screenshot and a video. A trace is captured on the first retry (retries run in CI).

1. Run any test command from section 5. Wait until the process exits.
2. Open the report:

   ```bash
   npm run report
   ```

   That runs `npx playwright show-report reports/html-report`. Playwright serves the report on a local port and opens it in your default browser.
3. Use the report UI to open a test, its error, screenshots, video, and trace.
4. Stop the local server with Ctrl+C in the terminal when you are done.

You can also open `reports/html-report/index.html` in a browser. Serving it with `npm run report` is the reliable way to load traces.

## 9. CI/CD

Workflow file: `.github/workflows/playwright.yml` (`Playwright Automation CI`).

**Triggers**

- Push to `main`, `master`, or `feat/project-setup`
- Pull request targeting `main` or `master`
- Manual run (`workflow_dispatch`) from the Actions tab

**What the job does**

1. Checks out the repo.
2. Installs Node.js 20 and caches npm.
3. Installs dependencies with `npm ci`.
4. Installs Chromium and Firefox with system dependencies.
5. Runs `npx playwright test` (UI on both browsers and the API project).
6. Uploads the HTML report unless the job was cancelled.

The job runs on `ubuntu-latest` with a 30-minute timeout. CI sets one retry and two workers.

**Artifacts**

The report artifact is named `playwright-html-report`. It is the `reports/html-report/` folder and is kept for 14 days.

To view it: open the repository **Actions** tab, select **Playwright Automation CI**, open the run, and download **playwright-html-report** from Artifacts at the bottom of the run summary. Unzip it and open `index.html`, or serve the unzipped folder with `npx playwright show-report <folder>`.
