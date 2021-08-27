import { ethers } from 'ethers';
import gitBranchJson from '../assets/contracts/facets/GitBranch.sol/GitBranch.json';

export default class GitRepository {
    #gitBranchContract;

    constructor(address, provider) {
        this.#gitBranchContract = new ethers.Contract(address, gitBranchJson.abi, provider);
        console.log(this.#gitBranchContract.functions);
    }

    getBranch(branchName) {
        return this.#gitBranchContract.functions.getBranch(branchName);
    }

    async getBranchNames() {
        return this.#gitBranchContract.functions.getBranchNames();
    }
}
