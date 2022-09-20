import { Box, Modal, Typography } from "@mui/material";
import React, { useState } from "react";
import { CustomizedModalContent } from "../NoWalletModal/styled";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import { Button } from "components/Button";
import { GitContainer } from "containers/GitContainer";
import { WalletContainer } from "containers/WalletContainer";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Transaction } from "interfaces/Transaction";

interface SendDonateForm {
  bounty: number;
}

export const Fork: React.FC = () => {
  const { web3Provider } =
    WalletContainer.useContainer();

  const { gitFactory } = GitContainer.useContainer();

  const location = useLocation();
  const userAddress = location.pathname.slice(1).split("/")[0];
  const repositoryName = location.pathname.slice(1).split("/")[1];

  const { handleSubmit } = useForm<SendDonateForm>();
  const [waitingForTx, setWaitingForTx] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [openForkModal, setOpenForkModal] = React.useState(false);
  const handleOpenForkModal = () => setOpenForkModal(true);
  const handleCloseForkModal = () => setOpenForkModal(false);

  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const handleOpenErrorModal = () => setOpenErrorModal(true);
  const handleCloseErrorModal = () => setOpenErrorModal(false);

  const forkRepository = async () => {
    let gitFactoryWithSigner = gitFactory.connect(web3Provider.getSigner());
    gitFactory
        .getUserRepoNameHash(userAddress, repositoryName)
        .then((repositoryLocation: any) => {
            setWaitingForTx(true);
            return gitFactoryWithSigner.forkRepository(repositoryLocation);
        })
        .then((transaction: Transaction) => {
            return transaction.wait();
        })
        .then(() => {
            setWaitingForTx(false);
        })
        .catch((err: any) => {
            if (err.code === "ACTION_REJECTED") {
                console.log(err.reason);
                setWaitingForTx(false);
            } else if (err.reason === "execution reverted: Already forked") {
                setErrorMessage("You forked this repository already");
                setWaitingForTx(false);
                handleOpenErrorModal();
            } else {
                console.log('Something else', err.code);
            }
        });
    handleCloseForkModal();
  }

  return (
    <>
      <Button
          label="Fork"
          size="small"
          color="primary"
          variant="outlined"
          loading={waitingForTx}
          startIcon={waitingForTx ? null : <CallSplitIcon />}
          onClick={handleOpenForkModal}
        />

      <Modal open={openForkModal} onClose={handleCloseForkModal}>
        <CustomizedModalContent>
          <Typography variant="h2">Fork</Typography>
          <Typography sx={{ mt: 2 }}>
            Do you want to fork this repository?
          </Typography>
          <form onSubmit={handleSubmit(forkRepository)}>

            <Box
              marginTop={2}
              display="flex"
              justifyContent="flex-end"
              gap="16px"
            >
              <Button
                label="Close"
                size="small"
                color="primary"
                variant="contained"
                onClick={handleCloseForkModal}
              />
              <Button
                label="Ok"
                size="small"
                color="secondary"
                variant="contained"
                type="submit"
                loading={waitingForTx}
              />
            </Box>
          </form>
        </CustomizedModalContent>
      </Modal>

      <Modal open={openErrorModal} onClose={handleCloseErrorModal}>
        <CustomizedModalContent>
          <Typography variant="h2">Error</Typography>
          <Typography sx={{ mt: 2 }}>
          { errorMessage }
          </Typography>

            <Box
              marginTop={2}
              display="flex"
              justifyContent="flex-end"
              gap="16px"
            >
              <Button
                label="Ok"
                size="small"
                color="primary"
                variant="contained"
                onClick={handleCloseErrorModal}
              />
            </Box>
        </CustomizedModalContent>
      </Modal>
    </>
  );
};
