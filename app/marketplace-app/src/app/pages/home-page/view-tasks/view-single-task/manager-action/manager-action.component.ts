import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';
import { ContractTask } from 'src/app/types/user-types';

@Component({
  selector: 'app-manager-action',
  templateUrl: './manager-action.component.html',
  styleUrls: ['./manager-action.component.scss']
})
export class ManagerActionComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];

  @Input()
  public task: ContractTask | undefined = undefined;
  private user: UserInfo = USER_STATICS.EMPTY_USER;

  public applicants: UserInfo[] = [];
  public applicantsColumns: string[] = ["name", "domainExpertise", "accept"]

  constructor(
    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly snack: SnackService) { }

  public async ngOnInit(): Promise<void> {
    this.subs.push(this.userService.userObservable().subscribe(data => this.user = data));
    if (this.task === undefined) {
      return;
    }

    this.loadApplications();

  }

  public ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public acceptApplicant(user: UserInfo): void {
    //send to blockchain
    this.snack.info(`Freelancer ${user.name} with expertise ${Role[Number(user.domainExpertise!)]} has been accepted`)
  }

  public roleOf(role: Role): string {
    return Role[role];
  }

  public async delete():Promise<void> {

  }

  private loadApplications(): void {
    // retrieve from blockchain
    // const res = this.tx.call(this.contracts.marketplaceContract, "taskApplications", [this.task!.index]);
    this.applicants = [{
      ...USER_STATICS.EMPTY_USER,
      name: "applier1",
      domainExpertise: DomainExpertise.FRONTEND.toString()
    }, {
      ...USER_STATICS.EMPTY_USER,
      name: "applier2",
      domainExpertise: DomainExpertise.BACKEND.toString()
    }]
  }


}