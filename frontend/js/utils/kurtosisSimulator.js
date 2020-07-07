const { quant } = require("./finance.js");

const blackScholes = require("./blackScholes");
const RND = require("./randomNormalDistribution.js");

export default ({ standardDeviation = 0.01, kurtosisQuant = 1.9, days = 1, sampleSize = 10000, sampleMean = 1, type = "call" }) => {
  let dist = {
    kurtosis: () => {
      console.log({kurtosisQuant})
      let dist = RND(sampleSize * days, 0, 0.1).map(o => {
        let sign = o > 0 ? 1 : -1;
        return Math.pow(Math.abs(o), kurtosisQuant) * sign;
      });

      let sd = quant.standardDeviation(dist);

      dist = dist.map(o => o / (sd / standardDeviation))

      dist = dist.map(o => {
        if (o > 0) return 1 + o;
        return 1 / (1 - o);
      });

      let sample = new Array(sampleSize);
      for (let x = 0; x < dist.length; x += days) {
        let acc = 1;
        for (let y = 0; y < days; y++) {
          acc *= dist[x + y];
        }
        sample[x / days] = acc;
      }

      let mean = quant.mean(sample);

      sample = sample.map(o => o - (mean - sampleMean));
/*
      console.log('kurtosis', {
        sd: quant.standardDeviation(sample),
        kurtosis: quant.kurtosis(sample),
        mean: quant.mean(sample),
        summary: quant.summaryStatistics(sample),
      })
*/
      return sample;
    },

    normal: () => {
      const dist = RND(100000, 0, 0.01);
/*
      console.log('normal', {
        sd: quant.standardDeviation(dist),
        kurtosis: quant.kurtosis(dist),
        mean: quant.mean(dist),
        summary: quant.summaryStatistics(dist),
      })
*/
      return dist;
    },
  };

  return dist;
};
