import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import Marketplace from '@assets/contracts/Marketplace.json';
import Token from '@assets/contracts/MarketplaceToken.json';

@Injectable({
  providedIn: 'root'
})
export class ContractsService { 
  
  public readonly web3: Web3;
  public readonly marketplaceContract: any;
  public readonly marketplaceTokenContract: any;

  constructor() {
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    this.marketplaceContract = new this.web3.eth.Contract(Marketplace.abi as AbiItem[], this.getAddress(Marketplace));
    this.marketplaceTokenContract = new this.web3.eth.Contract(Token.abi as AbiItem[], this.getAddress(Token));
  }

  getAddress(contract: any) {
    const keys = Object.keys(contract.networks);
    return contract.networks[keys[0]].address;
  }

  getMarketplaceAddress(){
    return this.getAddress(Marketplace);
  }

}

