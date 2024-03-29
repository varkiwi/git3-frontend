import { ethers } from "ethers";
import { createContainer } from "unstated-next";
import gitFactoryJson from "../assets/contracts/factory_facets/RepositoryManagement.sol/RepositoryManagement.json";
import React, { useState } from "react";
import { EChainType } from "enums/ChainType";

interface GitState {
  gitFactory: any;
  chainType: EChainType | string;
  setChainType: (chainType: EChainType) => void;
}

export const GitContainer = createContainer<GitState>(() => {
  const [chainType, setChainType] = useState<EChainType | string>(
    localStorage.getItem("chainType") || EChainType.MUMBAI,
  );

  if (localStorage.getItem("chainType") === null) {
    localStorage.setItem("chainType", EChainType.MUMBAI);
  }

  let gitFactoryAddress;
  let rpcEndpoint;
  switch (chainType) {
    case EChainType.GODWOKEN:
      gitFactoryAddress = process.env.GITFACTORY_ADDRESS_GODWOKEN ?? "";
      rpcEndpoint = process.env.RPC_ENDPOINT_GODWOKEN;
      break;
    default:
      gitFactoryAddress = process.env.GITFACTORY_ADDRESS_MUMBAI ?? "";
      rpcEndpoint = process.env.RPC_ENDPOINT_MUMBAI;
  }
  const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
  const gitFactoryAbi = gitFactoryJson.abi;
  const gitFactory = new ethers.Contract(
    gitFactoryAddress,
    gitFactoryAbi,
    provider,
  );

  return {
    gitFactory,
    chainType,
    setChainType,
  };
});
