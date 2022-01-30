import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SnackService } from 'src/app/services/snack.service';
import { TokensService } from 'src/app/services/tokens.service';
import { UserService } from 'src/app/services/user.service';
import { DomainExpertise, Role, UserInfo, USER_STATICS } from 'src/app/types/user-info';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})

export class TopHeaderComponent implements OnInit {

  private _user: UserInfo = USER_STATICS.EMPTY_USER;
  public tokensNumber: number = 0;
  private userTokens: number = 0;

  constructor(
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
    private readonly router: Router,
    private readonly snack: SnackService) { }

  public ngOnInit(): void {
    this.userService.userObservable().subscribe((user: UserInfo) => {
      this._user = user;
    });
    this.tokensService.tokensObservable().subscribe((tokens: number) => { this.userTokens = tokens; })
  }

  public get user(): UserInfo {
    return this._user;
  }
  public get loggedIn(): boolean {
    return this._user.address !== "";
  }
  public get userTokensNumber(): number {
    return this.userTokens;
  }
  public get hasDomainExpertise(): boolean {
    return [1, 2].indexOf(this._user.role) != -1;
  }

  public roleOf(role: Role): string {
    return Role[role];
  }

  public domainExpertiseOf(domain: string | undefined): string {
    return DomainExpertise[Number(domain!)];
  }

  public navigateHome(): void {
    this.router.navigate([""]);
  }

  public async buyTokens(): Promise<void> {
    await this.tokensService.buyTokens(this._user.address, this.tokensNumber);
    this.snack.info(`You just bought ${this.tokensNumber} tokens!`);
    this.tokensNumber = 0;
  }
}