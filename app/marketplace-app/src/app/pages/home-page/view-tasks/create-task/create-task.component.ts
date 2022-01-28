import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit {

   description:  string = "";

   freelancerReward: Number = 1;
   evaluatorReward: Number = 0;

   domainExpertise: String = "";

  constructor() { }

  ngOnInit(): void {
  }

  public clickMe(){
   console.log(this.description, this.freelancerReward, this.evaluatorReward, this.domainExpertise)
  }


}
