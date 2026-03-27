# 🪙 Flip: Solana Coin Flip dApp

This project is a high-fidelity, minimalist coin-flip application built on the Solana blockchain.

## 🚀 Local Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 2. Clone & Install
```bash
git clone https://github.com/your-username/flip-solana.git
cd flip-solana
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and add your credentials:

```bash
# Solana
SOLANA_RPC_MAINNET=https://api.mainnet-beta.solana.com
FLIP_WALLET_PRIVATE_KEY=[Your_House_Key_Array]
NETWORK=mainnet

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

Built with ❤️ on Solana
