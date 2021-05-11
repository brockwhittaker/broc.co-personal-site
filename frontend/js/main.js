import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Index from "./views/Index.js";
import PredictingMarketReturns from "./views/PredictingMarketReturns.js";
import HousePrices from "./views/HousePrices.js"

class App extends React.Component {
  constructor () {
    super();
  }

  render () {
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={Index} />
          <Route path="/predicting-market-returns/" exact component={PredictingMarketReturns} />
          <Route path="/homes-are-cheaper-than-ever/" exact component={HousePrices} />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
