// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract SocialMedia {
  struct PostStruct {
    string content;
    address owner;
    uint256 likes;
  }

  mapping(uint256 => PostStruct) public posts;
  uint256 public postCount;

  function addPost(string memory _content) public {
    postCount++;
    posts[postCount] = PostStruct(_content, msg.sender, 0);
  }

  function likePost(uint256 _postId) public {
    //where do you get the postid from
    require(posts[_postId].owner != address(0), "Post does not exist");
    posts[_postId].likes++;
  }
}
