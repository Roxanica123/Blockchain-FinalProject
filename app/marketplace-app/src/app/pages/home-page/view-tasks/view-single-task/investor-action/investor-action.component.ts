import { Component, Input, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UserService } from 'src/app/services/user.service';
import { UserInfo, USER_STATICS } from 'src/app/types/user-info';
import { ContractTask } from 'src/app/types/user-types';

@Component({
  selector: 'app-investor-action',
  templateUrl: './investor-action.component.html',
  styleUrls: ['./investor-action.component.scss']
})
export class InvestorActionComponent implements OnInit {

  @Input()
  public task: ContractTask | undefined = undefined;

  public fundAmount: number = 0;
  public takeBackFundAmount: number = 0;

  private user: UserInfo = USER_STATICS.EMPTY_USER;

  constructor(
    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly snack: SnackService,
    private readonly tasksService: TaskStateService) { }

  ngOnInit(): void {
    this.userService.userObservable().subscribe(data => this.user = data);
  }

  public async fundTask(): Promise<void> {
    const marketplaceContractAddress = this.contracts.getMarketplaceAddress();

    await this.tx.send(this.contracts.marketplaceTokenContract, "approve", [marketplaceContractAddress, this.fundAmount], this.user.address)
    await this.tx.send(this.contracts.marketplaceContract, "fundTask", [this.task!.index, this.fundAmount], this.user.address);
    this.snack.info(`${this.fundAmount} tokens were invested in this task!`);
    this.fundAmount = 0;
    await this.tasksService.updateTaskWithIndex(this.task!.index);
  }

  public async takeBackFunding(): Promise<void> {
    const marketplaceContractAddress = this.contracts.getMarketplaceAddress();
  }

}
