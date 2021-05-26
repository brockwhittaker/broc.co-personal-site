cd frontend
parcel index.html --out-dir=../dist/ --public-url=/dist/ &
echo 'running index'
parcel home-prices-index.html --out-dir=../dist/ --public-url=/dist/ &
echo 'running home-prices-index'
parcel blog.html --out-dir=../blog-dist/ --public-url=/blog-dist/ &
echo 'running blog'
cd ../server
echo 'cd ./server'
if [[ "$1" == "prod" ]]; then
  PORT=4000 forever server.js
else
  PORT=4000 nodemon server.js
fi
echo 'run node'