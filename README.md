## Running dev server
`npm run dev`

## Each time you pull the repo
`npm install`

## Do not push to main unless you have verified build
`npm run build`

## Features

### User Authentication
- Users can create an account using either Google Sign-In or by manually entering their registration details.
- Users can log in using Google authentication or their registered email and password credentials.

### Transaction Management
- Users can add transactions individually or upload multiple transactions at once via a CSV file.
- During CSV uploads, a review window allows users to verify imported transactions, remove unwanted entries, and confirm the final upload.
- Transactions can be auto-categorised with AI assistance, with manual category selection available as a fallback.
- Users can modify transaction details, including description, amount, date, transaction type, and transaction source.
- Users can delete one or more transactions by selecting the desired records and confirming the deletion.
- Duplicate transactions are detected automatically, with a review modal to bulk-remove the extras.
- The transaction list is paginated with adjustable page size, alongside summary cards for totals, income, and expenses.

### Transaction Search and Filtering
- Users can search for transactions by entering keywords from the transaction description.
- Users can filter transactions by a custom date range or quick presets (last week, last month, last 6 months).

### Budgets
- Users can set a weekly spending limit for each expense category, with sensible defaults provided for new users.
- Budgets can be viewed over a selectable rolling window (last 7, 14, or 30 days), scaled automatically from the weekly limit.
- Each category shows a spending-vs-limit progress bar, with an expandable view showing cumulative daily spend against the limit.
- Alerts are shown automatically when spending nears (80%+) or exceeds a budget limit.

### What-If Planner
- Users can compare their current budget against an editable custom scenario, side by side.
- Monthly income is shared between both scenarios and seeded from the last 30 days of income transactions.
- Per-category sliders let users adjust the custom scenario without affecting their real saved budget, with options to apply or reset changes.
- Comparisons include expense and remaining-balance differences, a per-category bar chart, and a 12-month projected savings chart.

### Resources
- Educational articles on financial literacy topics for students, including budgeting, scholarships, Student Allowance, currency conversion, cost of living in NZ, part-time work, and tax.
- Each article includes a short "Quick Check" question with instant feedback and a cited source.
- A searchable financial glossary with expandable definitions, examples, and sources.

### Database Integration
- Transaction data is stored and managed through a database, allowing users to create, update, retrieve, and delete transactions that persist across sessions.
- User transactions are securely linked to their account and synchronized with the database.

### Navigation
- A navigation bar provides quick access to the Budget, Transactions, Resources, What-If Planner, and Dashboard pages.

### Account Management
- An account menu, accessible via the account icon, allows users to manage their session.
- Users can update their display name and, if registered by email, request a password reset.
- Google-authenticated accounts manage their credentials through Google rather than this app.
- Users can securely sign out of their account, which returns them to the login page.
