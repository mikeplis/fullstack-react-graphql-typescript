docker build -t mplis/lireddit:3 .
docker push mplis/lireddit:3
ssh root@157.230.177.69
docker pull mplis/lireddit:3
docker tag mplis/lireddit:3 dokku/api:latest
dokku tags:deploy api latest