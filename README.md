# Avyon Admin Panel

Vite + React admin panel for managing trials, manual subscription
activation, businesses, branches, POS terminals, and staff — companion to
the Avyon POS mobile app and its backend.

## Status: Chunk 6 of N — Branch-level billing model ✅

⚠️ **MAJOR MODEL CHANGE.** Subscriptions are no longer business-wide —
every BRANCH is now billed independently, with its own trial, status,
expiry, plan, and payment history. A business with 3 branches can have
Branch A active, Branch B suspended, and Branch C still on trial,
simultaneously. This requires the matching backend (`backend-v2`) and POS
app patches (`pos-app-v2`) delivered alongside this — none of the three
work correctly on their own with mismatched versions of the other two.

Builds clean (`npm run build` / `npm run lint`, zero errors).

### What changed in this chunk

**Dedicated Subscriptions page (`/subscriptions`)** — the actual feature
request for this chunk. Flat list of every BRANCH across every business
(not businesses), since branches are the real billable unit. Search by
branch/business/owner, filter by status and plan, sort by urgency/recency/
payment amount. Each row links to that branch's business detail page,
since activation/suspend/resume actions live there — this page is for
finding and reviewing, the business detail page is for acting.

**Business Detail page** — restructured. There's no longer one
subscription header at the top; each branch in the Branches section now
has its own compact subscription card (status, countdown, activate/
suspend/resume buttons) plus its own collapsible payment history. A
business with several branches shows several of these stacked.

**Businesses page** — rows now show an AGGREGATED view: branch count, and
the WORST subscription status across all of a business's branches (with
which branch that was, if there's more than one). This is computed
server-side (`getAllBusinesses` in the new backend) so the UI doesn't
need its own aggregation logic.

**Dashboard** — "Expiring soon" and "Needs attention" now read from the
flat branch list, not the business list, so a single at-risk branch
inside an otherwise-healthy multi-branch business still surfaces.

**Analytics** — status breakdown chart now counts branches, not
businesses, for the same reason.

## ⚠️ Required companion deliveries

This panel alone does nothing useful without:

1. **`backend-v2`** — replaces chunk-1's business-level subscription
   logic with branch-level. Includes a migration script
   (`scripts/migrateToBranchLevelBilling.js`) to move any existing
   business-level trial/subscription data down onto each business's main
   branch, since chunk 1 may already be deployed with real data. **Run
   the migration script before deploying this admin panel update**, or
   every existing branch will show as freshly-trialed/no-history.
2. **`pos-app-v2`** — moves the POS app's access-enforcement gate from
   "before branch selection" to "after a branch is chosen," since under
   this model there's no business-wide access state to check before that
   point. Also updates `SubscriptionExpiredModal` to name which branch is
   blocked and offer switching to a different (unblocked) branch instead
   of only logout.

## Setup

    npm install
    cp .env.example .env.local
    npm run dev

## Granting yourself admin access

    node scripts/setAdminClaim.js you@example.com superadmin

## Project structure (changed files from chunk 5)

    src/
      components/
        businesses/
          BusinessRow.jsx              CHANGED — aggregated branch status
          BranchesSection.jsx          REWRITTEN — hosts per-branch cards
          BranchSubscriptionCard.jsx   NEW — replaces SubscriptionHeaderCard
          AccountStatusCard.jsx        unchanged (still business-wide)
          EditFieldModal.jsx           unchanged
        subscriptions/
          ActivateSubscriptionModal.jsx  CHANGED — targets a branch
          SuspendModal.jsx                CHANGED — targets a branch
          ResumeModal.jsx                 CHANGED — targets a branch
          SubscriptionHistoryCard.jsx     CHANGED — reads branch history
          SubscriptionBranchRow.jsx       NEW — row for /subscriptions
        analytics/
          StatusBreakdownChart.jsx     CHANGED — counts branches
      pages/
        DashboardPage.jsx           CHANGED — reads /admin/branches
        BusinessesPage.jsx          CHANGED — "Plan" column → "Branches"
        BusinessDetailPage.jsx      REWRITTEN — simpler, delegates to BranchesSection
        SubscriptionsPage.jsx       REWRITTEN — now the real feature
        AnalyticsPage.jsx           CHANGED — fetches branches for breakdown

Everything else (auth, layout, UI primitives, staff management, PIN
reset, toast system) is unchanged from chunks 3–5.

## Why branches are billed independently, with no business-level fallback

This was a deliberate confirmed choice (not a default): a business owner
who wants to pause ONE underperforming branch without affecting their
other branches' POS access needed first-class support, not a workaround.
The tradeoff is more admin clicks for businesses that only ever have one
branch (the common case) — but single-branch businesses get the old
"blocked immediately" behavior for free, with zero special-casing,
because there's only one branch for them to land on. The complexity only
shows up when it's actually needed (multi-branch businesses).
