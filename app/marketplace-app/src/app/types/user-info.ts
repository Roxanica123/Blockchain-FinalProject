export enum Role {
    INVESTOR, FREELANCER, EVALUATOR, MANAGER, OWNER, NONE, UNAUTHORIZED
}

export enum DomainExpertise {
    FRONTEND, BACKEND, WEB_DESIGN, NA
};

export enum TaskState {WAITING_FOR_FUNDING, WAITING_FOR_EVALUATOR_ASSIGNMENT, FREELANCERS_APPLICATIONS, 
    IN_PROGRESS, WAITING_FOR_APPR0VAL, WAITING_FOR_ARBITRAGE, APPROVED, REJECTED, DELETED}

export interface UserInfo {
    [key: string]: any;
    address: string;
    role: Role;
    name: string;
    domainExpertise?: string;
    reputation?: number;
}

export class USER_STATICS {
    public static EMPTY_USER: UserInfo = { address: "", role: Role.UNAUTHORIZED, name: "" };

}