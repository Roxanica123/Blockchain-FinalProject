import { Injectable } from '@angular/core';
import { ContractsService } from './contracts.service';
import Token from '@assets/contracts/MarketplaceToken.json';
import { ContractCallService } from './contracts-call.service';
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TokensService {

  constructor(private readonly contractsService: ContractsService, private readonly txService: ContractCallService) {
  }

  public async getUserTokens(address: string): Promise<number> {
    return await this.txService.call<number>(this.contractsService.marketplaceTokenContract, "balanceOf", [address])
  }

  public async buyTokens(address: string, amount: number) {
    return await this.txService.send(this.contractsService.marketplaceTokenContract, "buyTokens", [address, Number(amount)], address)
  }

}
