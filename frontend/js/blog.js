import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import BlogPost from "./views/BlogPost.js"

class App extends React.Component {
  constructor () {
    super();
  }

  render () {
    return (
      <Router>
        <Switch>
          <Route path="/blog/:blog/" exact component={BlogPost} />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
