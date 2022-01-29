import { Component, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';

@Component({
  selector: 'app-join-app',
  templateUrl: './join-app.component.html',
  styleUrls: ['./join-app.component.scss']
})
export class JoinAppComponent implements OnInit {

  private user: UserInfo = USER_STATICS.EMPTY_USER;
  public name: string = "";
  public domains: string[] = ['FRONTEND', 'BACKEND', 'WEB_DESIGN', 'NA'];
  public domainExpertise: string = "";

  public error: string | undefined = undefined;

  constructor(
    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contractsService: ContractsService,
    private readonly snackService: SnackService) { }

  public ngOnInit(): void {
    this.userService.userObservable().subscribe((user: UserInfo) => this.user = user);
  }

  public getUser() {
    console.log(this.user);
  }

  public async join(role: Role): Promise<void> {
    if (this.name === "") {
      this.error = "Please select a name.";
      return;
    }

    if ((role === Role.FREELANCER || role === Role.EVALUATOR) && this.domainExpertise == "") {
      this.error = "Please select a domain expertise for this role.";
      return;
    }
    
    this.error = undefined;

    switch (role) {
      case Role.INVESTOR:
        await this.tx.send(this.mp, "addInvestor", [this.name, this.user.address], this.user.address);
        break;
      case Role.MANAGER:
        await this.tx.send(this.mp, "addManager", [this.name, this.user.address], this.user.address);
        break;
      case Role.EVALUATOR:
        await this.tx.send(this.mp, "addManager", [this.name, this.domains.indexOf(this.domainExpertise), this.user.address], this.user.address);
        break;
      case Role.FREELANCER:
        await this.tx.send(this.mp, "addFreelancer", [this.name, this.domains.indexOf(this.domainExpertise), this.user.address], this.user.address);
        break;
    }

    this.userService.refresh();
    this.snackService.info("Successfully joined the marketplace! 😊");
  }

  private get mp(): any {
    return this.contractsService.marketplaceContract;
  }
}
