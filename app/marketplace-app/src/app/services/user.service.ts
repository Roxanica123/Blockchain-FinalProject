import { ConstantPool } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role, UserInfo } from '../types/user-info';
import { ContractsService } from './contracts.service';
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly user: BehaviorSubject<UserInfo>;

  constructor(private readonly contractsService: ContractsService) {
    this.user = new BehaviorSubject<UserInfo>({ address: "", role: Role.NONE, name: "" });

    window.ethereum.on('accountsChanged', async (accs: string[]) => await this.updateUserInfo(accs[0]));
  }

  async login(): Promise<void> {
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await this.updateUserInfo(accs[0]);
  }

  public userObservable(): Observable<UserInfo> {
    return this.user.asObservable();
  }

  public async updateUserInfo(address: string) {
    const role: Role = await this.contractsService.marketplaceContract.methods['getUserRole'](address).call();
    this.user.next(await this.addInfo(address, role));
  }

  private async addInfo(address: string, role: Role): Promise<UserInfo> {
    switch (role) {
      case Role.MANAGER:
        const managerInfo = await this.contractsService.marketplaceContract.methods['managers'](address).call();
        return { address: address, role: role, name: managerInfo.name };
      case Role.INVESTOR:
        const investorInfo = await this.contractsService.marketplaceContract.methods['investors'](address).call();
        return { address: address, role: role, name: investorInfo.name };
      case Role.EVALUATOR:
        const evaluatorInfo = await this.contractsService.marketplaceContract.methods['evaluators'](address).call();
        return { address: address, role: role, name: evaluatorInfo.name, domainExpertise: evaluatorInfo.domainExpertise };
      case Role.FREELANCER:
        const freelancerInfo = await this.contractsService.marketplaceContract.methods['freelancers'](address).call();
        return { address: address, role: role, name: freelancerInfo.name, domainExpertise: freelancerInfo.domainExpertise };
      default:
        return { address: address, role: role, name: "" }
        break;
    }
  }
}
