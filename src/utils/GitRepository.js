import { ethers } from 'ethers';
import gitBranchJson from '../assets/contracts/facets/GitBranch.sol/GitBranch.json';

export default class GitRepository {
    #gitBranchContract;

    #gitRepoAddress;

    /**
     * Constructor for the GitRepository class. It takes two parameter which are
     * used to instantiate the underlying smart contracts.
     * @param {*} address - Address of the GitRepository proxy contract
     * @param {*} provider - Provider which is connected to a chain where the contract resides
     */
    constructor(address, provider) {
        this.#gitBranchContract = new ethers.Contract(address, gitBranchJson.abi, provider);
        this.#gitRepoAddress = address;
    }

    /**
     * The getBranch method returns the branch stored in the Smart Contract based on the
     * given branchName parameter
     * @param {*} branchName - String which is the branch name
     * @returns
     */
    getBranch(branchName) {
        return this.#gitBranchContract.functions.getBranch(branchName);
    }

    /**
     * The getBranchNames method return all the branch names of the repository.
     * @returns Array of strings, which represent the branch names
     */
    async getBranchNames() {
        return this.#gitBranchContract.functions.getBranchNames();
    }

    get repositoryAddress() {
        return this.#gitRepoAddress;
    }
}
