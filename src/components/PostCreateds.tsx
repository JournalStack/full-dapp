import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";

interface PostCreated {
  id: string;
  content: string;
  likes: string;
}

interface PostCreatedsData {
  postCreateds: PostCreated[];
}

function PostCreateds() {
  const [postCreateds, setPostCreateds] = useState<PostCreated[]>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("https://api.thegraph.com/subgraphs/name/creedscode/jorunalstack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          {
            postCreateds(sortDirection: DESC, limit: 10) {
              id
              content
              likes
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((data: { data?: PostCreatedsData }) => {
        if (data.data) {
          setPostCreateds(data.data.postCreateds);
        }
      });
  }, []);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Top Post</Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>TOP post on Optimism Goerli</ModalHeader>
          <ModalBody>
            {postCreateds ? (
              postCreateds.map((post) => (
                <div key={post.id}>
                  <h2>{post.content}</h2>
                  <p>Likes: {post.likes}</p>
                </div>
              ))
            ) : (
              <p>loading</p>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default PostCreateds;
