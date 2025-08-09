const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar JSON

  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    membershipTier: MembershipTier!
    isVerified: Boolean!
    createdAt: Date!
    updatedAt: Date!
    certificates: [Certificate!]
    transactions: [Transaction!]
  }

  # Product type
  type Product {
    id: ID!
    name: String!
    brand: String!
    category: String!
    description: String
    serialNumber: String
    manufacturingDate: Date
    verificationStatus: VerificationStatus!
    verificationDetails: VerificationDetails
    images: [String!]
    owner: User
    nft: NFT
    certificates: [Certificate!]
    createdAt: Date!
    updatedAt: Date!
  }

  # Certificate type
  type Certificate {
    id: ID!
    type: CertificateType!
    productId: String!
    product: Product
    userId: String!
    user: User
    issuer: String!
    issueDate: Date!
    expiryDate: Date
    metadata: JSON
    digitalSignature: String!
    blockchainTxHash: String
    ipfsHash: String
    qrCode: String
    status: CertificateStatus!
    verificationCount: Int!
    lastVerified: Date
    createdAt: Date!
    updatedAt: Date!
  }

  # NFT type
  type NFT {
    id: ID!
    tokenId: String!
    contractAddress: String!
    productId: String!
    product: Product
    owner: String!
    metadata: NFTMetadata!
    mintedAt: Date!
    transactionHash: String!
    marketplaceListing: MarketplaceListing
  }

  # Transaction type
  type Transaction {
    id: ID!
    type: TransactionType!
    from: User!
    to: User
    product: Product
    certificate: Certificate
    amount: Float
    currency: String
    status: TransactionStatus!
    blockchainTxHash: String
    createdAt: Date!
  }

  # Marketplace listing
  type MarketplaceListing {
    id: ID!
    nft: NFT!
    seller: User!
    price: Float!
    currency: String!
    status: ListingStatus!
    createdAt: Date!
    updatedAt: Date!
  }

  # Verification details
  type VerificationDetails {
    verifiedBy: String
    verifiedAt: Date
    authenticityScore: Float
    aiAnalysis: AIAnalysis
    blockchainVerified: Boolean
  }

  # AI Analysis result
  type AIAnalysis {
    confidence: Float!
    features: [String!]
    anomalies: [String!]
    recommendation: String
  }

  # NFT Metadata
  type NFTMetadata {
    name: String!
    description: String!
    image: String!
    attributes: [NFTAttribute!]
  }

  # NFT Attribute
  type NFTAttribute {
    trait_type: String!
    value: String!
  }

  # Analytics data
  type Analytics {
    totalUsers: Int!
    totalProducts: Int!
    totalCertificates: Int!
    totalNFTs: Int!
    verificationStats: VerificationStats!
    revenueStats: RevenueStats!
  }

  type VerificationStats {
    total: Int!
    authentic: Int!
    counterfeit: Int!
    pending: Int!
    averageScore: Float!
  }

  type RevenueStats {
    total: Float!
    thisMonth: Float!
    lastMonth: Float!
    growth: Float!
  }

  # Enums
  enum MembershipTier {
    BASIC
    PREMIUM
    ENTERPRISE
  }

  enum VerificationStatus {
    PENDING
    VERIFIED
    FAILED
    EXPIRED
  }

  enum CertificateType {
    AUTHENTICITY
    OWNERSHIP
    WARRANTY
    APPRAISAL
  }

  enum CertificateStatus {
    ACTIVE
    EXPIRED
    REVOKED
    PENDING
  }

  enum TransactionType {
    PURCHASE
    TRANSFER
    MINT
    BURN
    LIST
    DELIST
  }

  enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
    CANCELLED
  }

  enum ListingStatus {
    ACTIVE
    SOLD
    CANCELLED
    EXPIRED
  }

  # Input types
  input CreateProductInput {
    name: String!
    brand: String!
    category: String!
    description: String
    serialNumber: String
    manufacturingDate: Date
    images: [String!]
  }

  input UpdateProductInput {
    name: String
    brand: String
    category: String
    description: String
    images: [String!]
  }

  input CreateCertificateInput {
    type: CertificateType!
    productId: String!
    issuer: String!
    expiryDate: Date
    metadata: JSON
  }

  input VerifyProductInput {
    productId: String!
    image: String
    qrCode: String
  }

  input CreateNFTInput {
    productId: String!
    metadata: NFTMetadataInput!
  }

  input NFTMetadataInput {
    name: String!
    description: String!
    image: String!
    attributes: [NFTAttributeInput!]
  }

  input NFTAttributeInput {
    trait_type: String!
    value: String!
  }

  input ListNFTInput {
    nftId: String!
    price: Float!
    currency: String!
  }

  # Queries
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!

    # Product queries
    product(id: ID!): Product
    products(
      category: String
      brand: String
      verificationStatus: VerificationStatus
      limit: Int
      offset: Int
    ): [Product!]!
    searchProducts(query: String!): [Product!]!

    # Certificate queries
    certificate(id: ID!): Certificate
    certificates(
      userId: String
      productId: String
      type: CertificateType
      status: CertificateStatus
      limit: Int
      offset: Int
    ): [Certificate!]!

    # NFT queries
    nft(id: ID!): NFT
    nfts(
      owner: String
      limit: Int
      offset: Int
    ): [NFT!]!
    marketplace(
      status: ListingStatus
      minPrice: Float
      maxPrice: Float
      limit: Int
      offset: Int
    ): [MarketplaceListing!]!

    # Transaction queries
    transaction(id: ID!): Transaction
    transactions(
      userId: String
      type: TransactionType
      status: TransactionStatus
      limit: Int
      offset: Int
    ): [Transaction!]!

    # Analytics queries
    analytics: Analytics!
    userAnalytics(userId: ID!): JSON
    productAnalytics(productId: ID!): JSON
  }

  # Mutations
  type Mutation {
    # Product mutations
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    verifyProduct(input: VerifyProductInput!): VerificationResult!

    # Certificate mutations
    createCertificate(input: CreateCertificateInput!): Certificate!
    revokeCertificate(id: ID!): Certificate!
    transferCertificate(id: ID!, toUserId: ID!): Certificate!

    # NFT mutations
    mintNFT(input: CreateNFTInput!): NFT!
    transferNFT(nftId: ID!, toAddress: String!): NFT!
    burnNFT(nftId: ID!): Boolean!
    listNFT(input: ListNFTInput!): MarketplaceListing!
    delistNFT(listingId: ID!): MarketplaceListing!
    purchaseNFT(listingId: ID!): Transaction!

    # User mutations
    updateProfile(name: String, email: String): User!
    upgradeMembership(tier: MembershipTier!): User!
  }

  # Subscriptions
  type Subscription {
    # Product subscriptions
    productVerified(productId: ID!): Product!
    productUpdated(productId: ID!): Product!

    # Certificate subscriptions
    certificateIssued(userId: ID!): Certificate!
    certificateRevoked: Certificate!

    # NFT subscriptions
    nftMinted: NFT!
    nftTransferred(userId: ID!): NFT!
    marketplaceUpdate: MarketplaceListing!

    # Transaction subscriptions
    transactionCreated(userId: ID!): Transaction!
    transactionStatusChanged(transactionId: ID!): Transaction!

    # Analytics subscriptions
    analyticsUpdate: Analytics!
  }

  # Response types
  type VerificationResult {
    success: Boolean!
    product: Product
    score: Float
    details: VerificationDetails
    message: String
  }
`;

module.exports = typeDefs;