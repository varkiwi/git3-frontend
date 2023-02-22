import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "/assets/scss/App.scss";
import store from './store/store';
import { Provider } from 'react-redux'

const rootEl = document.getElementById("root");

render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  rootEl,
);
