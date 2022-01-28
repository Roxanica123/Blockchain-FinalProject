import { Injectable } from "@angular/core";
import { delay } from "rxjs";
import { UserInfo, USER_STATICS } from "../types/user-info";
import { SnackService } from "./snack.service";
import { UserService } from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class ContractCallService {


    constructor(
        private readonly snackService: SnackService) {
    }

    public async call<T>(contract: any, method: string, methodArguments: any[]): Promise<T> {
        try {
            console.log(contract.methods)
            return await this.TryThreeTimes(async () => await contract.methods[method](...methodArguments).call());
        }
        catch (err: any) {
            console.log(err);
            if (err.message !== null && err.message !== undefined) {
                this.snackService.error(err.message);
            }
            else {
                this.snackService.error("Unexpected error")
            }

            throw err;
        }
    }

    public async send(contract: any, method: string, methodArguments: any[], fromAddress: string): Promise<void> {
        try {
            await this.TryThreeTimes(async () => await contract.methods[method](...methodArguments).send({ from: fromAddress }));
        }
        catch (err: any) {
            console.log(err);
            if (err.message !== null && err.message !== undefined) {
                this.snackService.error(err.message);
            }
            else {
                this.snackService.error("Unexpected error")
            }

            throw err;
        }
    }

    private async TryThreeTimes<T>(func: Function): Promise<T> {
        let err;
        for (let i = 0; i < 3; i++) {
            try {
                const result = await func();
                return result;
            }
            catch (incomingError) {
                err = incomingError;
                await delay(500);
            }
        }

        throw err;
    }
}