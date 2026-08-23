# Project Report — Blockchain-Powered Carbon Credit Trading Platform

## Abstract
This project presents an educational blockchain prototype for simulating the lifecycle of carbon-credit records: issuer authorization, credit issuance, ownership tracking, marketplace listing, purchase, transfer and irreversible retirement. Solidity smart-contract logic is used to create a transparent state machine and event trail. The implementation uses simulated project data, test wallets and test ETH only.

## 1. Introduction
Carbon markets require reliable records of project claims, ownership, transfers and retirement. Blockchain is useful for maintaining a shared, tamper-evident transaction history. The project demonstrates how smart contracts can encode rules that control who may issue credits, who may transfer them and when a credit becomes permanently retired.

## 2. Carbon Credits
A carbon credit is commonly associated with one tonne of CO2-equivalent of an emissions reduction or removal claim under a defined methodology. In this project, the quantity is simulated and is not a legal or independently verified credit.

## 3. Problem Statement
Traditional digital systems can maintain ownership databases, but participants may face fragmentation, reconciliation and auditability challenges. The prototype explores whether a smart-contract ledger can make ownership transitions and retirement rules more explicit and auditable.

## 4. Existing Carbon Markets
Real carbon markets depend on registries, methodologies, project monitoring, measurement/reporting/verification and other governance mechanisms. Blockchain can complement these processes but cannot replace environmental verification.

## 5. Challenges
- Double counting
- Unauthorized issuance
- Duplicate or conflicting ownership records
- Marketplace state management
- Retirement finality
- Off-chain evidence and metadata integrity
- Oracle and verification dependence

## 6. Proposed Blockchain Solution
The proposed system uses an access-controlled Solidity contract. Admins authorize issuers. Authorized issuers create simulated credit records. Owners can list active credits, buyers can purchase listed credits using test ETH, and current owners can retire credits. Events provide an auditable event stream.

## 7. Objectives
1. Demonstrate Solidity smart contracts.
2. Demonstrate role-based access control.
3. Model carbon-credit ownership.
4. Simulate marketplace settlement.
5. Demonstrate irreversible retirement.
6. Test security and invalid state transitions.
7. Produce GitHub proof-of-work.

## 8. Architecture
```text
Frontend / Remix
      |
   Ethers.js
      |
CarbonCreditTrading.sol
 |        |        |
Roles   Registry  Marketplace
                  |
              Retirement
      |
Local EVM / Remix VM
```

## 9. Actors
- Admin
- Authorized issuer/verifier
- Seller/current owner
- Buyer
- Optional frontend user

## 10. Credit Data Model
Fields include credit ID, project name, project type, country, vintage year, tonnes CO2e, issuer, owner, metadata reference, status and creation timestamp.

## 11. Issuance
The issuer must have `ISSUER_ROLE`. The contract validates uniqueness, positive quantity and non-zero owner address. The credit starts in the ACTIVE state and emits `CreditIssued`.

## 12. Trading
An owner lists a credit with a positive price. The status changes to LISTED. A buyer must send the exact price. The listing closes and ownership changes before the seller payment interaction. `CreditPurchased` records the settlement.

## 13. Transfer
The current owner may transfer an active, unlisted credit to another non-zero address. The status becomes TRANSFERRED and an event records the transition.

## 14. Retirement
The current owner can retire an unlisted credit with a purpose string. The status becomes RETIRED and a timestamp is included in the event. There is no function that reactivates a retired credit.

## 15. Smart Contract Design
The contract uses:
- `AccessControl` for admin/issuer roles.
- `ReentrancyGuard` for marketplace purchase.
- `mapping` for credit and listing storage.
- `struct` for structured records.
- `enum` for lifecycle states.
- `modifier` for authorization/existence checks.
- `require` for validation.
- `msg.sender` to identify callers.
- `payable` for simulated test-ETH settlement.
- events for audit history.

## 16. Security
Security checks include role restrictions, owner checks, non-zero addresses, unique IDs, positive prices, exact payment, listing-state checks, retired-state checks and reentrancy protection.

## 17. Market Integrity
The project demonstrates technical controls against duplicate sale and post-retirement trading. However, real market integrity depends on trusted verification, registry governance, methodologies, monitoring and external evidence.

## 18. Implementation
Primary implementation files:
- `contracts/CarbonCreditTrading.sol`
- `scripts/deploy.js`
- `test/CarbonCreditTrading.test.js`
- `frontend/src/App.jsx`
- `sample_metadata/project_001.json`

## 19. Testing
Automated tests cover valid and invalid role operations, issuance, listing, purchase, payment, ownership changes, retirement, blocked post-retirement actions, double purchase prevention, event emission and exact payment validation.

## 20. Virtual Simulation
The Remix VM scenario uses:
- Account 1: Admin
- Account 2: Issuer
- Account 3: Seller
- Account 4: Buyer

The simulated credit is a 10-tonne Solar Energy Project record with vintage year 2026.

## 21. Results
Expected successful lifecycle:
```text
Authorized issuer
      ↓
Credit #1 issued
      ↓
Account 3 owns credit
      ↓
Account 3 lists credit
      ↓
Account 4 purchases
      ↓
Account 4 owns credit
      ↓
Account 4 retires
      ↓
Transfer/list attempts revert
```

## 22. Applications
Potential prototype applications include sustainability dashboards, ESG evidence systems, carbon marketplace interfaces, corporate net-zero tracking, renewable-project record systems and climate-tech experimentation.

## 23. Advantages
- Transparent state transitions
- Auditable events
- Programmable permissions
- Explicit retirement state
- Demonstrable Web3 architecture
- Local/test simulation without real cryptocurrency

## 24. Limitations
The system is not connected to a real registry, does not perform MRV, does not verify environmental claims, and uses test wallets/test ETH. It should not be presented as a production carbon market.

## 25. Future Scope
Future work could introduce ERC-721/1155 token standards, IPFS metadata, verifier separation, oracle feeds, registry integrations, analytics, retirement certificates, indexing and security auditing.

## 26. Conclusion
The project demonstrates how blockchain and Solidity can model a transparent digital lifecycle for simulated carbon-credit records. Its strongest educational value is the combination of access control, state management, marketplace settlement, event logging, testing and explicit real-world limitations.
