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

    mapping (address => Manager) private managers;
    mapping (address => Freelancer) private freelancers;
    mapping (address => Evaluator) private evaluators;
    mapping (address => Investor) private investors;
    mapping (uint256 => Task) private tasks;
    mapping (uint256 => mapping(uint256 => TaskFunding)) private taskFundings;
    mapping (uint256 => mapping(uint256 => address)) private taskApplications;
    
    address private owner;
    uint256 private tasksCount;
    MarketplaceToken token;

    modifier onlyAdmin(){
        require(msg.sender == owner, "Only admin");
        _;
    }

    modifier onlyManager(){
        require(managers[msg.sender].exists == true, "Only manager");
        _;
    }

    modifier onlyFreelancer(){
        require(freelancers[msg.sender].exists == true, "Only freelancers");
        _;
    }

    modifier onlyEvaluator(){
        require(evaluators[msg.sender].exists == true, "Only evaluators");
        _;
    }

    modifier onlyInvestor(){
        require(investors[msg.sender].exists == true, "Only investors");
        _;
    }

    constructor(address _tokenContractAddress){
        owner = msg.sender;
        tasksCount = 0;
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
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        return tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward - tasks[_taskIndex].currentFunding;
    }

    function getTaskState(uint256 _taskIndex) public view returns (TaskState){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        return tasks[_taskIndex].state;
    }

    function fundTask (uint256 _taskIndex, uint256 _amount) 
    external payable onlyInvestor(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_FUNDING, "Task does not accept funding");
        require(_amount > 0, "You have to invest something tho");
        require(tasks[_taskIndex].currentFunding + _amount > tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward);
        
        //?require(token.approve(msg.sender, _amount));
        require(token.transferFrom(msg.sender, address(this), _amount));

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

    function investorIndexForTask(uint256 _taskIndex, address _investorAddress) private view returns (uint256){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        
        for (uint256 i = 1; i <= tasks[_taskIndex].investorsCount; i++) {
            if(taskFundings[_taskIndex][i-1].investorAddress == _investorAddress){
                return i;
            }
        }
        return 0;
    }

    function takeBackFunding (uint256 _taskIndex, uint256 _amount) 
    external onlyInvestor(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_FUNDING, "Cannot take back funds anymore");
        require(_amount > 0, "You have to take back something");

        uint256 investorIndex= investorIndexForTask(_taskIndex, msg.sender);
        
        require(investorIndex!=0 && taskFundings[_taskIndex][investorIndex].amount >= _amount, "You did not contributed with that");
        
        //?require(token.approve(msg.sender, _amount));
        require(token.transferFrom(address(this), msg.sender, _amount));

        taskFundings[_taskIndex][investorIndex].amount -= _amount;

        tasks[_taskIndex].currentFunding -= _amount;
    }  

    function deteleTask (uint256 _taskIndex)
    external onlyManager(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_FUNDING, "Cannot take back funds anymore");
        require(tasks[_taskIndex].managerAddress == msg.sender, "You did not create this task");

        for (uint256 i = 0; i < tasks[_taskIndex].investorsCount; i++) {

            if(taskFundings[_taskIndex][i].amount > 0){
                require(token.transferFrom(address(this), taskFundings[_taskIndex][i].investorAddress, taskFundings[_taskIndex][i].amount));
            }
        }

        tasks[_taskIndex].state = TaskState.DELETED;

    }

    function pickEvaluator (uint256 _taskIndex, address _evaluatorAddress)
    external onlyManager(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_EVALUATOR_ASSIGNMENT, "Cannot pick evaluator now");
        require(tasks[_taskIndex].managerAddress == msg.sender, "You did not create this task");
        require(evaluators[_evaluatorAddress].exists, "Evaluator does not exist");
        require(tasks[_taskIndex].domainExpertise == evaluators[_evaluatorAddress].domainExpertise);
        tasks[_taskIndex].evaluatorAddress = _evaluatorAddress;
        tasks[_taskIndex].state = TaskState.FREELANCERS_APPLICATIONS;
    }

    function pickFreelancer (uint256 _taskIndex, uint256 _applicationIndex)
    external onlyManager(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.FREELANCERS_APPLICATIONS, "Cannot pick freelancer now");
        require(tasks[_taskIndex].managerAddress == msg.sender, "You did not create this task");
        require(tasks[_taskIndex].applicationsCount >= _applicationIndex , "Freelancer does not exist");

        tasks[_taskIndex].freelancerAddress = taskApplications[_taskIndex][_applicationIndex];

        for (uint256 i = 0; i < tasks[_taskIndex].applicationsCount; i++) {
             require(token.transferFrom(address(this), taskApplications[_taskIndex][i], tasks[_taskIndex].evaluatorReward));
        }

        tasks[_taskIndex].freelancerAddress = taskApplications[_taskIndex][_applicationIndex];
        tasks[_taskIndex].state = TaskState.IN_PROGRESS;
    }

    function applyForATask(uint256 _taskIndex) 
    external payable onlyFreelancer(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.FREELANCERS_APPLICATIONS, "Cannot pick evaluator now");
        require(tasks[_taskIndex].domainExpertise == freelancers[msg.sender].domainExpertise, "Not your domain of expertise");
        require(freelancerAppliedForTask(_taskIndex, msg.sender) == false, "Already applied");
        require(token.transferFrom(msg.sender, address(this), tasks[_taskIndex].evaluatorReward));

        taskApplications[_taskIndex][tasks[_taskIndex].applicationsCount] = msg.sender;
        tasks[_taskIndex].applicationsCount += 1;
    }

    function declareTaskFinished(uint256 _taskIndex)
    external payable onlyFreelancer(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.IN_PROGRESS, "The task was not in progres");
        require(tasks[_taskIndex].freelancerAddress == msg.sender, "The task was not assigned to you");

        tasks[_taskIndex].state = TaskState.WAITING_FOR_APPR0VAL;       
    }

    function freelancerAppliedForTask(uint256 _taskIndex, address _freelancerAddress) private view returns (bool){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        
        for (uint256 i = 0; i < tasks[_taskIndex].applicationsCount; i++) {
            if(taskApplications[_taskIndex][i] == _freelancerAddress){
                return true;
            }
        }
        return false;
    }

    function approveTask(uint256 _taskIndex)
    external payable onlyManager(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_APPR0VAL, "The task is not waiting for approval");
        require(tasks[_taskIndex].managerAddress == msg.sender, "The task was created by you");

        uint256 amount = tasks[_taskIndex].evaluatorReward * 2 + tasks[_taskIndex].freelancerReward; 
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
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_ARBITRAGE, "The task is not waiting for approval");
        require(tasks[_taskIndex].evaluatorAddress == msg.sender, "You are not the assigned evaluator");

        require(token.transferFrom(address(this), tasks[_taskIndex].evaluatorAddress, tasks[_taskIndex].evaluatorReward));
        require(token.transferFrom(address(this), tasks[_taskIndex].evaluatorAddress, tasks[_taskIndex].evaluatorReward + tasks[_taskIndex].freelancerReward));

        if(freelancers[tasks[_taskIndex].freelancerAddress].reputation < 10){
            freelancers[tasks[_taskIndex].freelancerAddress].reputation += 1;
        }
        tasks[_taskIndex].state = TaskState.APPROVED;        
    }

    function rejectTaskInArbitrage(uint256 _taskIndex)
    external payable onlyEvaluator(){
        require(_taskIndex < tasksCount, "Task index does not exist"); 
        require(tasks[_taskIndex].state == TaskState.WAITING_FOR_ARBITRAGE, "The task is not waiting for approval");
        require(tasks[_taskIndex].evaluatorAddress == msg.sender, "You are not the assigned evaluator");
        
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
                require(token.transferFrom(address(this), taskFundings[_taskIndex][i].investorAddress, taskFundings[_taskIndex][i].amount));
            }
        }
        return true;

    }

    
}
