---------------------------SET UP!--------------------------------- 

1. Create a local forder for the project
mkdir eatlapProject
cd eatlapProject

2. Clone the backend repository here 
git clone git clone https://github.com/schbal50/eatlap.git
npm install


3. Clone the frontend repository 
cd client
git submodule add https://github.com/schbal50/eatclient.git

4. A backend folderéből nézve most létrejött egy olyan mappa szerkezet, ami így néz ki:
 -> Client -> eatclient -> és minden szar az eatclienten belül.

5. jelölj ki mindent az eatclienten belül aztán nyomj egy ctrl+x -et és lépj ki a client mappába és oda ctrl+v 
6. Ha sikerült, akkor töröld ki az üres eatclient foldert 
7. terminallal lepj be a client folderbe (ahova másoldat a dolgokat) és írj egy: npm install 

8. Ha megvagy akkor nyisd meg az eatlapProject foldered visual studio code-al 
9. Nyiss meg két terminált
10. egyik terminállal: cd client -> npm start
11. Másik terminállal: npm run dev 


-- ERROR --
Mivel a projektben jelenleg az adatbázis hivatkozás local adatbázisra mutat, nem fog működni neked a mongoDB kapcsolat -> Ezt kifogom javítani (rákötök egy felhőt) és jó lesz neked is.