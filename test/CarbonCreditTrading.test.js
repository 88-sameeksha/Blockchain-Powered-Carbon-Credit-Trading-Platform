import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("CarbonCreditTrading", function () {
  let contract;
  let admin, issuer, seller, buyer, other;

  const creditId = 1n;
  const tonnes = 10n;
  const price = ethers.parseEther("0.5");

  beforeEach(async function () {
    [admin, issuer, seller, buyer, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CarbonCreditTrading");
    contract = await Factory.deploy();
    await contract.waitForDeployment();

    await contract.connect(admin).registerIssuer(issuer.address);
  });

  async function issue() {
    await contract.connect(issuer).issueCarbonCredit(
      creditId,
      "Solar Energy Project",
      "Renewable Energy",
      "India",
      2026,
      tonnes,
      seller.address,
      "QmSIMULATEDPROJECT001"
    );
  }

  it("admin registers issuer", async function () {
    expect(await contract.authorizedIssuers(issuer.address)).to.equal(true);
  });

  it("unauthorized user cannot register issuer", async function () {
    await expect(
      contract.connect(other).registerIssuer(other.address)
    ).to.be.revertedWith("Only admin");
  });

  it("authorized issuer creates a credit", async function () {
    await issue();
    const c = await contract.getCreditDetails(creditId);
    expect(c.projectName).to.equal("Solar Energy Project");
    expect(c.owner).to.equal(seller.address);
    expect(c.tonnesCO2e).to.equal(tonnes);
  });

  it("unauthorized address cannot issue", async function () {
    await expect(
      contract.connect(other).issueCarbonCredit(
        creditId, "Project", "Type", "India", 2026, 1, seller.address, "hash"
      )
    ).to.be.revertedWith("Only authorized issuer");
  });

  it("rejects zero-tonne credit", async function () {
    await expect(
      contract.connect(issuer).issueCarbonCredit(
        creditId, "Project", "Type", "India", 2026, 0, seller.address, "hash"
      )
    ).to.be.revertedWith("Tonnes must be greater than zero");
  });

  it("owner can list and non-owner cannot", async function () {
    await issue();

    await expect(
      contract.connect(other).listCreditForSale(creditId, price)
    ).to.be.revertedWith("Only current owner");

    await expect(contract.connect(seller).listCreditForSale(creditId, price))
      .to.emit(contract, "CreditListed")
      .withArgs(creditId, seller.address, price);
  });

  it("buyer purchases credit, seller receives payment and listing closes", async function () {
    await issue();
    await contract.connect(seller).listCreditForSale(creditId, price);

    const sellerBefore = await ethers.provider.getBalance(seller.address);

    await expect(
      contract.connect(buyer).buyCredit(creditId, { value: price })
    ).to.emit(contract, "CreditPurchased")
      .withArgs(creditId, seller.address, buyer.address, price);

    const sellerAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerAfter - sellerBefore).to.equal(price);

    const c = await contract.getCreditDetails(creditId);
    const listing = await contract.getListing(creditId);

    expect(c.owner).to.equal(buyer.address);
    expect(c.status).to.equal(3n); // TRANSFERRED
    expect(listing.active).to.equal(false);
  });

  it("owner can transfer an active credit", async function () {
    await issue();

    await expect(
      contract.connect(seller).transferCredit(creditId, buyer.address)
    ).to.emit(contract, "CreditTransferred")
      .withArgs(creditId, seller.address, buyer.address);

    const c = await contract.getCreditDetails(creditId);
    expect(c.owner).to.equal(buyer.address);
  });

  it("owner can retire a credit", async function () {
    await issue();

    await expect(
      contract.connect(seller).retireCredit(creditId, "Corporate net-zero simulation")
    ).to.emit(contract, "CreditRetired");

    expect(await contract.getStatus(creditId)).to.equal(4n); // RETIRED
  });

  it("non-owner cannot retire", async function () {
    await issue();
    await expect(
      contract.connect(other).retireCredit(creditId, "Invalid attempt")
    ).to.be.revertedWith("Only current owner");
  });

  it("retired credit cannot transfer", async function () {
    await issue();
    await contract.connect(seller).retireCredit(creditId, "Retirement test");

    await expect(
      contract.connect(seller).transferCredit(creditId, buyer.address)
    ).to.be.revertedWith("Retired credit");
  });

  it("retired credit cannot be listed", async function () {
    await issue();
    await contract.connect(seller).retireCredit(creditId, "Retirement test");

    await expect(
      contract.connect(seller).listCreditForSale(creditId, price)
    ).to.be.revertedWith("Retired credit");
  });

  it("prevents double purchase", async function () {
    await issue();
    await contract.connect(seller).listCreditForSale(creditId, price);
    await contract.connect(buyer).buyCredit(creditId, { value: price });

    await expect(
      contract.connect(other).buyCredit(creditId, { value: price })
    ).to.be.revertedWith("Listing inactive");
  });

  it("emits the main audit events", async function () {
    await expect(
      contract.connect(issuer).issueCarbonCredit(
        creditId, "Solar Energy Project", "Renewable Energy",
        "India", 2026, tonnes, seller.address, "QmSIMULATEDPROJECT001"
      )
    ).to.emit(contract, "CreditIssued");

    await expect(
      contract.connect(seller).listCreditForSale(creditId, price)
    ).to.emit(contract, "CreditListed");

    await expect(
      contract.connect(seller).cancelListing(creditId)
    ).to.emit(contract, "ListingCancelled");
  });

  it("prevents listing an already listed credit", async function () {
    await issue();
    await contract.connect(seller).listCreditForSale(creditId, price);

    await expect(
      contract.connect(seller).listCreditForSale(creditId, price)
    ).to.be.revertedWith("Already listed");
  });

  it("requires exact payment", async function () {
    await issue();
    await contract.connect(seller).listCreditForSale(creditId, price);

    await expect(
      contract.connect(buyer).buyCredit(creditId, { value: price - 1n })
    ).to.be.revertedWith("Incorrect payment");
  });
});
