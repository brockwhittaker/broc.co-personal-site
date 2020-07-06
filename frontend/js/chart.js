import Highcharts from './highcharts.js';

export default ({ series, container, title, subtitle, xAxisMin, xAxisDividingIndex }) => Highcharts.chart(container, {
  chart: {
      type: "spline",
      backgroundColor: "transparent",
      style: {
        fontFamily: "Soehne, Helvetica Neue",
      },
  },
  title: {
      text: title,
      style: {
        fontWeight: 600
      },
      align: "left",
  },
  subtitle: {
      text: subtitle + "<br />Source: api.robinhood.com",
      align: "left",
  },
  xAxis: {
      gridLineDashStyle: "longdash",
      gridLineWidth: 1,
      startOnTick: true,
      min: xAxisMin,
      plotLines: [{
          color: 'rgb(0,0,0)', // Red
          width: 1,
          value: xAxisDividingIndex // Position, you'll have to translate this to the values on your x axis
      }]
  },
  yAxis: {
      title: {
          text: "Odds (Above / Below)",
          style: {
              fontWeight: 500
          }
      },
      gridLineDashStyle: "longdash",
      labels: {
        formatter: function () {
          return "1:" + (1 / this.value).toFixed(2);
        },
      },
      min: 0,
  },
  tooltip: {
    formatter: function () {
      let { strikes } = this.point.options;
      return "1:" + (1 / this.y).toFixed(2) + " Odds @ $" + (+strikes[0].strike_price).toFixed(0) /* + " / $" + (+strikes[1].strike_price).toFixed(0); */
    },
  },
  plotOptions: {
      spline: {
          marker: {
              enabled: 1,
              lineColor: "rgba(0, 0, 0, 0.7)",
              lineWidth: 1,
              radius: 3,
              fillColor: "transparent",
          }
      },
      series: {
          color: "black",
          lineWidth: 1,
          turboThreshold: 20000,
      }
  },
  series,
  credits: {
    enabled: false,
  },
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
        }
      }
    }]
  }

});
