# ChatMint AI

**Own your ideas, in chat and on chain**

ChatMint AI is an Intelligent IP Studio that combines AI-powered idea generation with blockchain-based intellectual property registration. Chat with Gemini AI to spark creative ideas, then register your visual creations as IP assets on Story Protocol.

## Features

-  **MetaMask Login**: Mandatory wallet connection required before accessing any features
-  **Identity Selection Screen**: Futuristic AFTERLIFE-style dashboard selection after login
-  **AI Chat Studio**: Generate creative ideas using Google Gemini AI
-  **Visual IP Registration**: Upload images and register them as intellectual property on Story Protocol 
-  **Shared Ownership Declaration**: Allocate ownership percentages to co-owners with legally binding declarations
-  **IPFS Storage**: Images and metadata stored on Pinata IPFS
-  **Blockchain Integration**: Register IP assets on Story Protocol's Aeneid testnet
-  **Visual Gallery**: View all your registered IP assets in one place with delete functionality

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: Google Gemini 2.5 Flash
- **Blockchain**: Story Protocol (Aeneid testnet)
- **Storage**: Pinata IPFS
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension ([Install here](https://metamask.io/download/))
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Pinata account and JWT token ([Get one here](https://app.pinata.cloud/))
- Story Protocol wallet with private key (for backend operations)
- Story Protocol RPC URL (Aeneid testnet)

## Setup Instructions

### 1. Clone and Install

```bash
cd chatmint-ai
npm install
```

### 2. Generate Private Key

First, generate a private key for Story Protocol:

```bash
npm run generate-key
```

This will generate a secure 64-character hex private key. Copy the output (without the `0x` prefix) for use in your `.env.local` file.

**Alternative methods:**
- Use MetaMask: Export private key from an account (Settings → Security & Privacy → Show Private Key)
- Use an existing wallet's private key (make sure it's for testnet use only)

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Pinata JWT Token (format: Bearer your_jwt_token)
PINATA_JWT=Bearer your_pinata_jwt_token_here

# Story Protocol Configuration
# Private key WITHOUT 0x prefix (or WITH 0x - both formats work)
STORY_PRIVATE_KEY=your_64_character_hex_string

# Story Protocol RPC URL (Aeneid testnet)
STORY_RPC_URL=https://rpc.aeneid.storyprotocol.xyz

# Story Protocol SPG NFT Contract Address (Aeneid testnet)
SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
```

**Important Notes:**
- The private key can be provided with or without the `0x` prefix
- The private key must be exactly 64 hexadecimal characters (32 bytes)
- Never commit your `.env.local` file to version control
- Make sure the wallet has testnet tokens for transactions

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Connect MetaMask Wallet

1. When you first visit the site, you'll see a login screen with:
   - **ChatMint** title
   - **Tagline**: "Decentralized IP & AI protocol for the next web."
   - Minimal 3D rotating cube animation in the background
   - **Connect Wallet** button with green border and yellow-green text
2. Click the "Connect Wallet →" button
3. If MetaMask is not installed, you'll be prompted to install it
4. Approve the connection request in MetaMask
5. After connecting, you'll see the **Identity Selection Screen** with three dashboard options:
   - **Idea Chat Studio**: AI-powered idea generation
   - **Register Visual IP**: Upload and register visual IP assets
   - **Visual IP Gallery**: View all your registered IP assets
6. Your wallet address, network, and protocol state are displayed in the header

**Note:** The backend still uses the server-side private key for Story Protocol transactions, but your connected wallet is used for user identification and future features.

## Project Structure

```
chatmint-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/              # Gemini AI chat endpoint
│   │   │   └── visual-register/   # IP registration endpoint
│   │   ├── gallery/               # Visual IP Gallery page
│   │   ├── register/              # Register Visual IP page
│   │   ├── studio/                # Idea Chat Studio page
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page (identity selection)
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── ChatBox.tsx            # AI chat interface
│   │   ├── VisualForm.tsx         # IP registration form with co-owner support
│   │   ├── VisualGallery.tsx      # IP assets gallery
│   │   ├── VisualModal.tsx        # IP asset details modal
│   │   └── WalletConnect.tsx      # MetaMask wallet connection
│   ├── contexts/
│   │   └── WalletContext.tsx      # Wallet state management
│   ├── lib/
│   │   ├── storyClient.ts         # Story Protocol client
│   │   └── walletUtils.ts         # Wallet address validation utilities
│   └── types/
│       └── visualAsset.ts          # TypeScript type definitions
├── package.json
└── README.md
```

### Chat Studio

1. After connecting your wallet, click on **"Idea Chat Studio"** from the identity selection screen
2. You'll be taken to the `/studio` page
3. Type your idea or question in the chat box
4. Get AI-generated creative ideas from Gemini
5. Use the "Back to Home" button to return to the identity selection screen

### Register Visual IP

1. After connecting your wallet, click on **"Register Visual IP"** from the identity selection screen
2. You'll be taken to the `/register` page
3. Upload an image (max 10MB)
4. Fill in the metadata:
   - Image Name (required)
   - Creator Name (required)
   - Description (required)
   - Traits (comma-separated, optional)
5. **Shared Ownership Declaration (Optional)**:
   - Click the **"Co-Owner"** button to expand the ownership section
   - Read the legal declaration text
   - Add co-owners by entering:
     - **Ownership Share Percentage** (minimum 0.01%, maximum based on remaining ownership)
     - **Recipient Wallet Address** (checksum-validated)
   - Click **"Save Co-Owner"** when both fields are filled
   - Add multiple co-owners using the **"+ Add Co-Owner"** button
   - Total ownership cannot exceed 100%
   - Acknowledge the declaration checkbox before submission
   - **Warning**: Ownership allocations are final and cannot be changed after registration
6. Click "Register on MintChat"
7. Your image will be:
   - Uploaded to Pinata IPFS
   - Metadata created and stored on IPFS (including ownership data if specified)
   - Registered as an IP asset on Story Protocol
   - Primary owner receives remaining ownership percentage (100% - total co-owner allocation)
   - Added to your gallery
8. Use the "Back to Home" button to return to the identity selection screen

**Important Notes on Shared Ownership:**
- Ownership percentages are stored in basis points (10000 = 100%)
- All ownership allocations are immutable once registered
- Co-owner wallet addresses must be valid and cannot be duplicates
- Primary owner wallet cannot be the same as any co-owner wallet
- Incorrect wallet addresses result in permanent allocation loss

### View Registered IPs

1. After connecting your wallet, click on **"Visual IP Gallery"** from the identity selection screen
2. You'll be taken to the `/gallery` page
3. All registered IPs are displayed in a grid layout
4. Click on any IP to view detailed information in a modal
5. Delete IPs by hovering over them and clicking the delete button (✕)
6. View transaction on Story Explorer from the modal
7. Use the "Back to Home" button to return to the identity selection screen

## API Endpoints

### POST `/api/chat`

Chat with Gemini AI.

**Request:**
```json
{
  "message": "Generate a creative idea for a logo"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "AI generated response..."
}
```

### POST `/api/visual-register`

Register a visual IP asset.

**Request:** FormData with:
- `file`: Image file
- `name`: Image name
- `creator`: Creator name
- `share`: Primary owner's share percentage (automatically calculated as 100% - total co-owner allocation)
- `description`: Description
- `traits`: Comma-separated traits
- `mintTokens`: "true" or "false"
- `primaryOwnerWallet`: Primary owner's wallet address
- `ownerships`: (Optional) JSON stringified array of ownership objects:
  ```json
  [
    {
      "walletAddress": "0x...",
      "ownershipPercentage": 2500
    }
  ]
  ```
  Where `ownershipPercentage` is in basis points (2500 = 25%)

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://gateway.pinata.cloud/ipfs/...",
  "metadataUrl": "https://gateway.pinata.cloud/ipfs/...",
  "ipId": "0x...",
  "txHash": "0x...",
  "ownership": {
    "primaryOwnerWallet": "0x...",
    "isFrozen": true,
    "ownerships": [
      {
        "walletAddress": "0x...",
        "ownershipPercentage": 2500
      }
    ]
  }
}
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PINATA_JWT` | Pinata JWT token (with "Bearer " prefix) | Yes |
| `STORY_PRIVATE_KEY` | Wallet private key (without 0x) | Yes |
| `STORY_RPC_URL` | Story Protocol RPC endpoint | Yes |
| `SPG_NFT_CONTRACT` | SPG NFT contract address | Yes |

## Notes

- This project uses Story Protocol's **Aeneid testnet**
- Images are stored on Pinata IPFS
- All IP assets are registered on-chain
- Gallery data is stored in browser localStorage
- Make sure your wallet has sufficient testnet tokens for transactions
- **Shared Ownership**: Ownership allocations are immutable once registered. Always verify wallet addresses before submission.
- Ownership percentages are stored in basis points format (compatible with smart contracts)
- Primary owner automatically receives the remaining ownership percentage after co-owner allocations

## License

This project is private and proprietary.

## Support

For issues or questions, please check:
- [Story Protocol Documentation](https://docs.story.foundation/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Google Gemini Documentation](https://ai.google.dev/docs)
