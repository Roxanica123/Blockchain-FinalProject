import { Component, Input, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
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

  private user: UserInfo = USER_STATICS.EMPTY_USER;

  constructor(
    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly snack: SnackService) { }

  ngOnInit(): void {
    this.userService.userObservable().subscribe(data => this.user = data);
  }

  public async ok(): Promise<void> {
    await this.tx.send(this.contracts.marketplaceContract, "fundTask", [this.task!.index, 1], this.user.address);
  }

}
