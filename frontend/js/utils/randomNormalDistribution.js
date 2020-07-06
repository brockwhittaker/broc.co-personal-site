function boxMullerTransformation () {
  var x1, x2, r;

  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    r = x1 * x1 + x2 * x2;
    // Check if generated number is range [0,1]
  } while (r >= 1 || r === 0);
  return Math.sqrt(-2 * Math.log(r) / r) * x1;
}

function randomNormalNumber (mean, standardDeviation) {
  return boxMullerTransformation() * standardDeviation + mean;
}

// create a dataset of random normally distributed numbers with a given sample
// size, mean, and standard deviation.
module.exports = function randomNormalDistribution (n, mean, standardDeviation) {
  let arr = new Array(n);
  for (let x = 0; x < n; x++) {
    arr[x] = randomNormalNumber(mean, standardDeviation);
  }

  return arr;
};
