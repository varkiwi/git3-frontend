import { TabContext } from "@mui/lab";
import { Box, Tab, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { CustomizedTabList, RepoNavHeader } from "./styled";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import Grid from '@mui/material/Grid';
import { Donate } from "components/Donate";
import { Fork } from "components/Fork";
import { WalletContainer } from "containers/WalletContainer";

export const RepoNav: React.FC = () => {
  const { gitRepository, walletActive, repoUrl, setRepoUrl, walletAddress } = WalletContainer.useContainer();

  const history = useHistory();
  const location = useLocation();
  const userAddress = location.pathname.slice(1).split("/")[0];
  const repoName = location.pathname.slice(1).split("/")[1];

  const [repositoryForked, setRepositoryForked] = useState<boolean>(true);
  const [repositoryForkOrigin, setRepositoryForkOrigin] = useState<string>("");

  const [tabValue, setTabValue] = React.useState("/repo");
  const handleTabClick = (value: string) => {
    const params = new URLSearchParams(location.search);
    setTabValue(value);
    history.push({ pathname: `${repoUrl}${value}`, search: params.toString() });
  };

  useEffect(() => {
    location.pathname.includes("issues")
      ? setTabValue("/issues")
      : setTabValue(`/repo`);

    setRepoUrl(`/${userAddress}/${repoName}`);
  }, [location.pathname]);

  if (gitRepository != null) {
    gitRepository.repositoryInformation()
        .then((data: any) => {
            setRepositoryForked(data.forked);
            setRepositoryForkOrigin(`${data.forkOrigin.slice(0, 8)}..${data.forkOrigin.slice(-8)}`);
        });
  }
  return location.pathname !== "/" ? (
    <>
      <RepoNavHeader>
      { repositoryForked
        ? <Grid>
            <Typography variant="h2" marginBottom={0}>
            {repoName}
            </Typography>
            <Typography variant="caption" marginBottom={2}>
            forked from {repositoryForkOrigin}/{repoName}
            </Typography>
        </Grid>
        : <Typography variant="h2" marginBottom={2}>
            {repoName}
            </Typography>
        }
        <span>
            {walletActive && <Donate />}
            {
                walletActive &&
                walletAddress.toLowerCase() != userAddress.toLowerCase() &&
                !repositoryForked &&
                <Fork />
            }
        </span>
      </RepoNavHeader>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <CustomizedTabList textColor="inherit" indicatorColor="secondary">
            <Tab
              label="/Code"
              value="/repo"
              icon={<CodeOutlinedIcon />}
              iconPosition="start"
              onClick={() => handleTabClick("/repo")}
            />
            <Tab
              label="/Issues"
              value="/issues"
              icon={<BugReportOutlinedIcon />}
              iconPosition="start"
              onClick={() => handleTabClick("/issues")}
            />
          </CustomizedTabList>
        </Box>
      </TabContext>
    </>
  ) : null;
};
