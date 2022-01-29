import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role, UserInfo } from '../types/user-info';
import { Evaluator, Freelancer, Investor, Manager } from '../types/user-types';
import { ContractCallService } from './contracts-call.service';
import { ContractsService } from './contracts.service';
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly user: BehaviorSubject<UserInfo>;

  constructor(
    private readonly contractsService: ContractsService,
    private readonly txService: ContractCallService,
    private readonly ngZone: NgZone) {
    this.user = new BehaviorSubject<UserInfo>({ address: "", role: Role.NONE, name: "" });

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
    this.ngZone.run(() => this.user.next(newUser));
  }

  private async addInfo(address: string, role: Role): Promise<UserInfo> {
    switch (role) {
      case Role.MANAGER:
        const managerInfo = await this.txService.call<Manager>(this.mp, "managers", [address]);
        return { address: address, role: role, name: managerInfo.name };
      case Role.INVESTOR:
        const investorInfo = await this.txService.call<Investor>(this.mp, "investors", [address]);
        return { address: address, role: role, name: investorInfo.name };
      case Role.EVALUATOR:
        const evaluatorInfo = await this.txService.call<Evaluator>(this.mp, "evaluators", [address]);
        return { address: address, role: role, name: evaluatorInfo.name, domainExpertise: evaluatorInfo.domainExpertise };
      case Role.FREELANCER:
        const freelancerInfo = await this.txService.call<Freelancer>(this.mp, "freelancers", [address]);
        return { address: address, role: role, name: freelancerInfo.name, domainExpertise: freelancerInfo.domainExpertise };
      default:
        console.log("big shit happen")
        return { address: address, role: role, name: "" }
    }
  }

  private get mp(): any {
    return this.contractsService.marketplaceContract;
  }
}
