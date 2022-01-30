// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./../token/MarketplaceToken.sol";

contract Marketplace {
    
    struct Manager{
        string name;
        address managerAddress;
        bool exists;
    }

    enum DomainExpertise {FRONTEND, BACKEND, WEB_DESIGN, NA}

    struct Freelancer{
        string  name;
        DomainExpertise domainExpertise;
        uint reputation;
        address freelancerAddress;
        bool exists;
    }
    struct Evaluator{
        string  name;
        DomainExpertise domainExpertise;
        address evaluatorAddress;
        bool exists;
    }
    struct Investor{
        string  name;
        address investorAddress;
        bool exists;
    }

    enum Role {INVESTOR, FREELANCER, EVALUATOR, MANAGER, OWNER, NONE}
    enum TaskState {WAITING_FOR_FUNDING, WAITING_FOR_EVALUATOR_ASSIGNMENT, FREELANCERS_APPLICATIONS, 
                    IN_PROGRESS, WAITING_FOR_APPR0VAL, WAITING_FOR_ARBITRAGE, APPROVED, REJECTED, DELETED}

    struct Task{
        string description;
        uint256 freelancerReward;
        uint256 evaluatorReward;
        uint256 currentFunding;
        DomainExpertise domainExpertise;
        address managerAddress;
        address evaluatorAddress;
        address freelancerAddress;
        uint256 index;
        TaskState state;
        uint256 investorsCount;
        uint256 applicationsCount;
    }

    struct TaskFunding{
        address investorAddress;
        uint amount;
    }

    mapping (address => Manager) public managers;
    mapping (address => Freelancer) public freelancers;
    mapping (address => Evaluator) public evaluators;
    mapping (uint256 => address) public evaluatorsAddresses;
    mapping (address => Investor) public investors;
    mapping (uint256 => Task) public tasks;
    mapping (uint256 => mapping(uint256 => TaskFunding)) public taskFundings;
    mapping (uint256 => mapping(uint256 => address)) public taskApplications;
    
    address private owner;
    uint256 public tasksCount;
    uint256 public evaluatorsCount;
    MarketplaceToken token;

    modifier onlyAdmin(){
        require(msg.sender == owner);
        _;
    }

    modifier onlyManager(){
        require(managers[msg.sender].exists == true);
        _;
    }

    modifier onlyFreelancer(){
        require(freelancers[msg.sender].exists == true);
        _;
    }

    modifier onlyEvaluator(){
        require(evaluators[msg.sender].exists == true);
        _;
    }

    modifier onlyInvestor(){
        require(investors[msg.sender].exists == true);
        _;
    }

    constructor(address _tokenContractAddress){
        owner = msg.sender;
        tasksCount = 0;
        evaluatorsCount = 0;
        token = MarketplaceToken(_tokenContractAddress);
    }

    function getUserRole(address _address) public view returns (Role){
        if(managers[_address].exists){
            return Role.MANAGER;
        }
        if(investors[_address].exists){
            return Role.INVESTOR;
        }
        if(evaluators[_address].exists){
            return Role.EVALUATOR;
        }
        if(freelancers[_address].exists){
            return Role.FREELANCER;
        }
        return Role.NONE;
    }

    function addManager (string calldata _name, address _address) external {
        require(managers[_address].exists == false);
        managers[_address] = Manager(_name, _address, true);
    }
    
    function addFreelancer (string calldata _name, DomainExpertise _domainExpertise, address _address) external {
        require(freelancers[_address].exists == false);
        freelancers[_address] = Freelancer(_name, _domainExpertise, 5, _address, true);
    }

    function addEvaluator (string calldata _name, DomainExpertise _domainExpertise, address _address) external {
        require(evaluators[_address].exists == false);
        evaluators[_address] = Evaluator(_name, _domainExpertise, _address, true);
        evaluatorsAddresses[evaluatorsCount] = _address;
        evaluatorsCount += 1;
    }

    function addInvestor (string calldata _name, address _address) external {
        require(investors[_address].exists == false);
        investors[_address] = Investor(_name, _address, true);
    }

    function createTask (string calldata _description, uint256 _freelancerReward, uint256 _evaluatorReward, DomainExpertise _domainExpertise) 
    external onlyManager(){
        tasks[tasksCount] = Task(_description, _freelancerReward, _evaluatorReward, 0, 
                                 _domainExpertise, msg.sender, address(0), address(0),
                                 tasksCount, TaskState.WAITING_FOR_FUNDING, 0, 0);
        tasksCount += 1;
    }

    function getRemainingNecessaryFundingForTask(uint256 _taskIndex) public view returns (uint256) {
        require(_taskIndex < tasksCount); 
        return tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward - tasks[_taskIndex].currentFunding;
    }

    function getTaskState(uint256 _taskIndex) public view returns (TaskState){
        require(_taskIndex < tasksCount); 
        return tasks[_taskIndex].state;
    }

    function fundTask (uint256 _taskIndex, uint256 _amount) 
    external payable onlyInvestor(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_FUNDING);
        require(_amount > 0);
        require(tasks[_taskIndex].currentFunding + _amount <= tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward);
        
        token.transferFrom(msg.sender, address(this), _amount);

        uint256 investorIndex = investorIndexForTask(_taskIndex, msg.sender);
        if(investorIndex == 0){
            taskFundings[_taskIndex][tasks[_taskIndex].investorsCount] = TaskFunding(msg.sender, _amount);
            tasks[_taskIndex].investorsCount += 1;
        }
        else{
            taskFundings[_taskIndex][investorIndex - 1].amount += _amount;
        }

        tasks[_taskIndex].currentFunding += _amount;
        if(tasks[_taskIndex].currentFunding == tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward){
            tasks[_taskIndex].state = TaskState.WAITING_FOR_EVALUATOR_ASSIGNMENT;
        }
    }  

    function investorIndexForTask(uint256 _taskIndex, address _investorAddress) public view returns (uint256){
        require(_taskIndex < tasksCount); 
        
        for (uint256 i = 1; i <= tasks[_taskIndex].investorsCount; i++) {
            if(taskFundings[_taskIndex][i-1].investorAddress == _investorAddress){
                return i;
            }
        }
        return 0;
    }

    function takeBackFunding (uint256 _taskIndex, uint256 _amount) 
    external onlyInvestor(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_FUNDING);
        require(_amount > 0);

        uint256 investorIndex= investorIndexForTask(_taskIndex, msg.sender);
        
        require(investorIndex!=0 && taskFundings[_taskIndex][investorIndex-1].amount >= _amount);
    
        token.approve(address(this), _amount);
        token.transferFrom(address(this), msg.sender, _amount);

        taskFundings[_taskIndex][investorIndex-1].amount -= _amount;

        tasks[_taskIndex].currentFunding -= _amount;
    }  

    function deteleTask (uint256 _taskIndex)
    external onlyManager(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_FUNDING);
        require(tasks[_taskIndex].managerAddress == msg.sender);

        for (uint256 i = 0; i < tasks[_taskIndex].investorsCount; i++) {

            if(taskFundings[_taskIndex][i].amount > 0){
                require(token.transferFrom(address(this), taskFundings[_taskIndex][i].investorAddress, taskFundings[_taskIndex][i].amount));
            }
        }

        tasks[_taskIndex].state = TaskState.DELETED;
    }

    function pickEvaluator (uint256 _taskIndex, address _evaluatorAddress)
    external onlyManager(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_EVALUATOR_ASSIGNMENT);
        require(tasks[_taskIndex].managerAddress == msg.sender);
        require(evaluators[_evaluatorAddress].exists);
        require(tasks[_taskIndex].domainExpertise == evaluators[_evaluatorAddress].domainExpertise);
        tasks[_taskIndex].evaluatorAddress = _evaluatorAddress;
        tasks[_taskIndex].state = TaskState.FREELANCERS_APPLICATIONS;
    }

    function pickFreelancer (uint256 _taskIndex, uint256 _applicationIndex)
    external onlyManager(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.FREELANCERS_APPLICATIONS);
        require(tasks[_taskIndex].managerAddress == msg.sender);
        require(tasks[_taskIndex].applicationsCount >= _applicationIndex);

        tasks[_taskIndex].freelancerAddress = taskApplications[_taskIndex][_applicationIndex];

        for (uint256 i = 0; i < tasks[_taskIndex].applicationsCount; i++) {
             token.approve(address(this), tasks[_taskIndex].evaluatorReward);
             require(token.transferFrom(address(this), taskApplications[_taskIndex][i], tasks[_taskIndex].evaluatorReward));
        }

        tasks[_taskIndex].freelancerAddress = taskApplications[_taskIndex][_applicationIndex];
        tasks[_taskIndex].state = TaskState.IN_PROGRESS;
    }

    function applyForATask(uint256 _taskIndex) 
    external payable onlyFreelancer(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.FREELANCERS_APPLICATIONS);
        require(tasks[_taskIndex].domainExpertise == freelancers[msg.sender].domainExpertise);
        require(freelancerAppliedForTask(_taskIndex, msg.sender) == false);
        require(token.transferFrom(msg.sender, address(this), tasks[_taskIndex].evaluatorReward));

        taskApplications[_taskIndex][tasks[_taskIndex].applicationsCount] = msg.sender;
        tasks[_taskIndex].applicationsCount += 1;
    }

    function declareTaskFinished(uint256 _taskIndex)
    external payable onlyFreelancer(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.IN_PROGRESS);
        require(tasks[_taskIndex].freelancerAddress == msg.sender);

        tasks[_taskIndex].state = TaskState.WAITING_FOR_APPR0VAL;       
    }

    function freelancerAppliedForTask(uint256 _taskIndex, address _freelancerAddress) private view returns (bool){
        require(_taskIndex < tasksCount); 
        
        for (uint256 i = 0; i < tasks[_taskIndex].applicationsCount; i++) {
            if(taskApplications[_taskIndex][i] == _freelancerAddress){
                return true;
            }
        }
        return false;
    }

    function approveTask(uint256 _taskIndex)
    external payable onlyManager(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_APPR0VAL);
        require(tasks[_taskIndex].managerAddress == msg.sender);

        uint256 amount = tasks[_taskIndex].evaluatorReward * 2 + tasks[_taskIndex].freelancerReward; 
        token.approve(address(this), amount);
        require(token.transferFrom(address(this), tasks[_taskIndex].freelancerAddress, amount));

        if(freelancers[tasks[_taskIndex].freelancerAddress].reputation < 10){
            freelancers[tasks[_taskIndex].freelancerAddress].reputation += 1;
        }
        tasks[_taskIndex].state = TaskState.APPROVED;       
    }

    function rejectTask(uint256 _taskIndex)
    external payable onlyManager(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_APPR0VAL, "The task is not waiting for approval");
        require(tasks[_taskIndex].managerAddress == msg.sender, "The task was created by you");

        tasks[_taskIndex].state = TaskState.WAITING_FOR_ARBITRAGE;       
    }

    function approveTaskInArbitrage(uint256 _taskIndex)
    external payable onlyEvaluator(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_ARBITRAGE);
        require(tasks[_taskIndex].evaluatorAddress == msg.sender);
        token.approve(address(this), tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward);
        require(token.transferFrom(address(this), tasks[_taskIndex].evaluatorAddress, tasks[_taskIndex].evaluatorReward));
        require(token.transferFrom(address(this), tasks[_taskIndex].evaluatorAddress, tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward));

        if(freelancers[tasks[_taskIndex].freelancerAddress].reputation < 10){
            freelancers[tasks[_taskIndex].freelancerAddress].reputation += 1;
        }
        tasks[_taskIndex].state = TaskState.APPROVED;        
    }

    function rejectTaskInArbitrage(uint256 _taskIndex)
    external payable onlyEvaluator(){
        require(_taskIndex < tasksCount); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_ARBITRAGE);
        require(tasks[_taskIndex].evaluatorAddress == msg.sender);

        token.approve(address(this), tasks[_taskIndex].evaluatorReward);
        require(token.transferFrom(address(this), tasks[_taskIndex].evaluatorAddress, tasks[_taskIndex].evaluatorReward));
        require(refundInvestors(_taskIndex));

        if(freelancers[tasks[_taskIndex].freelancerAddress].reputation > 0){
            freelancers[tasks[_taskIndex].freelancerAddress].reputation -= 1;
        }
        tasks[_taskIndex].state = TaskState.REJECTED;       
    }

    function refundInvestors(uint256 _taskIndex) private returns (bool){
        
        for (uint256 i = 0; i < tasks[_taskIndex].investorsCount; i++) {

            if(taskFundings[_taskIndex][i].amount > 0){
                token.approve(address(this), taskFundings[_taskIndex][i].amount);
                require(token.transferFrom(address(this), taskFundings[_taskIndex][i].investorAddress, taskFundings[_taskIndex][i].amount));
            }
        }
        return true;
    }

    function getEvaluatorByIndex(uint256 _evaluatorIndex) public view returns (Evaluator memory){
        return evaluators[evaluatorsAddresses[_evaluatorIndex]];
    }

}
