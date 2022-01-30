import {DomainExpertise, TaskState} from "./user-info"

export class Manager {
    name!: string;
    managerAddress!: string;
}

export class Freelancer {
    name!: string;
    domainExpertise!: string;
    reputation!: number;
    freelancerAddress!: string;
}

export class Evaluator {
    name!: string;
    domainExpertise!: string;
    evaluatorAddress!: string;
}

export class Investor {
    name!: string;
    investorAddress!: string;
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