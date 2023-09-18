// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserInfo {
    struct User {
        string name;
        string photo;
        string bio;
    }

    mapping(address => User) public users;

    event UserAdded(address indexed userAddress, string name, string photo, string bio);

    function addUser(string memory _name, string memory _photo, string memory _bio) public {
        User storage newUser = users[msg.sender];
        newUser.name = _name;
        newUser.photo = _photo;
        newUser.bio = _bio;
        emit UserAdded(msg.sender, _name, _photo, _bio);
    }

    function getUserInfo(address _userAddress) public view returns (string memory, string memory, string memory) {
        User storage user = users[_userAddress];
        return (user.name, user.photo, user.bio);
    }
}
