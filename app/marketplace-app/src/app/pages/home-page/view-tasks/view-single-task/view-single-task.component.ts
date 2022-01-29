import { Component, OnInit } from '@angular/core';
import { TaskStateService } from 'src/app/services/task-state.service';
import { ContractTask } from 'src/app/types/user-types';

@Component({
    selector: 'app-view-single-task',
    templateUrl: './view-single-task.component.html',
    styleUrls: ['./view-single-task.component.scss']
})
export class ViewSingleTaskComponent implements OnInit {

    public task: ContractTask | undefined = undefined;

    constructor(private readonly taskState: TaskStateService) {
        taskState.asObservable.subscribe((data: ContractTask | undefined) => {
            if (data !== undefined) {
                this.task = data;
            }
        });
    }

    ngOnInit(): void {
    }

}
