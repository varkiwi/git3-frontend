import { Box, Modal, Typography } from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { setNewValue } from '../../features/newRepo/newRepoSlice';
import { CustomizedModalContent } from "../NoWalletModal/styled";
import { Button } from "components/Button";
import { TextField } from "components/TextField";
import { WalletContainer } from "containers/WalletContainer";
import { GitContainer } from "containers/GitContainer";
import { Controller, useForm } from "react-hook-form";
import { Transaction } from "interfaces/Transaction";

interface CreateRepositoryForm {
  repositoryName: string;
}

export const NewRepository: React.FC = () => {
  const { gitFactory } = GitContainer.useContainer();
  const { web3Provider } = WalletContainer.useContainer();

  const dispatch = useDispatch()

  const { control, handleSubmit } = useForm<CreateRepositoryForm>();
  const [waitingForTx, setWaitingForTx] = useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const [openModal, setOpenModal] = React.useState(false);

  const showErrorMessage = (inputError: boolean, errorMessage: string) => {
    setInputError(inputError);
    setErrorText(errorMessage);
  }

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    showErrorMessage(false, "");
    setOpenModal(false);
  };

  const createRepository = async (form: CreateRepositoryForm) => {
    const repositoryName = form.repositoryName;

    if (repositoryName.length === 0) {
        showErrorMessage(true, "Name of length 0 not allowed");
        return;
    }

    let gitFactoryWithSigner = gitFactory.connect(web3Provider.getSigner());
    gitFactoryWithSigner.createRepository(repositoryName)
        .then((transaction: Transaction) => {
            setInputError(false);
            setErrorText("");
            setWaitingForTx(true);
            handleCloseModal();
            return transaction.wait()
        })
        .then(() => {
            setWaitingForTx(false);
            dispatch(setNewValue(true));
        }) 
        .catch((err: object) => {
            if (err['reason'].includes('Repo exists')) {
                showErrorMessage(true, `${repositoryName} exists already`);
            }
        });
  };

  return (
    <>
      <Button
        label="New repository"
        size="small"
        color="secondary"
        variant="contained"
        loading={waitingForTx}
        sx={{ float: "right" }}
        onClick={handleOpenModal}
      />

      <Modal open={openModal} onClose={handleCloseModal}>
        <CustomizedModalContent>
          <Typography variant="h2">New repository</Typography>
          <Typography sx={{ mt: 2 }}>
            Name your new repository
          </Typography>
          <form onSubmit={handleSubmit(createRepository)}>
            <Controller
              name="repositoryName"
              control={control}
              defaultValue={""}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={inputError}
                  helperText={errorText}
                  label=""
                  fullWidth
                  sx={{ mt: 2 }}
                  value={value}
                  onChange={onChange}
                />
              )}
            />

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
                onClick={handleCloseModal}
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
    </>
  );
};
