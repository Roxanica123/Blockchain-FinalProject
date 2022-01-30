import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { ContractTask } from "../types/user-types";
import { ContractCallService } from "./contracts-call.service";
import { ContractsService } from "./contracts.service";

@Injectable({
    providedIn: 'root'
})
export class TaskStateService {
    private count: number = 0;

    private readonly emitter: Subject<void>;
    private readonly task!: BehaviorSubject<ContractTask | undefined>;
    private readonly tasks!: BehaviorSubject<ContractTask[]>;

    constructor(
        private readonly router: Router,
        private readonly tx: ContractCallService,
        private readonly contractsService: ContractsService) {

        this.task = new BehaviorSubject<ContractTask | undefined>(undefined);
        this.tasks = new BehaviorSubject<ContractTask[]>([]);

        this.emitter = new Subject<void>();
        this.emitter.subscribe(() => this.loadData());
        this.emitter.next();
    }

    public get asObservable(): Observable<ContractTask | undefined> {
        return this.task.asObservable();
    }

    public get dataObservable(): Observable<ContractTask[]> {
        return this.tasks.asObservable();
    }

    public updateCurrentTask(task: ContractTask) {
        this.task.next(task);
        this.router.navigate(["view-task"]);
    }

    public async updateTaskWithIndex(index:Number){
        const updatedTask = await this.getTask(index);
        this.task.next(updatedTask);
        const updateIndex = this.tasks.value.indexOf(this.tasks.value.filter(task=>task.index == index)[0]);
        this.tasks.value[updateIndex] = updatedTask;
        this.tasks.next(this.tasks.value);
    }

    public updateData(): void {
        this.emitter.next();
    }

    public async notifyDataIncrement(): Promise<void> {
        const newTask = await this.getTask(this.count);
        this.count = this.count + 1;
        this.tasks.next([...this.tasks.value, newTask]);
    }

    private async loadData(): Promise<void> {
        this.count = await this.tx.call<number>(this.contractsService.marketplaceContract, "tasksCount", []);

        const temp: ContractTask[] = [];
        for (let i = 0; i < this.count; i++) {
            const res = await this.getTask(i);
            temp.push(res);
        }
        this.tasks.next(temp);
    }

    private async getTask(index: Number): Promise<ContractTask> {
        return await this.tx.call<ContractTask>(this.contractsService.marketplaceContract, "tasks", [index])
    }
}