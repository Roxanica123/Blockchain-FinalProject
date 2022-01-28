import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { EMPTY_USER, Role, UserInfo, RoleString } from 'src/app/types/user-info';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})



export class TopHeaderComponent {
  private user:UserInfo; 
  public  show_user: UserInfo;
  public user_is_loged = false;
  public roleString : Array<String> = RoleString;

  constructor(private readonly userService: UserService) {
    this.user = EMPTY_USER;
    this.show_user = EMPTY_USER;

    userService.userObservable().subscribe((user: UserInfo) => 
    {
      this.user_is_loged = true;
      this.user = user
      this.show_user = user;
      console.log(this.show_user);

      if( this.user_is_loged) {
        this.userService.login();
      }
    
    });


  }

  public async initMetamask() {
    this.userService.login();
  }

}



