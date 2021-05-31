#!/bin/bash

echo What should the version be?
read VERSION
echo $VERSION

docker build -t mplis/lireddit:$VERSION .
docker push mplis/lireddit:$VERSION
ssh root@157.230.177.69 "docker pull mplis/lireddit:$VERSION && docker tag mplis/lireddit:$VERSION dokku/api:latest && dokku tags:deploy api latest"