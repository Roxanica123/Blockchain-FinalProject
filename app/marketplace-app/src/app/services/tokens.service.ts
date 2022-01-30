import { Injectable } from '@angular/core';
import { ContractsService } from './contracts.service';
import Token from '@assets/contracts/MarketplaceToken.json';
import { ContractCallService } from './contracts-call.service';
import { BehaviorSubject, Observable } from 'rxjs';
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private readonly tokens: BehaviorSubject<number>;

  constructor(private readonly contractsService: ContractsService, private readonly txService: ContractCallService) {
    this.tokens = new BehaviorSubject<number>(0);
  }

  public async getUserTokens(address: string): Promise<number> {
    return await this.txService.call<number>(this.contractsService.marketplaceTokenContract, "balanceOf", [address])
  }

  public async buyTokens(address: string, amount: number) {
    await this.txService.send(this.contractsService.marketplaceTokenContract, "buyTokens", [address, Number(amount)], address);
    await this.refresh(address);
  }

  public async refresh(address: string): Promise<void> {
    const tokens = await this.getUserTokens(address)
    this.tokens.next(tokens);
  }

  public tokensObservable(): Observable<number> {
    return this.tokens.asObservable();
  }

}
