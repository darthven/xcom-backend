# XCOM Backend

## Dependencies
- [Node.js](https://nodejs.org/uk/) 10+ and NPM
- [MongoDB](https://docs.mongodb.com/manual/installation/) 4.0 or later
- [PM2](https://www.npmjs.com/package/pm2) (npm install pm2 -g)
- Postfix `sudo apt-get install postfix`
- make, gcc, g++ to build bcrypt (`sudo apt-get install make build-essential g++`)
- nginx

### Configuration
* Dev: `server/.env`
* Prod: `server/.env.prod`

Following instructions assume one of the following $modes : `dev` or `prod`

### Initial setup
Project root:
1) `cd server/`
1) `npm run setup $mode` 

### Start
Project root:
1) `cd server/`
1) `npm run build && npm run start:$mode`

### Running scripts
To run a script use command `npm run script:$mode -- script1 script2 pipe1`. Scripts should be located in `server/src/scripts`. You can also run pipelines of scripts. See `server/src/scripts/pipes.ts`.

Now you can check in browser by default information url: `http://localhost:1340/api` (or by another host and port)!  
You should see something like:  
```{"status":"available","info":"xcom api","version":"1.1.0","startAt":"2018-11-01T22:59:03.273Z"}```

Also you can type ```pm2 status``` and check your process if in production mode.
