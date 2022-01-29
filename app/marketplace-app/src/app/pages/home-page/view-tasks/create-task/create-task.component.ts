import { Component, OnInit } from '@angular/core';
import { ContractCallService } from 'src/app/services/contracts-call.service';
import { ContractsService } from 'src/app/services/contracts.service';


import { UserService } from 'src/app/services/user.service';
import { Role, UserInfo, USER_STATICS, DomainExpertise } from 'src/app/types/user-info';


@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})



export class CreateTaskComponent implements OnInit {

   description:  string = "";

   freelancerReward: Number = 1;
   evaluatorReward: Number = 0;

   domainExpertise: string = "";

   domains = ['FRONTEND', 'BACKEND', 'WEB_DESIGN', 'NA' ];

   public user: UserInfo;

  constructor(
    private readonly txService: ContractCallService,
    private readonly contracts: ContractsService,
    private readonly userService: UserService
  ) { 

    this.user = USER_STATICS.EMPTY_USER;

    userService.userObservable().subscribe((user: UserInfo) => {
      this.user = user
    });

  }

  ngOnInit(): void {
  }

  public clickMe(){
   console.log(this.description, this.freelancerReward, this.evaluatorReward, this.domainExpertise)


   this.txService.send(this.contracts.marketplaceContract,"createTask",[
   this. description, this.freelancerReward, this.evaluatorReward, this.domains.indexOf(this.domainExpertise)
   ], this.user.address)
  }


}
