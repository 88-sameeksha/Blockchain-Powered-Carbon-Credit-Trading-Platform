# Architecture Notes

## Ownership Flow
Issuer -> issue -> owner wallet -> transfer/purchase -> new owner -> retirement.

## Trading Flow
Owner -> list -> buyer sends exact test ETH -> listing closes -> ownership changes -> seller receives test ETH.

## Retirement Flow
Current owner -> retire -> RETIRED + retirement event -> transfer/listing rejected.

## State Machine
ACTIVE -> LISTED -> TRANSFERRED
ACTIVE -> TRANSFERRED
ACTIVE -> RETIRED
TRANSFERRED -> LISTED
TRANSFERRED -> RETIRED
LISTED -> ACTIVE (cancel)
LISTED -> TRANSFERRED (purchase)
RETIRED -> terminal
