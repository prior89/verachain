
# VeraChain Mobile UI (Expo) — How to Add & Test

## 1) Where to place
Put this folder as `mobile/` at the root of your repo (prior89/verachain).

## 2) Install & run
```bash
cd mobile
npm i
npx expo start
```

## 3) Design decisions
- Purple brand hue (#6B4FE3), clean typography, consistent back button
- Mandatory flow: Product scan -> Certificate/QR scan -> Done
- No recent scan history (as requested)
- No flash/gallery in scanner
- Auto mint/burn by role inferred from QR (final role mapping must come from backend)
- TxID display toggled off by default (policy TBD)

## 4) Files to integrate backend/blockchain
- `src/lib/api.ts` — product verification
- `src/lib/blockchain.ts` — burn/mint. Should return `{ txId }` if needed.
- `src/state/ScanFlowContext.tsx` — call the above functions in `onProductRecognized` / `onCertificateRecognized`

## 5) Commit & push
```bash
git checkout -b feature/mobile-ui
git add mobile
git commit -m "feat(mobile): clean dual-scan UX with auto mint/burn and consistent nav"
git push -u origin feature/mobile-ui
```

## 6) Quick QA checklist
- Launch app -> Home "Start Scan" -> Product scan
- After product scanned -> Guided banner appears -> Certificate/QR scan
- Role switching: simulate seller/buyer by encoding 'seller' in QR string to see burn/mint label change
- Error cases: disable network and confirm user-friendly message (to be implemented in api/blockchain stubs)
- Certificates list: search and status filter works
- Back button is present on every stack screen

## 7) Next steps
- Wire-up to your backend endpoints and Polygon Amoy testnet (or chosen chain)
- Decide TxID display policy and set `showTxId = true` if required
- Optional: add share-to-Kakao/URL copy on certificate detail
mongodb+srv://verachain:<1674614ppa!>@verachain-cluster.izpeptn.mongodb.net/?retryWrites=true&w=majority&appName=verachain-cluster