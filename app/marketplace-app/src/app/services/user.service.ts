import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role, UserInfo, USER_STATICS } from '../types/user-info';
import { Evaluator, Freelancer, Investor, Manager } from '../types/user-types';
import { ContractCallService } from './contracts-call.service';
import { ContractsService } from './contracts.service';
import { TokensService } from './tokens.service';
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly user: BehaviorSubject<UserInfo>;

  constructor(
    private readonly contractsService: ContractsService,
    private readonly txService: ContractCallService,
    private readonly ngZone: NgZone,
    private readonly tokensService: TokensService) {
    this.user = new BehaviorSubject<UserInfo>(USER_STATICS.EMPTY_USER);

    window.ethereum.on('accountsChanged', async (accs: string[]) => await this.login());
    this.login();
  }

  public async login(): Promise<void> {
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await this.updateUserInfo(accs[0]);
  }

  public userObservable(): Observable<UserInfo> {
    return this.user.asObservable();
  }

  public async updateUserInfo(address: string) {
    const role: string = await this.contractsService.marketplaceContract.methods['getUserRole'](address).call();
    const newUser = await this.addInfo(address, Number(role));
    await this.tokensService.refresh(address);
    this.ngZone.run(() => this.user.next(newUser));
  }

  public async refresh(): Promise<void> {
    await this.updateUserInfo(this.user.value.address);
  }

  private async addInfo(address: string, role: Role): Promise<UserInfo> {
    //const tokens: number = await this.tokensService.getUserTokens(address);
    switch (role) {
      case Role.MANAGER:
        const managerInfo = await this.txService.call<Manager>(this.mp, "managers", [address]);
        return { address: address, role: role, name: managerInfo.name};
      case Role.INVESTOR:
        const investorInfo = await this.txService.call<Investor>(this.mp, "investors", [address]);
        return { address: address, role: role, name: investorInfo.name};
      case Role.EVALUATOR:
        const evaluatorInfo = await this.txService.call<Evaluator>(this.mp, "evaluators", [address]);
        return { address: address, role: role, name: evaluatorInfo.name, domainExpertise: evaluatorInfo.domainExpertise };
      case Role.FREELANCER:
        const freelancerInfo = await this.txService.call<Freelancer>(this.mp, "freelancers", [address]);
        return { address: address, role: role, name: freelancerInfo.name, domainExpertise: freelancerInfo.domainExpertise};
      default:
        console.log("big shit happen")
        return { address: address, role: role, name: "" }
    }
  }

  private get mp(): any {
    return this.contractsService.marketplaceContract;
  }
}
