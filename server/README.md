# Shyla auto-reply setup (10 minute ka kaam)

1. shyla.enterpez@gmail.com se login karke https://script.google.com kholo, **New project**.
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
