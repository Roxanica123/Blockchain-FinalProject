import { Component, OnInit } from '@angular/core';
import { TaskStateService } from 'src/app/services/task-state.service';
import { ContractTask } from 'src/app/types/user-types';
import { TaskState, DomainExpertise, USER_STATICS, UserInfo, Role } from 'src/app/types/user-info';
import { UserService } from 'src/app/services/user.service';
@Component({
    selector: 'app-view-single-task',
    templateUrl: './view-single-task.component.html',
    styleUrls: ['./view-single-task.component.scss']
})
export class ViewSingleTaskComponent implements OnInit {

    public task: ContractTask | undefined = undefined;

    public user: UserInfo;


    public displayInfo: string[] = ["index","applicationsCount", "investorsCount", "currentFunding", "description", "domainExpertise", "evaluatorReward", "freelancerReward",  "state"]
    public displayedAddress: string[] = ["evaluatorAddress","freelancerAddress","managerAddress"]

    
    constructor(private readonly taskState: TaskStateService,
        private readonly userService: UserService
        ) {
        taskState.asObservable.subscribe((data: ContractTask | undefined) => {
            if (data !== undefined) {
                this.task = data;
            }
        });

        this.user = USER_STATICS.EMPTY_USER;
        this.userService.userObservable().subscribe((user: UserInfo) => {
            this.user = user
          });

    }

    ngOnInit(): void {
    }


    public getDomainExpertize(ts: DomainExpertise): string {
        return DomainExpertise[ts];
      }

      public getTaskState(ts: TaskState): string {
        return TaskState[ts];
      }

      public isManager():boolean{
        return this.user.role == Role.MANAGER;
      }
    
      public isFreelancer():boolean{
        return  this.user.role == Role.FREELANCER;
      }
    
      public isEvaluator():boolean{
        return  this.user.role == Role.EVALUATOR;
      }

      public isInvestor():boolean{
        return  this.user.role == Role.INVESTOR;
      }
}
