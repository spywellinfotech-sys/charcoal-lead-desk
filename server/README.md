# Shyla auto-reply setup (10 minute ka kaam)

**IndiaMART/TradeIndia ke enquiry email kis Gmail me aate hain?** Agar Turbancorpn@gmail.com me aate hain to do raste hain:
- (A) Turbancorpn@gmail.com me Settings > Forwarding me shyla.enterprz@gmail.com add karo (verify hoga), phir ek filter banao: from indiamart.com / tradeindia.com -> Forward to shyla.enterprz@gmail.com. Is README ka setup shyla.enterprz@gmail.com se karo. Reply shyla ke naam se jayega.
- (B) Ya setup seedha Turbancorpn@gmail.com me karo. Tab reply us address se jayega.


1. shyla.enterprz@gmail.com se login karke https://script.google.com kholo, **New project**.
2. `Code.gs` ka poora text paste karo (server/Code.gs). `SECRET` me koi lamba random text likho.
3. Upar function dropdown se **setup** chuno aur Run dabao. Gmail aur Sheets ki permission Allow karo.
   Isse har 1 minute ka trigger lag jata hai aur "Shyla Enquiries" sheet ban jati hai.
4. **Deploy > New deployment > Web app**. Execute as: Me. Who has access: Anyone. Deploy dabao, URL copy karo.
5. App me: Enquiries tab > "Auto-sync URL" me `URL?key=SECRET` paste karo. Ab app kholte hi naye enquiry aa jayenge.
6. TradeIndia email ka sender alag ho to `QUERY` badlo (Gmail search syntax).
7. WhatsApp auto-message: Meta Business Suite me WhatsApp Cloud API setup karke template approve karao, phir
   `WA_TOKEN`, `WA_PHONE_ID`, `WA_TEMPLATE` bharo. Bina iske sirf email auto-reply jayega.

Dhyan do: pehle 2-3 asli enquiry se parse sahi hai ya nahi check karo. Template ka format alag ho to
`parse_` ke labels badalne padenge.

## Asli TradeIndia email ka format (dekha gaya)
Sender: inquiry.paid@rfis.tradeindia.com, subject "Looking for suppliers of <product>". Body me Sender Name, Product Details,
Company Name, Mobile aur city/state hote hain, **buyer ka email nahi hota**. Isliye email auto-reply TradeIndia enquiry par nahi ja sakta.
Reply ke raaste: WhatsApp (app ka button, ya Meta WhatsApp API ke baad apne aap) ya call. Script phir bhi enquiry ko Sheet me daalti hai aur app me sync hoti hai.
