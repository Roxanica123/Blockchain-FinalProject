import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import Marketplace from '@assets/contracts/Marketplace.json';
import Token from '@assets/contracts/MarketplaceToken.json';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  public web3: Web3;
  public marketplaceContract : any;
  public marketplaceTokenContract : any;
  
  constructor() { 
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    this.marketplaceContract = new this.web3.eth.Contract(Marketplace.abi as AbiItem[], Marketplace.networks["5777"].address);
    this.marketplaceTokenContract = new this.web3.eth.Contract(Token.abi as AbiItem[], Token.networks["5777"].address);
  }
  
}
