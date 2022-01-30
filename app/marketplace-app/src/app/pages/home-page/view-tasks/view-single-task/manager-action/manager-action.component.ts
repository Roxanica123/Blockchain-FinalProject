import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';
import { ContractTask, Evaluator, Freelancer } from 'src/app/types/user-types';

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

  public applicants: Freelancer[] = [];
  public applicantsColumns: string[] = ["name", "domainExpertise", "reputation", "accept"]

  public evaluators: Evaluator[] = [];
  public evaluatorsColumns: string[] = ["name", "domainExpertise", "accept"];

  constructor(
    private readonly userService: UserService,
    private readonly tx: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly taskState: TaskStateService,
    private readonly snack: SnackService) { }

  public async ngOnInit(): Promise<void> {
    this.subs.push(this.userService.userObservable().subscribe(data => this.user = data));
    if (this.task === undefined) {
      return;
    }

    this.loadApplications();
    await this.loadEvaluators();

  }

  public ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public acceptApplicant(user: Freelancer): void {
    //send to blockchain
    this.snack.info(`Freelancer ${user.name} with expertise ${Role[Number(user.domainExpertise!)]} has been accepted`)
  }

  public async selectEvaluator(user: Evaluator): Promise<void> {
    console.log(user);
    await this.tx.send(this.contracts.marketplaceContract, "pickEvaluator", [this.task!.index, user.evaluatorAddress], this.user.address);
    this.snack.info(`Evaluator ${user.name} with reputation has been selected`);
    await this.taskState.updateTaskWithIndex(this.task!.index);
  }

  public roleOf(role: DomainExpertise): string {
    return DomainExpertise[role];
  }

  public async delete(): Promise<void> {

  }

  private loadApplications(): void {
    // retrieve from blockchain
    // const res = this.tx.call(this.contracts.marketplaceContract, "taskApplications", [this.task!.index]);
    this.applicants = [{
      freelancerAddress: "",
      reputation: 0,
      name: "applier1",
      domainExpertise: DomainExpertise.FRONTEND.toString()
    }, {
      freelancerAddress: "",
      reputation: 0,
      name: "applier2",
      domainExpertise: DomainExpertise.BACKEND.toString()
    }]
  }

  private async loadEvaluators(): Promise<void> {
    const temp: Evaluator[] = [];
    const count: number = await this.tx.call<number>(this.contracts.marketplaceContract, "evaluatorsCount", []);
    for (let i = 0; i < count; i++) {
      const res: Evaluator = await this.tx.call<Evaluator>(this.contracts.marketplaceContract, "getEvaluatorByIndex", [i]);
      temp.push(res);
    }

    this.evaluators = temp;
  }


}