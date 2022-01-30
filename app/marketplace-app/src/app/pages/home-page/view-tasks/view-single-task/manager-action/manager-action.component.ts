import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, UserInfo, USER_STATICS } from 'src/app/types/user-info';
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

  constructor(
    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contracts: ContractsService) { }

  public async ngOnInit(): Promise<void> {
    this.subs.push(this.userService.userObservable().subscribe(data => this.user = data));
    if (this.task === undefined) {
      return;
    }

    if (this.task.applicationsCount > 0) {
      this.loadApplications();
    }
  }

  public ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private loadApplications(): void {
    // const res = this.tx.call(this.contracts.marketplaceContract, "taskApplications", [this.task!.index]);
    this.applicants = [{
      ...USER_STATICS.EMPTY_USER,
      name: "applier1",
      domainExpertise: DomainExpertise[DomainExpertise.FRONTEND]
    }, {
      ...USER_STATICS.EMPTY_USER,
      name: "applier2",
      domainExpertise: DomainExpertise[DomainExpertise.BACKEND]
    }]
  }
}