import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UserService } from 'src/app/services/user.service';
import { TaskState, UserInfo, USER_STATICS } from 'src/app/types/user-info';
import { ContractTask } from 'src/app/types/user-types';

@Component({
  selector: 'app-evaluator-action',
  templateUrl: './evaluator-action.component.html',
  styleUrls: ['./evaluator-action.component.scss']
})
export class EvaluatorActionComponent implements OnInit {

  private subs: Subscription[] = [];
  private user: UserInfo = USER_STATICS.EMPTY_USER;
  
  @Input()
  public task: ContractTask | undefined = undefined;
  

  constructor(

    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly taskState: TaskStateService,
    private readonly snack: SnackService

  ) { }




  public async ngOnInit(): Promise<void> {
    this.subs.push(this.userService.userObservable().subscribe(data => this.user = data));
    if (this.task === undefined) {
      return;
    }
  }

  public ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public async approveWork(){
    await this.tx.send(this.contracts.marketplaceContract, "approveTaskInArbitrage", [this.task?.index], this.user.address);
    await this.taskState.updateTaskWithIndex(this.task!.index);
    this.snack.info(`The work has been finished!`);
  }

  public async rejectWork(){
    await this.tx.send(this.contracts.marketplaceContract, "rejectTaskInArbitrage", [this.task?.index], this.user.address);
    await this.taskState.updateTaskWithIndex(this.task!.index);
    this.snack.info(`Moving task to arbitrage.`);
  }

  public isTaskinWaitingForArbitrage():boolean{
    return this.task?.state == TaskState.WAITING_FOR_ARBITRAGE;
  }
}
