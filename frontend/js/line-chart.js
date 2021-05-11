import Highcharts from './highcharts.js';

export default ({ series, container, title, subtitle, source, xAxisMin, xAxisDividingIndex, yAxisText }) => Highcharts.chart(container, {
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
      text: subtitle + `<br />Source: ${source}`,
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
      }],
      labels: {
        formatter: function () {
          return new Date(this.value).getFullYear();
        }
      }
  },
  yAxis: {
      title: {
          text: yAxisText,
          style: {
              fontWeight: 500
          }
      },
      gridLineDashStyle: "longdash",
      labels: {
        formatter: null, /*function () {
          return "1:" + (1 / this.value).toFixed(2);
        },*/
      },
  },
  tooltip: {
    formatter: null, /*function () {

    },*/
  },
  plotOptions: {
      spline: {
          marker: {
              enabled: 0,
          },
          lineWidth: 1,
          lineColor: '#333'
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
