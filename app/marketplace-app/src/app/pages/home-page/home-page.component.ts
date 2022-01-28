import { Component, OnInit } from '@angular/core';
import { ContractsService } from 'src/app/services/contracts.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, EMPTY_USER, UserInfo } from 'src/app/types/user-info';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  private user: UserInfo;

  constructor(private readonly userService: UserService, private readonly contractsService: ContractsService) {
    this.user = EMPTY_USER;
    userService.userObservable().subscribe((user: UserInfo) => this.user = user);
  }

  ngOnInit(): void {
  }

  public getUser(){
    console.log(this.user);
  }

  public async joinAsManager() {
    await this.contractsService.marketplaceContract.methods.addManager("manager", this.user.address).send({ from: this.user.address });
    this.userService.updateUserInfo(this.user.address);
  }
  public async joinAsInvestor() {
    await this.contractsService.marketplaceContract.methods.addInvestor("investor", this.user.address).send({ from: this.user.address });
    this.userService.updateUserInfo(this.user.address);
  }
  public async joinAsEvaluator() {
    await this.contractsService.marketplaceContract.methods.addEvaluator("evaluator", DomainExpertise.NA, this.user.address)
      .send({ from: this.user.address });
    this.userService.updateUserInfo(this.user.address);
  }
  public async joinAsFreelancer() {
    await this.contractsService.marketplaceContract.methods.addFreelancer("freelancer", DomainExpertise.NA, this.user.address)
      .send({ from: this.user.address });
    this.userService.updateUserInfo(this.user.address);
  }

}
