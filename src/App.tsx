import * as React from "react";
import { hot } from "react-hot-loader";
import { GitContainer } from "containers/GitContainer";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Header } from "layouts/Header";
import { Footer } from "layouts/Footer";
import { ThemeProvider } from "@mui/material";
import { defaultTheme } from "layouts/theme";
import { AppContainer } from "layouts/AppContainer/styled";
import { Dashboard } from "pages/Dashboard";
import { Code } from "pages/Code";
import { Issue } from "pages/Issue";
import { Repositories } from "pages/Repositories";
import { RepoNav } from "layouts/RepoNav";
import { ProfileNav } from "layouts/ProfileNav";
import { WalletContainer } from "containers/WalletContainer";
import { NewIssue } from "pages/Issue/subpages/NewIssue";
import { PreviewIssue } from "pages/Issue/subpages/PreviewIssue";

class App extends React.Component<Record<string, unknown>, undefined> {

  public render() {
    return (
      <GitContainer.Provider>
        <WalletContainer.Provider>
          <ThemeProvider theme={defaultTheme}>
            <Router>
              <Header />
              <AppContainer>
                <Route render={({ location }) => {
                    return location.pathname.slice(1).split("/")[1] != 'repositories' ? <RepoNav /> : null 
                }} />
                <Route render={({ location }) => {
                    return location.pathname.slice(1).split("/")[1] == 'repositories' ? <ProfileNav /> : null 
                }} />
                <Switch>
                  <Route exact path="/" component={Dashboard} />
                  <Route path="/:repoAddress/:repoName/repo" component={Code} />
                  <Route
                    exact
                    path="/:repoAddress/:repoName/repo/:file"
                    component={Code}
                  />
                  <Route
                    exact
                    path="/:repoAddress/:repoName/issues"
                    component={Issue}
                  />
                  <Route
                    exact
                    path="/:repoAddress/:repoName/issues/new"
                    component={NewIssue}
                  />
                  <Route
                    exact
                    path="/:repoAddress/:repoName/issues/:id"
                    component={PreviewIssue}
                  />
                  <Route
                    exact
                    path="/:userAddress/repositories"
                    component={Repositories}
                  />
                </Switch>
              </AppContainer>
              <Footer />
            </Router>
          </ThemeProvider>
        </WalletContainer.Provider>
      </GitContainer.Provider>
    );
  }
}

declare let module: Record<string, unknown>;

export default hot(module)(App);
