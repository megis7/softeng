# Stardust Crusaders

| Επώνυμο               | Όνομα      | Αριθμός Μητρώου |
|-----------------------|------------|-----------------|
| Ζαμάνης               | Αλέξιος    | 3115010         |
| Ζώγας                 | Παναγιώτης | 3115191         |
| Μεγγίσογλου           | Μιχαήλ     | 3115014         |
| Στραϊτούρη            | Ελένη      | 3115068         |

## Installing on Linux

```
cd softeng/client &&
npm install &&
ng build --prod --output-path public &&
rm -rf ../server/public &&
cp -r public ../server/public &&
cd ../server &&
npm install &&
npm start
```

## Testing on Linux
```
# git clone https://github.com/saikos/softeng18b-rest-api-client.git &&
mongo server --eval "db.dropDatabase()" &&
curl -i -X POST -H "Content-Type:application/json" https://localhost:8765/observatory/api/users -d '{"username":"administrator","password":"password","role":"administrator"}' -k &&
source /etc/profile.d/gradle.sh &&
cd softeng18b-rest-api-client &&
gradle wrapper &&
./gradlew clean test --tests gr.ntua.ece.softeng18b.client.ObservatoryAPIFunctionalTest -Dusername=administrator -Dpassword=password -Dprotocol=https -DIGNORE_SSL_ERRORS=true -Dhost=localhost -Dport=8765 -Dtest.json=$1
```

## Stack

* Frontend: Angular 7
* Backend: Node.js 11 and Express 4
* Database: MongoDB 4
