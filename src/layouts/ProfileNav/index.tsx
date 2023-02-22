import { TabContext } from "@mui/lab";
import { Box, Tab, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { CustomizedTabList, RepoNavHeader } from "./styled";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import { Button } from "components/Button";
import Grid from '@mui/material/Grid';
import { Donate } from "components/Donate";
import { Fork } from "components/Fork";
import { WalletContainer } from "containers/WalletContainer";
import { NewRepository  } from "components/NewRepository";

export const ProfileNav: React.FC = () => {
  const { gitRepository, walletActive, repoUrl, setRepoUrl, walletAddress } = WalletContainer.useContainer();

  const history = useHistory();
  const location = useLocation();
  const userAddress = location.pathname.slice(1).split("/")[0];
  const repoName = location.pathname.slice(1).split("/")[1];

  const [repositoryForked, setRepositoryForked] = useState<boolean>(false);
  const [repositoryForkOrigin, setRepositoryForkOrigin] = useState<string>("");

  const [tabValue, setTabValue] = React.useState("repositories");
  const handleTabClick = (value: string) => {
    console.log('Handling tab clicks');
    // const params = new URLSearchParams(location.search);
    // setTabValue(value);
    // history.push({ pathname: `${repoUrl}${value}`, search: params.toString() });
  };

  useEffect(() => {
    setTabValue("repositories");
  }, [location.pathname]);

  return location.pathname !== "/" ? (
    <>
      <RepoNavHeader>
        <Typography variant="h2" marginBottom={2}>
            Profile
        </Typography>
        
        <span>
          <NewRepository />
        </span>
      </RepoNavHeader>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <CustomizedTabList textColor="inherit" indicatorColor="secondary">
            <Tab
              label="Repositories"
              value="repositories"
              iconPosition="start"
              onClick={() => handleTabClick("/repo")}
            />
          </CustomizedTabList>
        </Box>
      </TabContext>
    </>
  ) : null;
};
