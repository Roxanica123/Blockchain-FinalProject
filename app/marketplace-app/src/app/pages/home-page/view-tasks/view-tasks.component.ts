import { Component, OnInit } from '@angular/core';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UserService } from 'src/app/services/user.service';
import { TaskState, DomainExpertise, UserInfo, USER_STATICS, Role } from 'src/app/types/user-info';
import { ContractTask } from 'src/app/types/user-types';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.scss']
})
export class ViewTasksComponent implements OnInit {


  public displayedColumns: string[] = ["applicationsCount", "currentFunding", "description", "domainExpertise", "evaluatorReward", "freelancerReward", "investorsCount", "state"]
  public data: ContractTask[] = [];

  constructor(private readonly taskState: TaskStateService,) {

  }

  ngOnInit(): void {
    this.taskState.dataObservable.subscribe(data => this.data = data);


  }

  public getTaskState(ts: TaskState): string {
    return TaskState[ts];
  }

  public navigateToTask(task: ContractTask): void {
    this.taskState.updateCurrentTask(task);
  }

  public getDomainExpertize(ts: DomainExpertise): string {
    return DomainExpertise[ts];
  }







}
