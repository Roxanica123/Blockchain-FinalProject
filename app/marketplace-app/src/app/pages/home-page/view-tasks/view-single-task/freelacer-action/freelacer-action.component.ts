import { Component, Input, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UserService } from 'src/app/services/user.service';
import { TaskState, UserInfo, USER_STATICS } from 'src/app/types/user-info';
import { ContractTask } from 'src/app/types/user-types';

@Component({
  selector: 'app-freelacer-action',
  templateUrl: './freelacer-action.component.html',
  styleUrls: ['./freelacer-action.component.scss']
})
export class FreelacerActionComponent implements OnInit {

  private user: UserInfo = USER_STATICS.EMPTY_USER;

  @Input()
  public task: ContractTask | undefined = undefined;

  constructor(
    private readonly userService: UserService,
    private readonly txService: ContractCallService,
    private readonly snackService: SnackService,
    private readonly contractsService: ContractsService
  ) {


  }

  ngOnInit(): void {
    this.userService.userObservable().subscribe((user: UserInfo) => this.user = user);


  }


  public async applyForATask() {
    const taskIndex = this.task?.index;
    await this.txService.send(this.mp, "applyForATask", [taskIndex], this.user.address);
  }

  public async declareTaskFinished() {
    const taskIndex = this.task?.index;
    await this.txService.send(this.mp, "declareTaskFinished", [taskIndex], this.user.address);
  }

  private get mp(): any {
    return this.contractsService.marketplaceContract;
  }


  public isTaskReadyToAsignUser():boolean{
    return this.task?.state == TaskState.FREELANCERS_APPLICATIONS;
  }


}
