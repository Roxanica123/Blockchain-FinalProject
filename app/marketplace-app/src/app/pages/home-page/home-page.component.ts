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

  ngOnInit(): void {
    
  }
}
