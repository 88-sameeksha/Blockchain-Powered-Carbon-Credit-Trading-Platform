// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonCreditTrading
 * @notice Educational carbon-credit trading prototype.
 * @dev Uses simulated credits and test ETH only. It does not create
 *      legally recognized or independently verified carbon credits.
 */
contract CarbonCreditTrading is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum Status {
        ISSUED,
        ACTIVE,
        LISTED,
        TRANSFERRED,
        RETIRED
    }

    struct CarbonCredit {
        uint256 creditId;
        string projectName;
        string projectType;
        string country;
        uint16 vintageYear;
        uint256 tonnesCO2e;
        address issuer;
        address owner;
        string metadataHash;
        Status status;
        uint256 createdAt;
    }

    struct Listing {
        uint256 creditId;
        address seller;
        uint256 priceWei;
        bool active;
    }

    mapping(uint256 => CarbonCredit) private credits;
    mapping(uint256 => Listing) private listings;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) private ownerCreditIds;

    event IssuerRegistered(address indexed issuer);
    event CreditIssued(
        uint256 indexed creditId,
        address indexed issuer,
        address indexed owner,
        uint256 tonnesCO2e
    );
    event CreditListed(uint256 indexed creditId, address indexed seller, uint256 priceWei);
    event ListingCancelled(uint256 indexed creditId, address indexed seller);
    event CreditPurchased(
        uint256 indexed creditId,
        address indexed seller,
        address indexed buyer,
        uint256 priceWei
    );
    event CreditTransferred(
        uint256 indexed creditId,
        address indexed from,
        address indexed to
    );
    event CreditRetired(
        uint256 indexed creditId,
        address indexed owner,
        uint256 retiredAt,
        string purpose
    );

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin");
        _;
    }

    modifier onlyIssuer() {
        require(hasRole(ISSUER_ROLE, msg.sender), "Only authorized issuer");
        _;
    }

    modifier creditExists(uint256 creditId) {
        require(credits[creditId].createdAt != 0, "Credit does not exist");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerIssuer(address issuer) external onlyAdmin {
        require(issuer != address(0), "Invalid issuer");
        authorizedIssuers[issuer] = true;
        _grantRole(ISSUER_ROLE, issuer);
        emit IssuerRegistered(issuer);
    }

    function removeIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = false;
        _revokeRole(ISSUER_ROLE, issuer);
    }

    function issueCarbonCredit(
        uint256 creditId,
        string calldata projectName,
        string calldata projectType,
        string calldata country,
        uint16 vintageYear,
        uint256 tonnesCO2e,
        address owner,
        string calldata metadataHash
    ) external onlyIssuer {
        require(creditId != 0, "Invalid credit ID");
        require(credits[creditId].createdAt == 0, "Credit ID already exists");
        require(bytes(projectName).length > 0, "Project name required");
        require(tonnesCO2e > 0, "Tonnes must be greater than zero");
        require(owner != address(0), "Invalid owner");

        credits[creditId] = CarbonCredit({
            creditId: creditId,
            projectName: projectName,
            projectType: projectType,
            country: country,
            vintageYear: vintageYear,
            tonnesCO2e: tonnesCO2e,
            issuer: msg.sender,
            owner: owner,
            metadataHash: metadataHash,
            status: Status.ACTIVE,
            createdAt: block.timestamp
        });

        ownerCreditIds[owner].push(creditId);
        emit CreditIssued(creditId, msg.sender, owner, tonnesCO2e);
    }

    function getCreditDetails(uint256 creditId)
        external
        view
        creditExists(creditId)
        returns (CarbonCredit memory)
    {
        return credits[creditId];
    }

    function getListing(uint256 creditId)
        external
        view
        creditExists(creditId)
        returns (Listing memory)
    {
        return listings[creditId];
    }

    function listCreditForSale(uint256 creditId, uint256 priceWei)
        external
        creditExists(creditId)
    {
        CarbonCredit storage credit = credits[creditId];
        require(msg.sender == credit.owner, "Only current owner");
        require(credit.status != Status.RETIRED, "Retired credit");
        require(credit.status != Status.LISTED, "Already listed");
        require(priceWei > 0, "Price must be greater than zero");

        listings[creditId] = Listing({
            creditId: creditId,
            seller: msg.sender,
            priceWei: priceWei,
            active: true
        });
        credit.status = Status.LISTED;

        emit CreditListed(creditId, msg.sender, priceWei);
    }

    function cancelListing(uint256 creditId)
        external
        creditExists(creditId)
    {
        CarbonCredit storage credit = credits[creditId];
        Listing storage listing = listings[creditId];

        require(msg.sender == listing.seller, "Only seller");
        require(listing.active, "Listing inactive");

        listing.active = false;
        credit.status = Status.ACTIVE;

        emit ListingCancelled(creditId, msg.sender);
    }

    function buyCredit(uint256 creditId)
        external
        payable
        nonReentrant
        creditExists(creditId)
    {
        CarbonCredit storage credit = credits[creditId];
        Listing storage listing = listings[creditId];

        require(listing.active, "Listing inactive");
        require(credit.status == Status.LISTED, "Credit not listed");
        require(msg.sender != listing.seller, "Seller cannot buy own listing");
        require(msg.value == listing.priceWei, "Incorrect payment");

        address seller = listing.seller;
        uint256 price = listing.priceWei;

        // Effects before interaction: closes the listing and changes ownership.
        listing.active = false;
        credit.owner = msg.sender;
        credit.status = Status.TRANSFERRED;
        ownerCreditIds[msg.sender].push(creditId);

        (bool sent, ) = payable(seller).call{value: price}("");
        require(sent, "Payment failed");

        emit CreditPurchased(creditId, seller, msg.sender, price);
    }

    function transferCredit(uint256 creditId, address to)
        external
        creditExists(creditId)
    {
        CarbonCredit storage credit = credits[creditId];

        require(msg.sender == credit.owner, "Only current owner");
        require(to != address(0), "Invalid recipient");
        require(credit.status != Status.RETIRED, "Retired credit");
        require(credit.status != Status.LISTED, "Cancel listing first");
        require(to != credit.owner, "Already owner");

        address from = credit.owner;
        credit.owner = to;
        credit.status = Status.TRANSFERRED;
        ownerCreditIds[to].push(creditId);

        emit CreditTransferred(creditId, from, to);
    }

    function retireCredit(uint256 creditId, string calldata purpose)
        external
        creditExists(creditId)
    {
        CarbonCredit storage credit = credits[creditId];

        require(msg.sender == credit.owner, "Only current owner");
        require(credit.status != Status.RETIRED, "Already retired");
        require(credit.status != Status.LISTED, "Cancel listing first");

        credit.status = Status.RETIRED;
        emit CreditRetired(creditId, msg.sender, block.timestamp, purpose);
    }

    function getOwnerCredits(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return ownerCreditIds[owner];
    }

    function getStatus(uint256 creditId)
        external
        view
        creditExists(creditId)
        returns (Status)
    {
        return credits[creditId].status;
    }

    function withdrawStuckFunds(address payable to, uint256 amount)
        external
        onlyAdmin
    {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdrawal failed");
    }

    receive() external payable {}
}
