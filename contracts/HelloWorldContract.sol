// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// this contract only shows you how to use it. It is not part of the project and will later be deleted!
contract HelloWorldContract {
    string private message;
    constructor(string memory _message){
        message = _message;
    }
    function setMessage(string memory _newMessage) public {
        message = _newMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
