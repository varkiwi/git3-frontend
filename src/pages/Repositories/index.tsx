import { Container, Grid } from "@mui/material";
import { Button } from "components/Button";
// import { Table } from "components/Table";
import { GitContainer } from "containers/GitContainer";
// import { WalletContainer } from "containers/WalletContainer";
// import { CodeTableRow } from "interfaces/Table/CodeTableRow";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setNewValue } from '../../features/newRepo/newRepoSlice';
// import { ethers } from "ethers";
// import loadSmartContract from "utils/utils";
// import { TableHeaders } from "interfaces/Table/TableHeaders";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

export const Repositories: React.FC = () => {
  const { gitFactory } = GitContainer.useContainer();

  const [userRepos, setUserRepos] = useState<Array<string>>([]);
  const history = useHistory();
  const location = useLocation();
  const userAddress = location.pathname.slice(1).split("/")[0];

  const newRepo = useSelector((state: any) => state.newRepo.value);
  const dispatch = useDispatch()

  useEffect(() => {
    const getUserRepos = async () => {
      const repos = await gitFactory.getUsersRepositories(userAddress)
      // somehow it can happen that a repo is there twice.
      // Not sure yet why
      const filteredRepos = repos.filter((value: string, index: number) => 
        repos.indexOf(value) === index);
      setUserRepos(filteredRepos);
    }
    getUserRepos();
    dispatch(setNewValue(false));
  }, [newRepo]);
  
  const redirectToRepo = (repoLocation: string, repoName: string) => {
    history.push(`/${repoLocation}/${repoName}/repo`);
  }

  return (
    <Container>
        <List>
            {userRepos.map(repoName =>
              <React.Fragment key={repoName}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    onClick={() => redirectToRepo(userAddress, repoName)}
                    primaryTypographyProps={{ style: {
                        cursor: 'pointer',
                        textDecorationLine: 'underline'
                    } }}
                    primary={repoName}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            )}
          </List>
    </Container>
  );
};