## Running dev server
`npm run dev`

## Each time you pull the repo
`npm install`

## Do not push to main unles you have verified build
`npm run build`

## Features

User Authentication
- Users can create an account using either Google Sign-In or by manually entering their registration details.
- Users can log in using Google authentication or their registered email and password credentials.

Transaction Management
- Users can add transactions individually or upload multiple transactions at once via a CSV file.
- During CSV uploads, a review window allows users to verify imported transactions, remove unwanted entries, and confirm the final upload.
- Users can modify transaction details, including description, amount, date, transaction type, and transaction source.
- Users can delete one or more transactions by selecting the desired records and confirming the deletion.

Transaction Search and Filtering
- Users can search for transactions by entering keywords from the transaction description.
- Users can filter transactions by selecting a specific date range.

Database Integration
- Transaction data is stored and managed through a database, allowing users to create, update, retrieve, and delete transactions that persist across sessions.
- User transactions are securely linked to their account and synchronized with the database.
