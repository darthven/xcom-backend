# XCOM Backend

## Development
### Dependencies
- [Node.js](https://nodejs.org/uk/) 10+
- [MongoDB](https://docs.mongodb.com/manual/installation/) 4.0 or later
### Configuration
You can configure:
- PORT
- MongoDB configuration (host, port and dbname);  
- ECOM credentials;  
- FTP credentials;  
- Manzana url;  

And all other stuff!  
All useful environments you can find and specify in ```.env``` file!   
```./server/.env``` - configuration file.
### How to start
In root of project:
1) ```cd server/ ```
1) ```npm install```  
1) ```npm run fs:init``` 
1) ```npm run start ```  

Now you can check in browser by default information url: ```http://localhost:1340/api``` (or by another host and port)!  
You should see something like:  
```{"status":"available","info":"xcom api","version":"1.1.0","startAt":"2018-11-01T22:59:03.273Z"}```

## Production
### Dependencies
- [Node.js](https://nodejs.org/uk/) 10+
- [MongoDB](https://docs.mongodb.com/manual/installation/) 4.0 or later
- [PM2](https://www.npmjs.com/package/pm2) (npm install pm2 -g)
### Configuration
You can configure:
- PORT
- MongoDB configuration (host, port and dbname);  
- ECOM credentials;  
- FTP credentials;  
- Manzana url;  

And all other stuff!  
All useful environments you can find and specify in ```.env.prod``` file!   
```./server/.env.prod``` - configuration file.
```./server/ecosystem.config.js``` - pm2 config file.
### How to start
In root of project:
1) ```cd server/ ```
1) ```npm install```  
1) ```npm run build```  
1) ```npm run fs:init:prod``` 
1) ```npm run start:prod ``` - using pm2

Now you can check in browser by default information url: ```http://localhost:1340/api``` (or by another host and port)!  
You should see something like:  
```{"status":"available","info":"xcom api","version":"1.1.0","startAt":"2018-11-01T22:59:03.273Z"}```  
Also you can type ```pm2 status``` and check your process.
