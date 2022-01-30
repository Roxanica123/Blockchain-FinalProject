import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { SnackService } from 'src/app/services/snack.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, Role, TaskState, UserInfo, USER_STATICS } from 'src/app/types/user-info';
import { ContractTask, Evaluator, Freelancer } from 'src/app/types/user-types';

type FreelancerWithApplication = Freelancer & { applicationIndex : number};


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

  public async acceptApplicant(user: FreelancerWithApplication): Promise<void> {
   
    await this.tx.send(this.contracts.marketplaceContract, "pickFreelancer", [this.task!.index, user.applicationIndex], this.user.address);
    await this.taskState.updateTaskWithIndex(this.task!.index);

    this.snack.info(`Freelancer ${user.name} with expertise ${DomainExpertise[Number(user.domainExpertise!)]} has been accepted`)
  }

  public async selectEvaluator(user: Evaluator): Promise<void> {
    console.log(user);
    await this.tx.send(this.contracts.marketplaceContract, "pickEvaluator", [this.task!.index, user.evaluatorAddress], this.user.address);
    await this.taskState.updateTaskWithIndex(this.task!.index);
    this.snack.info(`Evaluator ${user.name} has been selected`);
  }

  public roleOf(role: DomainExpertise): string {
    return DomainExpertise[role];
  }

  public async delete(): Promise<void> {

  }

  private async loadApplications(): Promise<void> {
    const temp: FreelancerWithApplication[] = [];
    const count: Number = this.task!.applicationsCount;

    for (let i = 0; i < count; i++) {
      const res: string = await this.tx.call<string>(this.contracts.marketplaceContract, "taskApplications", [this.task?.index, i]);
      const fl:FreelancerWithApplication = await this.tx.call<FreelancerWithApplication>(this.contracts.marketplaceContract, "freelancers", [res]);
      fl.applicationIndex = Number(i);
      temp.push(fl)
    }
    this.applicants = temp;
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

  public isTimeToPickEvaluator(): boolean {
    return this.task?.state == TaskState.WAITING_FOR_EVALUATOR_ASSIGNMENT;
  }

  public isTimeToPickFreelancer(): boolean {
    return this.task?.state == TaskState.FREELANCERS_APPLICATIONS;
  }

  public isTimeForApprovel():boolean {
    return this.task?.state == TaskState.WAITING_FOR_APPR0VAL;
  }

  public async approveWork(){
    await this.tx.send(this.contracts.marketplaceContract, "approveTask", [this.task?.index], this.user.address);
    await this.taskState.updateTaskWithIndex(this.task!.index);

    this.snack.info(`The work has been finished!`);
  }

  public async rejectWork(){
    await this.tx.send(this.contracts.marketplaceContract, "rejectTask", [this.task?.index], this.user.address);
    await this.taskState.updateTaskWithIndex(this.task!.index);


    this.snack.info(`Moving task to arbitrage.`);
  }

}