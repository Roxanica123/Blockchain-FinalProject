import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { UserService } from 'src/app/services/user.service';
import { TaskState } from 'src/app/types/user-info';
import { ContractTask } from 'src/app/types/user-types';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.scss']
})
export class ViewTasksComponent implements OnInit {

  constructor(

    private readonly txService: ContractCallService,
    private readonly userService: UserService,
    private readonly contractsService: ContractsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {

    this.refreshtTask();

   }

  ngOnInit(): void {
  }

  public displayedColumns: string[] = ["applicationsCount" ,"currentFunding","description","domainExpertise","evaluatorReward", "freelancerReward","investorsCount","state"]
  public data : ContractTask[] = [];


  public async refreshtTask(){
    //const count = await this.contractsService.marketplaceContract.methods["tasksCount"]().call();

    const count = await this.txService.call<Number>(this.contractsService.marketplaceContract, "tasksCount",[]);
    console.log(count);
    const local_data:ContractTask[] = []
    for(let i = 0 ; i < count; i ++ ){
      const task = await this.txService.call<ContractTask>(this.contractsService.marketplaceContract, "tasks",[i]);
      local_data.push(task);
    }

    this.data = local_data;
    console.log(this.data);

    //this.changeDetectorRef.detectChanges();
  }


  public  getTaskState(ts: TaskState):string{
    return TaskState[ts];
  }
}
