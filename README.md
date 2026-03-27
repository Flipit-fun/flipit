# 🪙 Flip: Premium Solana Coin Flip dApp

<div align="center">
  <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
</div>

<br />

**Flip** is a high-fidelity, minimalist coin-flip application built on the Solana blockchain. Designed with a focus on premium aesthetics and absolute on-chain transparency, it offers a "Double or Nothing" experience that is both immersive and provably fair.

---

## 🖼️ Preview

![Landing Page Screenshot](/Users/yashsingal/.gemini/antigravity/brain/cbba805f-8d8b-4b36-8f18-eac66ce35bdf/landing_page_1773945535438.png)

---

## ✨ Key Features

- **🎯 Dynamic Bet Slider**: Smoothly adjust your bet between 0.1 and 2.0 SOL with real-time payout previews.
- **⚡ Real-Time Ticker**: Live pool balance updates every 5 seconds for a responsive experience.
- **📜 Global History**: Transparent access to the latest 50 games with direct links to **Solscan**.
- **🦅 3D Coin Animation**: Custom CSS-based 3D animations for heads/tails results.
- **⚖️ Provably Fair**: Backend architecture ready for **Switchboard VRF** integration.
- **🎨 Premium Design**: Curated typography using `Instrument Serif` and `Geist Mono`.

## 🛠️ Technical Architecture

- **Frontend**: Next.js 14 (App Router, Turbopack, Tailwind CSS)
- **Backend**: Next.js API Routes (Serverless)
- **Blockchain Interface**: @solana/web3.js
- **Persistence Layer**: Supabase (Real-time DB & Game State)
- **Security**: Server-side House Wallet isolation & IP-based cooldowns.

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/flip-solana.git
cd flip-solana
npm install
```

### 2. Environment Configuration
Create a `.env.local` file with your credentials:

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

### 3. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Pages & APIs)
├── components/           # Reusable UI Components
├── lib/                  # Backend Logic (Solana, Supabase, VRF)
├── public/               # Static Assets
└── supabase/             # Database Schemas & Migrations
```

## 🔒 Security & Fair Play
- **Private Keys**: House wallet keys are stored in environment variables and never exposed to the client.
- **Solvency Check**: The house prevents any game creation that would exceed its current payout capacity (50% of pool balance).
- **Unique Claiming**: Every deposit transaction is uniquely mapped to a game ID to prevent double-claiming.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements.

## 📜 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  Built with ❤️ on Solana
</div>
