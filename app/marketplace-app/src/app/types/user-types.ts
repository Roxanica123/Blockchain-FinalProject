import {DomainExpertise, TaskState} from "./user-info"

export class Manager {
    name!: string;
    managerAddress!: string;
    exists!: boolean;
}

export class Freelancer {
    name!: string;
    domainExpertise!: string;
    reputation!: number;
    freelancerAddress!: string;
    exists!: boolean;
}

export class Evaluator {
    name!: string;
    domainExpertise!: string;
    evaluatorAddress!: string;
    exists!: boolean;
}

export class Investor {
    name!: string;
    investorAddress!: string;
    exists!: boolean;
}


export class ContractTask {

     description!: string;
     freelancerReward!: Number;
     evaluatorReward!: Number;
     currentFunding!: Number ;
     domainExpertise!: DomainExpertise;
     managerAddress!: string;
     evaluatorAddress!: string;
     freelancerAddress!: string;
     index!: Number;
     state!: TaskState;
     investorsCount!: Number;
     applicationsCount!: Number;
}