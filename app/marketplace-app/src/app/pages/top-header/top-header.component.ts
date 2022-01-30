import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokensService } from 'src/app/services/tokens.service';
import { UserService } from 'src/app/services/user.service';
import { Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})

export class TopHeaderComponent implements OnInit {

  private _user: UserInfo = USER_STATICS.EMPTY_USER;
  public tokensNumber: number = 0;

  constructor(
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
    private readonly router: Router) { }

  public ngOnInit(): void {
    this.userService.userObservable().subscribe((user: UserInfo) => {
      this._user = user;
    });
  }

  public get user(): UserInfo {
    return this._user;
  }
  public get loggedIn(): boolean {
    return this._user.address !== "";
  }

  public roleOf(role: Role): string {
    return Role[role];
  }

  public navigateHome(): void {
    this.router.navigate([""]);
  }

  public async buyTokens(): Promise<void>{
    console.log(this.tokensNumber)
    await this.tokensService.buyTokens(this._user.address, this.tokensNumber);
    this.userService.refresh();
  }
}



