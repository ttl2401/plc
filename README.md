git clone source code

Install dependencies :
```bash
sudo apt update
sudo apt install nodejs
sudo apt install npm
sudo apt install curl
sudo apt install gnupg
sudo apt install ufw

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

source ~/.bashrc  
# or 
source ~/.zshrc 

nvm install 22
nvm use 22

npm install -g pm2
```

Install MongoDB 7.0 for Ubuntu 22.04
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

Configure mongoDB user and password: 
```bash
mongosh
> use plc
> db.createUser( 
    {
        user: "ximaplc",
        pwd: "Djr0D4rkSl4y3R",
        roles: [ 
        { role: "readWrite", db: "plc" }
        ]    
    }
)
```

Install InfluxDB
```bash
curl -sL https://repos.influxdata.com/influxdata-archive.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive.gpg > /dev/null

echo "deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive.gpg] https://repos.influxdata.com/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/influxdata.list

sudo apt update

sudo apt install -y influxdb2

sudo systemctl start influxdb
sudo systemctl enable influxdb
```

Configure Influx
```bash
influx setup
```
### InfluxDB configuration
user : xima
password : xima@123
org name : ztechhub
bucket name : plc-influx
retention period : infinite ( let 's enter only)

Retrieve Influx Token
```bash
influx auth list
```
Copy the token 
for example:
TJG-zrgU5C-JDaT7jrF2-0eyuScVdNv2LFv0MnpUPUfF-Nke76dsESHfKdbnMFfhWXkCr7ThUQbWG3kL7u9jbg==

Fill all above information into backend .env



### INSTALL & CONFIG NGINX, SSL
1) install Nginx 
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable  nginx
cd /etc/nginx/sites-enabled
```
2) Config nginx
```bash
echo 'server {
    server_name xima.ztechhub.net;
    root /home/ubuntu/plc/frontend;
    index index.html;
    client_header_buffer_size 32K;
    large_client_header_buffers 2 32K;

    location / {
        rewrite ^/(.*) /$1 break;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_pass http://localhost:3009;
        proxy_redirect off;
        client_max_body_size 100M;
        client_body_buffer_size 32K;
        proxy_buffer_size   128k;
        proxy_buffers   4 256k;
        proxy_busy_buffers_size   256k;
    }

    error_log /var/log/nginx/xima.ztechhub.net_error.log;
    access_log /var/log/nginx/xima.ztechhub.net_access.log;
}' | sudo tee /etc/nginx/sites-enabled/xima.ztechhub.net.conf


echo 'server
{
        server_name xima-api.ztechhub.net;
        root /home/ubuntu/plc/backend;
        index index.html;
        client_header_buffer_size 32K;
        large_client_header_buffers 2 32K;


        location / {
                rewrite ^/(.*) /$1 break;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_pass http://localhost:3010;
                proxy_redirect off;
                client_max_body_size 100M;
                client_body_buffer_size 32K;
                proxy_buffer_size   128k;
                proxy_buffers   4 256k;
                proxy_busy_buffers_size   256k;
        }
        


        error_log /var/log/nginx/xima-api.ztechhub.net_error.log;
        access_log /var/log/nginx/xima-api.ztechhub.net_access.log;
}' | sudo tee /etc/nginx/sites-enabled/xima-api.ztechhub.net.conf

sudo systemctl reload nginx
```

3) Install SSL with Certbot
```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo ufw allow 'Nginx Full'

sudo certbot --nginx -d xima.ztechhub.net -d xima-api.ztechhub.net
sudo systemctl reload nginx
```

Kiểm tra xem đã bật auto renew và test renew nếu muốn
```bash
sudo systemctl status snap.certbot.renew.service
sudo certbot renew --dry-run
```