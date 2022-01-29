import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  private user: UserInfo = USER_STATICS.EMPTY_USER;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router) {

  }

  ngOnInit(): void {
    this.userService.userObservable().subscribe(user => this.user = user);
  }

  public get loggedIn(): boolean {
    return this.user.role !== Role.NONE;
  }

  public get isManager(): boolean {
    return this.user.role === Role.MANAGER;
  }

  public goToCreate(): void {
    this.router.navigate(["create-task"]);
  }
}
