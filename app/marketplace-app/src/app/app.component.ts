import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { UserInfo, USER_STATICS } from './types/user-info';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private user: UserInfo = USER_STATICS.EMPTY_USER;

  constructor(private readonly userService: UserService) { }
  
  public ngOnInit(): void {
    this.userService.userObservable().subscribe(user => this.user = user);
  }

  public get loggedIn(): boolean {
    return this.user.address !== "";
  }
}
