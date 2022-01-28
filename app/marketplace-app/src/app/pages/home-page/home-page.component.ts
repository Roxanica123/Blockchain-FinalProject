import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  private user: UserInfo = USER_STATICS.EMPTY_USER;

  constructor(private readonly userService: UserService) {

  }

  ngOnInit(): void {
    this.userService.userObservable().subscribe(user => this.user = user);
  }

  public get loggedIn(): boolean {
    return this.user.role !== Role.NONE;
  }
}
