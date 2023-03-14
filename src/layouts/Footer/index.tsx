import * as React from "react";
import { CustomizedAppBar } from "./styled";
import { Box, Toolbar } from "@mui/material";
import { Link } from 'react-router-dom';

import discordLogo from '../../assets/img/discord-mark-white.png';
import twitterLogo from '../../assets/img/twitter-logo-white.png';
import githubLogo from '../../assets/img/github-mark-white.png';

export const Footer: React.FC = () => {

  return (
    <CustomizedAppBar position="static">
      <Toolbar>
        <Link to={{ pathname: "https://discord.gg/z886AbNeTJ"}} target="_blank">
            <img
                src={discordLogo}
                alt="Discord"
            />
        </Link>
        <Box marginLeft={3}>
            <Link to={{ pathname: "https://twitter.com/Git314"}} target="_blank">
                <img
                    src={twitterLogo}
                    alt="Twitter"
                />
            </Link>
        </Box>
        <Box marginLeft={3}>
            <Link to={{ pathname: "https://github.com/varkiwi"}} target="_blank">
                <img
                    src={githubLogo}
                    alt="Github"
                />
            </Link>
        </Box>
        <Box flexGrow={1} />
      </Toolbar>
    </CustomizedAppBar>
  );
};
