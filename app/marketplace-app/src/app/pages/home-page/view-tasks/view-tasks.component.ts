import { Component, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.scss']
})
export class ViewTasksComponent implements OnInit {

  constructor(

    private readonly txService: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly userService: UserService,
    private readonly contractsService: ContractsService

  ) { }

  ngOnInit(): void {
  }

  public displayedColumns: string[] = ["applicationsCount" ]//,"currentFunding","description","domainExpertise","evaluatorAddress","evaluatorReward","freelancerAddress","freelancerReward","investorsCount","managerAddress","state"]
  public data: object[] = [];


  public async clickMe(){

    console.log("Hey i do work!");
    const count = await this.contractsService.marketplaceContract.methods["tasksCount"]().call();
    console.log(count);
    this.data = []
    for(let i = 0 ; i < count; i++ ){
      const task = await this.contractsService.marketplaceContract.methods["tasks"](i).call();
      this.data.push(task);
    }
    console.log(this.data);
  }
}
