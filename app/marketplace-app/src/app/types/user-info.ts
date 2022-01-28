export enum Role {
    INVESTOR, FREELANCER, EVALUATOR, MANAGER, OWNER, NONE, UNAUTHORIZED
}

export enum DomainExpertise {
    FRONTEND, BACKEND, WEB_DESIGN, NA
};

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