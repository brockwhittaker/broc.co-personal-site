const fs = require("fs");

const finance = require("./finance");

const key = `adj_close`;

const VOL_WINDOW = 14,
      SQRT_MARKET_DAYS_PER_YEAR = Math.sqrt(252),
      FORWARD_DAYS = 22,
      STARTING_DAY = 1;

fs.readFile("^GSPC.csv", "utf8", (err, res) => {
  let data = res.split(/\n/g);
  let header = data[0].split(",");
  let rows = data.slice(1).map((row) => {
    let obj = {};
    row.split(",").forEach((o, i) => obj[header[i].toLowerCase().replace(" ", "_")] = o);
    obj[key] = +obj[key]
    obj.date = new Date(obj.date)
    return obj;
  }).filter(o => o.date > new Date(1980, 0, 0));

  // getVolatilityByDayOfTheWeek(rows)
  // getVolatilityOfNextDayByPreceedingVolatility(rows)

  let stdDev = getLast14DaysVolatility(rows)
  let vol = stdDev * SQRT_MARKET_DAYS_PER_YEAR
  let weeklyChange = stdDev * Math.sqrt(FORWARD_DAYS) * SQRT_MARKET_DAYS_PER_YEAR
  console.log('Volatility:\t', vol.toFixed(4))
  getNextWeekReturnsByPreceedingVolatility(rows, o => o.volatility > vol - 0.03 && o.volatility < vol + 0.03)

  console.log(stdDev, weeklyChange)
  console.log(10 / 344)
});


const getVolatilityByDayOfTheWeek = data => {
  data = data.map(o => ({...o, date: new Date(o.date).getDay() }))
  const days = []

  data.forEach((day, idx) => {
    if (idx === 0) return;

    const yesterday = data[idx - 1]
    if (!days[day.date]) days[day.date] = { closeToClose: [], openToClose: [] }
    days[day.date].closeToClose.push(day.close / yesterday.close)
    days[day.date].openToClose.push(day.close / day.open)
  })

  let stdDev = days.map(o => {
    return {
      closeToClose: finance.quant.standardDeviation(o.closeToClose),
      openToClose: finance.quant.standardDeviation(o.openToClose),
    };
  });
  const daysObject = {};
  ["Mon", "Tue", "Wed", "Thu", "Fri"].map((o, i) => {
    daysObject[o] = stdDev[i]
  })
  console.log(daysObject)
};

const getCloseToCloseResiduals = data => {
  return data.map((o, i) => ({ ...o, change: o.close / (data[i - 1] || {}).close })).slice(1)
};

// date should be a string
const trimFromDate = (data, date) => {
  if (typeof date !== "string") throw `"date" should be a string to prevent date-time errors.`
  return data.filter(o => o.date > new Date(date))
}

const getVolatilityOfNextDayByPreceedingVolatility = data => {
  data = getCloseToCloseResiduals(data)
  data = data.map((day, idx) => {
    if (idx < VOL_WINDOW) return;
    windowOfResiduals = data.slice(idx - VOL_WINDOW, idx).map(o => o.change);
    return { ...day, volatility: finance.quant.standardDeviation(windowOfResiduals) * SQRT_MARKET_DAYS_PER_YEAR }
  }).filter(o => o);

  let volatilityBins = []
  data.forEach((o, idx) => {
    if (idx === 0 || idx > data.length - (FORWARD_DAYS + 1)) return;
    let bin = Math.floor(data[idx].volatility * 10);
    if (!volatilityBins[bin]) volatilityBins[bin] = []
    volatilityBins[bin].push((data[idx + FORWARD_DAYS].close / data[idx + 1].open) / Math.sqrt(FORWARD_DAYS))
  })

  console.log(volatilityBins.map((o, i) => ({
    volatility: i * 10,
    nextDayVolatility: finance.quant.standardDeviation(o) * SQRT_MARKET_DAYS_PER_YEAR,
    samples: o.length,
  })))
}

const getNextWeekReturnsByPreceedingVolatility = (data, refineFunc) => {

  data = trimFromDate(data, "1990-01-01")
  data = getCloseToCloseResiduals(data)
  data = data.map((o, idx) => {
    if (idx < VOL_WINDOW || idx > data.length - (FORWARD_DAYS + 1)) return;
    o = { ...o };

    if (o.date.getDay() === STARTING_DAY) {
      windowOfResiduals = data.slice(idx - VOL_WINDOW, idx).map(o => o.change);
      o.volatility = finance.quant.standardDeviation(windowOfResiduals) * SQRT_MARKET_DAYS_PER_YEAR;
      console.log(data[idx + FORWARD_DAYS].date, o.date)
      o.weeklyReturn = data[idx + FORWARD_DAYS].close / o.open
    }

    return o;
  }).filter(o => o && o.weeklyReturn)
    .filter(refineFunc || (() => {}));

  let bins = [];

  data.forEach(o => {
    let weeklyReturn = o.weeklyReturn * 200 - 200
    for (let x = -20; x < 20; x++) {
      if (weeklyReturn < x && weeklyReturn < 0 && x < 0) {
        if (!bins[x + 20]) bins[x + 20] = 0;
        bins[x + 20]++;
      } else if (weeklyReturn > x && weeklyReturn > 0 && x > 0) {
        if (!bins[x + 20]) bins[x + 20] = 0;
        bins[x + 20]++;
      }
    }
  });

  console.log('Samples:\t' + data.length)
  console.log(bins.map((o, i) => `${((i - 20) / 2).toFixed(1)}%: ${(100 * o / data.length).toFixed(2)}%`))
  console.log('sd', finance.quant.standardDeviation(data.map(o => o.change)))
}

const getLast14DaysVolatility = data => {
  let days = getCloseToCloseResiduals(data.slice(data.length - 14));
  let stdDev = finance.quant.standardDeviation(days.map(o => o.change))
  return stdDev;
};

const calculateProbabilityBelowPoint = data => {

}
