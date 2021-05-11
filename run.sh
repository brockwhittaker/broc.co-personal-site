cd frontend
parcel index.html --out-dir=../dist/ --public-url=/dist/ &
echo 'running index'
parcel home-prices-index.html --out-dir=../dist/ --public-url=/dist/ &
echo 'running home-prices-index'
parcel blog.html --out-dir=../blog-dist/ --public-url=/blog-dist/ &
echo 'running blog'
cd ../server
echo 'cd ./server'
PORT=4000 nodemon server.js
echo 'run node'