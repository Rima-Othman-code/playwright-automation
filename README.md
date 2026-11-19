# Playwright TypeScript Automation Framework (UI & API)

![Playwright Automation CI](https://img.shields.io/github/actions/workflow/status/Rima-Othman-code/playwright-automation/playwright.yml?branch=main&label=Playwright%20Automation%20CI)
![Playwright](https://img.shields.io/badge/Playwright-1.65.1-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)

End-to-end UI and API automation framework for **SauceDemo** and the **Simple Books API**.

## 1. Project Title & Badge

**Playwright TypeScript Automation Framework (UI & API)**

![Playwright Automation CI](https://img.shields.io/github/actions/workflow/status/Rima-Othman-code/playwright-automation/playwright.yml?branch=main&label=Playwright%20Automation%20CI)
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

| ID        | Scenario                                                         | What it checks                                                                                                           |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TC_UI_001 | Successful login with standard user                              | Logs in with a valid user and verifies landing on the Inventory page                                                     |
| TC_UI_002 | Data-Driven Invalid Login Validation                             | Runs 3 negative test scenarios to validate error messages on the Login page                                              |
| TC_UI_003 | Verify Products Sorted in Descending Alphabetical Order (Z to A) | Changes the sort option to Name (Z to A) on the Products page and validates the displayed order                          |
| TC_UI_004 | Complete end-to-end checkout flow with 2 products                | Asserts navigation to the Products page, dynamically adds the 2 most expensive items to the cart, and completes checkout |

### API test cases (Simple Books API)

| ID         | Scenario                                       | What it checks                                                                                                                                                 |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC_API_001 | Authenticate Client and Create New Book Order  | Authenticates the client via `POST /api-clients/`, retrieves available books via `GET /books`, submits an order via `POST /orders`, and extracts the `orderId` |
| TC_API_002 | Retrieve Details of a Newly Created Order      | Sends `GET /orders/:orderId` and validates the response body matches the created order                                                                         |
| TC_API_003 | Modify Customer Name on an Existing Order      | Sends `PATCH /orders/:orderId` to update the customer name, then sends `GET /orders/:orderId` to verify the update                                             |
| TC_API_004 | Delete Existing Order and Verify 404 Not Found | Deletes the order via `DELETE /orders/:orderId` and verifies removal with a `404 Not Found` check                                                              |

## 8. Viewing Reports

Playwright writes an HTML report to `reports/html-report` and does not open it automatically (`open: 'never'` in `playwright.config.ts`). The `list` reporter still prints results in the terminal. On failure, the report can include a screenshot and a video. A trace is captured on the first retry (retries run in CI).

1. Run any test command from section 5. Wait until the process exits.
2. Open the report:
   ```bash
         npm run report
   ```
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
