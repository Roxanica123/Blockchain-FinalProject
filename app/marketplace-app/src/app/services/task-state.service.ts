import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { ContractTask } from "../types/user-types";

@Injectable({
    providedIn: 'root'
})
export class TaskStateService {
    private readonly task!: BehaviorSubject<ContractTask | undefined>;

    constructor(private readonly router: Router) {
        this.task = new BehaviorSubject<ContractTask | undefined>(undefined);
    }

    public get asObservable(): Observable<ContractTask | undefined> {
        return this.task.asObservable();
    }

    public next(task: ContractTask) {
        this.task.next(task);
        this.router.navigate(["view-task"]);
    }
}