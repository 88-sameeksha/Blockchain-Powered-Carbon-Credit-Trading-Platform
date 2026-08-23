# Blockchain-Powered Carbon Credit Trading Platform

## Overview
An educational Web3 prototype that simulates carbon-credit issuance, ownership, marketplace trading, transfer and irreversible retirement using Solidity. All credits, verification metadata, wallets and payments are simulated/test data.

**Important:** this project does not create legally recognized, independently verified, or registry-issued carbon credits.

## Problem Statement
Carbon markets need clear provenance, ownership records, transfer history and retirement records. A blockchain ledger can provide a tamper-evident transaction history, but blockchain alone cannot prove that an environmental project actually achieved a claimed emissions reduction.

## Objectives
- Register simulated issuers.
- Issue simulated carbon-credit records.
- Track ownership by wallet address.
- List and purchase credits using test ETH.
- Transfer active credits.
- Retire credits permanently in the project state.
- Emit events that create an auditable activity trail.
- Demonstrate Solidity access control and marketplace security.

## Industry Relevance
The architecture is relevant as a prototype for sustainability platforms, ESG reporting support, carbon marketplaces, renewable-energy projects, manufacturing, aviation, logistics, corporate net-zero programs, climate-tech startups and carbon project developers.

Potential business value includes transparent ownership, traceability, reduced double-counting risk, easier auditing, digital settlement, marketplace efficiency and clearer retirement records.

## Carbon Credit Concept
A carbon credit is commonly used to represent one tonne of CO2-equivalent associated with an emissions reduction or removal claim under a defined methodology and verification framework. In this project, the quantity is only simulated.

**Trading:** an owner lists an active simulated credit at a price and a buyer purchases it with test ETH.

**Retirement:** the current owner permanently marks the credit as RETIRED for a stated purpose. A retired credit cannot be listed or transferred in this prototype.

## Workflow
```text
Simulated Carbon Project
        |
        v
Issuer Registration
        |
        v
Credit Issuance
        |
        v
Tokenized/On-chain Credit Record
        |
        v
Owner Wallet
        |
        v
Marketplace Listing
        |
        v
Buyer Purchase
        |
        v
Ownership Transfer
        |
        v
Credit Retirement
        |
        v
Immutable On-chain Retirement Event
```

## Actors
| Actor | Permission |
|---|---|
| Admin | Register/remove simulated issuers |
| Issuer | Issue simulated credits |
| Seller/Owner | List, cancel, transfer or retire eligible credits |
| Buyer | Purchase a listed credit and then manage it as owner |
| Verifier | Represented by the authorized issuer role in this student prototype |

## Technology Stack
- Solidity 0.8.24
- Ethereum/EVM concepts
- Hardhat
- Ethers.js
- OpenZeppelin AccessControl and ReentrancyGuard
- Remix IDE for visual simulation
- Optional React + Vite frontend
- Git/GitHub

Hardhat 3 is the current Hardhat generation; this repository uses a simple JavaScript Hardhat setup for beginner-friendly course work. OpenZeppelin provides reusable access-control and security modules.

## Architecture
```text
+-----------------------------+
| React / Optional Frontend   |
| Issuer | Marketplace |      |
| Portfolio | Retirement      |
+-------------+---------------+
              |
              | Ethers.js
              v
+-----------------------------+
| CarbonCreditTrading.sol     |
| - Role Management           |
| - Credit Registry           |
| - Marketplace               |
| - Transfer Logic            |
| - Retirement                |
| - Events / Audit Trail      |
+-------------+---------------+
              |
              v
      EVM / Local Test Chain
              |
              +---- Test Wallets
              +---- Test ETH
              +---- Simulated Metadata
```

## Data Model
`CarbonCredit` contains:
- `creditId`
- `projectName`
- `projectType`
- `country`
- `vintageYear`
- `tonnesCO2e`
- `issuer`
- `owner`
- `metadataHash`
- `status`
- `createdAt`

Status values:
- `ISSUED` = initial enum state; this prototype sets newly issued records directly to ACTIVE.
- `ACTIVE` = available for ownership management.
- `LISTED` = offered in the marketplace.
- `TRANSFERRED` = ownership has changed.
- `RETIRED` = permanently retired in this project's state machine.

## Main Smart Contract Functions
- `registerIssuer(address)`
- `removeIssuer(address)`
- `issueCarbonCredit(...)`
- `getCreditDetails(uint256)`
- `getListing(uint256)`
- `listCreditForSale(uint256,uint256)`
- `cancelListing(uint256)`
- `buyCredit(uint256)`
- `transferCredit(uint256,address)`
- `retireCredit(uint256,string)`
- `getOwnerCredits(address)`

## Events
- `IssuerRegistered`
- `CreditIssued`
- `CreditListed`
- `ListingCancelled`
- `CreditPurchased`
- `CreditTransferred`
- `CreditRetired`

Events are important because they provide an application-readable activity history without relying on mutable frontend state.

## Security Features
- Role-based access control.
- Address validation.
- Unique credit IDs.
- Positive tonne and price checks.
- Owner-only transfer/list/retire operations.
- Retired-credit restrictions.
- Listing closure before payment interaction.
- `ReentrancyGuard` on purchases.
- Exact payment matching.
- No direct transfer while a credit is listed.
- Checks-effects-interactions ordering in `buyCredit`.

## Folder Structure
```text
Blockchain-Carbon-Credit-Trading-Platform/
├── contracts/
│   └── CarbonCreditTrading.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── CarbonCreditTrading.test.js
├── frontend/
│   ├── src/
│   │   ├── abi/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── sample_metadata/
│   └── project_001.json
├── screenshots/
├── reports/
├── docs/
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```

## Installation
Prerequisites: Node.js and npm.

```bash
npm install
npm run compile
npm test
```

For local deployment:
```bash
npm run node
```
Open another terminal:
```bash
npm run deploy:local
```

## Remix Simulation
1. Open Remix IDE.
2. Create `CarbonCreditTrading.sol`.
3. Paste the contract.
4. Install/import OpenZeppelin dependencies as needed.
5. Compile with Solidity 0.8.24 or a compatible 0.8.x compiler.
6. Select Remix VM.
7. Deploy using Account 1 (Admin).
8. Account 1 calls `registerIssuer(Account 2)`.
9. Change to Account 2.
10. Call `issueCarbonCredit` with:
   - credit ID: `1`
   - project: `Solar Energy Project`
   - type: `Renewable Energy`
   - country: `India`
   - vintage: `2026`
   - tonnes: `10`
   - owner: Account 3
   - metadata hash: `QmSIMULATEDPROJECT001`
11. Change to Account 3 and list the credit.
12. Use Account 4 to purchase it with the exact test ETH price.
13. Read the credit and verify owner changed to Account 4.
14. Account 4 retires it.
15. Attempt transfer/list again and capture the rejected transactions.

## Hardhat Testing
```bash
npm test
```

The test suite covers:
- issuer registration
- unauthorized issuer registration
- valid issuance
- unauthorized issuance
- zero-tonne rejection
- owner listing
- non-owner listing rejection
- purchase
- seller payment
- ownership update
- listing closure
- active transfer
- retirement
- non-owner retirement rejection
- retired transfer rejection
- retired listing rejection
- double purchase prevention
- event emission
- duplicate listing prevention
- exact payment validation

## Sample Simulation
Actors:
- Account 1 = Admin
- Account 2 = Issuer
- Account 3 = Seller/initial owner
- Account 4 = Buyer

Expected state:
```text
Issue:     Account 3 owns Credit #1
List:      Credit #1 = LISTED
Purchase:  Account 4 owns Credit #1
Retire:    Credit #1 = RETIRED
Transfer:  REVERT
Relist:    REVERT
```

## Screenshot Checklist
Suggested filenames:
1. `01-project-folder.png`
2. `02-contract-code.png`
3. `03-successful-compilation.png`
4. `04-contract-deployed.png`
5. `05-issuer-registered.png`
6. `06-credit-issued.png`
7. `07-credit-details.png`
8. `08-credit-listed.png`
9. `09-purchase-transaction.png`
10. `10-new-owner.png`
11. `11-credit-retired.png`
12. `12-retired-state.png`
13. `13-failed-transfer.png`
14. `14-failed-listing.png`
15. `15-event-log.png`
16. `16-hardhat-tests.png`
17. `17-frontend-marketplace.png`
18. `18-frontend-portfolio.png`
19. `19-github-repository.png`
20. `20-readme-preview.png`

## Optional Frontend
The included React frontend demonstrates:
- wallet connection
- credit lookup
- status display
- owner display
- retirement interaction

Set:
```text
frontend/.env.local
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```
Then:
```bash
cd frontend
npm install
npm run dev
```

For a complete marketplace UI, add issuer forms, listing cards, purchase buttons, portfolio tables and a retirement certificate view.

## Off-chain Metadata and IPFS
The sample JSON represents metadata only. An advanced system could store large project documents on IPFS and put a content identifier/hash on-chain. The hash/reference helps connect the on-chain record to a particular metadata snapshot.

IPFS storage would still not make the underlying environmental claim automatically verified.

## Security and Market Integrity
### Double counting
A credit should not be usable twice. This prototype prevents re-trading after retirement, but real-world prevention also depends on registry and verification processes.

### Fake issuance
Only authorized issuer accounts can call issuance.

### Unauthorized issuers
`ISSUER_ROLE` restricts issuance.

### Double selling
An active listing is closed before purchase payment is made.

### Replay/state issues
The listing's active flag and credit status are checked before purchase.

### Reentrancy
`buyCredit` uses `ReentrancyGuard` and changes state before the external payment call.

### Retirement
Retirement is irreversible in the state machine: no function restores a retired credit.

### Oracle/off-chain verification problem
Blockchain can preserve the record of what was submitted, who owned it and what transactions happened. It cannot independently prove that a real project removed or avoided the claimed amount of CO2. Real carbon systems require measurement, reporting, verification, methodologies, registries and other trust mechanisms.

## Limitations
- Simulated credits only.
- Test wallets/test ETH only.
- No legal carbon-market status.
- No real registry integration.
- No oracle or MRV system.
- Metadata is not independently verified.
- Ownership-history storage is simplified.
- Marketplace pricing is a demonstration, not a real carbon-market price discovery mechanism.

## Future Improvements
- ERC-721/1155 token representation.
- Verified project/registry integration.
- MRV data ingestion.
- Oracle integration.
- IPFS/Arweave metadata.
- Role separation for issuer and verifier.
- Multisig administration.
- Advanced marketplace filters.
- Analytics and ESG reporting.
- Retirement certificates.
- Pagination and indexed subgraph queries.
- Formal security review/audit before production use.

## GitHub Strategy
Repository:
`Blockchain-Carbon-Credit-Trading-Platform`

Description:
`Blockchain-based carbon credit trading prototype using Solidity for simulated credit issuance, marketplace trading, transparent ownership transfer, and irreversible credit retirement.`

Suggested topics:
`blockchain solidity carbon-credit sustainability climate-tech ethereum web3 smart-contract ESG hardhat ethersjs dapp`

Meaningful commits:
```text
Initialize carbon credit blockchain project
Add issuer role management
Implement carbon credit issuance
Add credit marketplace listing
Implement credit purchase and transfer
Add irreversible carbon credit retirement
Add Solidity events and audit trail
Add Hardhat automated tests
Add Remix simulation proof
Complete README and documentation
```

## Git Commands
```bash
git init
git add .
git commit -m "Initialize carbon credit blockchain project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 12-Day Proof-of-Work Plan
| Day | Work | Proof |
|---|---|---|
| 1 | Architecture + environment | folder + compile |
| 2 | Issuer registration | role transaction |
| 3 | Credit issuance | CreditIssued event |
| 4 | Listing | CreditListed event |
| 5 | Purchase | CreditPurchased event |
| 6 | Ownership transfer | owner read |
| 7 | Retirement | CreditRetired event |
| 8 | Security tests | revert tests |
| 9 | Hardhat suite | test output |
| 10 | Remix simulation | screenshots |
| 11 | Frontend | UI screenshot |
| 12 | Documentation | README/report |

## Disclaimer
This is a student blockchain-course prototype. It uses simulated carbon-credit data and test wallets. It must not be represented as an official carbon registry, legally recognized carbon credit, verified environmental claim, or production carbon marketplace.
#   B l o c k c h a i n - P o w e r e d - C a r b o n - C r e d i t - T r a d i n g - P l a t f o r m  
 