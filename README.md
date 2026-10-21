# Charcoal Lead Desk

Lead recycling companies ke liye CRM aur telecalling app (charcoal sales).

## APK kaise milega
1. GitHub par is repo ka **Actions** tab kholo.
2. **Build APK** workflow chuno, **Run workflow** dabao (push par bhi apne aap chalta hai).
3. Run poora hone par neeche **Artifacts** me `charcoal-lead-desk-apk` download karo.
4. Zip kholkar `app-debug.apk` phone me install karo (phone me "unknown sources" allow karna padega).

## Release (signed) APK
Repo ke Settings > Secrets and variables > Actions me ye 2 secrets daalo: `KEYSTORE_B64` (keystore ka base64) aur `KS_PASS` (password). Uske baad har build par signed APK **Releases** page par aa jaata hai. Keystore ki backup copy kahin surakshit rakho; ye kho gayi to app ka update install nahi hoga.

## Data
Sab data phone me hi save hota hai. Pehli baar app khulne par CPCB ki all-India list (673 units) apne aap load hoti hai. Backup ke liye app ke "CSV copy" button se list copy kar lo.

Web app ki source `www/index.html` me hai.
