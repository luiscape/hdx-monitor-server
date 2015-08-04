## Rolltime Server


On the MongoDB shell (`mongo`), create an user using:
```
db.createUser({user: "rolltimedev", pwd: "PASSWORD_HERE", roles: [{ role: "readWrite", db: "rolltime" },]})
```
