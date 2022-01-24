import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { EMPTY_USER, Role, UserInfo } from 'src/app/types/user-info';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})
export class TopHeaderComponent {
  private user:UserInfo; 

  constructor(private readonly userService: UserService) {
    this.user = EMPTY_USER;
    userService.userObservable().subscribe((user: UserInfo) => this.user = user);
  }

  public async initMetamask() {
    this.userService.login();
  }

}
