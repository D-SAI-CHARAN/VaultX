
# 🔐 VaultX — Zero-Knowledge Secure Document Vault

VaultX is a high-security document vault designed under a hostile threat model.
We assume servers can be breached, devices can be stolen, and users can be coerced.

VaultX follows a strict **zero-knowledge architecture** — the backend never sees
plaintext data, encryption keys, or meaningful file structure.

---

## 🧠 Security Philosophy

VaultX is built on **defense in depth**, not trust in any single layer.

Instead of relying only on encryption, VaultX increases the attacker’s cost across:
- Cryptographic security
- Structural protection (fragmentation)
- Real-world threat handling (duress access)

---

## 🔒 Security Architecture

### Zero-Knowledge by Design

- All encryption happens **on the user’s device**
- The backend stores only encrypted, opaque binary blobs
- Servers cannot decrypt or interpret stored data
- Even developers cannot access user files

---

### Authentication & Access Control

VaultX separates **identity authentication** from **data decryption**.

- Email-based user login
- PIN-based vault unlock
- Biometric authentication for convenience
- Auto-lock when the app is backgrounded

Authentication grants access — **only cryptographic keys unlock data**.

---

### Cryptography & Key Handling

- Encryption: AES-256-CBC  
- Integrity: HMAC-SHA256 (Encrypt-then-MAC)  
- Key Derivation: PBKDF2 (derived from user PIN)

#### Ephemeral Master Key

- Derived only at unlock time
- Never written to disk
- Exists only in RAM while the vault is unlocked
- Destroyed immediately when the app locks or backgrounds

This eliminates long-lived key exposure.

---

### Structural Fragmentation (Client-Side Sharding)

VaultX protects not only data confidentiality, but also **data structure**.

After encryption:
- Each file is split into **multiple encrypted shards**
- Each shard is stored using a random identifier
- No shard is meaningful on its own
- Reconstruction requires the encrypted shard map

This significantly increases attacker effort even with storage access.

Encryption hides data.  
Fragmentation hides relationships.

---


## ⚡ Core Features

### 🛡️ Duress Mode (Decoy Vault)

VaultX accounts for **physical coercion scenarios**.

Users configure two valid PINs:
1. **Primary PIN** → unlocks the real vault  
2. **Duress PIN** → unlocks a plausible decoy vault  

The decoy vault:
- Appears fully functional
- Contains non-sensitive placeholder files
- Gives no indication a real vault exists

This allows safe compliance under pressure.

---

### 🔐 Session-Bound Vault (WOW Feature)

VaultX is **session-bound by design**.

- If the app is backgrounded or minimized:
  - Vault instantly locks
  - Cryptographic keys are wiped from memory
- Re-authentication is required to regain access

This protects against memory scraping and shoulder-surfing attacks.

---

## 🛠️ Tech Stack

- Frontend: React Native (Expo), TypeScript  
- State Management: Zustand  
- Backend: Supabase (Auth, Storage, Database)  
- Architecture: Serverless, client-side heavy, zero-knowledge  

The backend is intentionally treated as **untrusted infrastructure**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- Expo CLI
- Supabase Project

---

### 1. Supabase Setup

1. Create a new Supabase project  
2. Create a storage bucket named `vault-shards`  
3. Enable binary storage (PDF / image / video)  
4. Copy your project credentials  

Update `frontend/src/services/auth/supabaseClient.ts`:

SUPABASE_URL=your_supabase_url  
SUPABASE_ANON_KEY=your_supabase_anon_key

---

### 2. Frontend Setup

cd frontend  
npm install  
npx expo start  

Run on:
- Android Emulator (press `a`)
- iOS Simulator (press `i`)
- Physical device via Expo Go

---

## ⚠️ Important Security Note (Intentional Tradeoff)

VaultX does **not** support account recovery.

Because:
- Encryption keys are never stored
- The server has zero knowledge
- There is no trusted recovery authority

Forgetting your PIN permanently destroys access to your data.

This is a deliberate design decision, prioritizing confidentiality over
recoverability — similar to hardware wallets and high-assurance security systems.

---

## 🏁 Summary

- Zero-knowledge, client-side encryption
- Structural fragmentation to raise attack cost
- Cryptographic integrity verification
- Explicit handling of physical coercion threats
- Session-bound memory safety
- Clear and intentional security tradeoffs

VaultX is designed for users who assume **the worst**.
