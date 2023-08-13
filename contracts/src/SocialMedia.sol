// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract SocialMedia {
  struct PostStruct {
    uint id;
    string content;
    address owner;
    uint256 likes;
  }

  mapping(uint256 => PostStruct) public posts;
  uint256 public postCount;

  event PostCreated(
    uint id,
    string content,
    address owner,
    uint256 likes
  );

  event PostLiked (
    uint postId,
    address postOwner,
    address likeGiver
  );

  function addPost(string memory _content) public {
    postCount++;
    posts[postCount] = PostStruct( postCount,_content, msg.sender, 0);
    emit PostCreated(postCount, _content, msg.sender, 0);
  }

  function likePost(uint256 _postId) public {
    require(posts[_postId].owner != address(0), "Post does not exist");
    posts[_postId].likes++;
    emit PostLiked(_postId, posts[_postId].owner, msg.sender);
  }
}
