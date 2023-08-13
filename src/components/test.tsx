import {
  Box,
  Button,
  Container,
  Flex,
  Spacer,
  Stack,
  TableContainer,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { postToIPFS, readMessageFromIpfs } from "../utils/ipfs";
import {
  useSocialMediaRead,
  usePrepareSocialMediaAddPost,
  usePrepareSocialMediaLikePost,
  useSocialMediaAddPost,
  useSocialMediaLikePost,
  useSocialMediaPosts,
  useSocialMediaPostCount,
} from "../generated";
import { PostList } from "./PostList";

export default function Test() {
  const { address, isConnected } = useAccount();

  const [posts, setPosts] = useState<String[]>([]);

  const [selectedPostId, setSelectedPostId] = useState<bigint>(BigInt(0));
  // TODO: const toast = useToast();

  const [commitMessage, setCommitMessage] = useState("");
  const [postUri, setPostUri] = useState("");
  const { config: socialMediaAddPostConfig, refetch: refetchPostConfig } =
    usePrepareSocialMediaAddPost({
      args: [postUri],
    });

  const { write: socialMediaAddPost } = useSocialMediaAddPost({
    ...socialMediaAddPostConfig,
    onSuccess: (transaction) => {
      console.log("Transaction initiated.", transaction);
    },
  });

  const submitCommit = async () => {
    if (isConnected) {
      const cid = await postToIPFS(
        JSON.stringify({
          postContent: commitMessage,
        }),
      );
      setPostUri(cid);
      if (socialMediaAddPost) {
        refetchPostConfig();
        console.log(socialMediaAddPostConfig, "ASDASDA", cid);
        const result = await socialMediaAddPost();
        console.log("Transaction sent. Transaction details:", result);
      }
    }
  };

  return (
    <>
      <Box h="78vh" overflowY="scroll" alignItems="center">
        <Container pt="8" maxW="container.md">
          <Text pb={4} fontSize={"6xl"} fontWeight={600}>
            JournalStack
          </Text>
          <Stack pb={12} direction={"row"}>
            <ConnectButton showBalance={false} />
            <Spacer />
            <Flex alignItems="center" justifyContent="flex-end">
              {isConnected ? <Text>You got a total of 12 stars!</Text> : null}
            </Flex>
          </Stack>
          {isConnected ? <PostList /> : <Text>Connect first!</Text>}
          <Container
            position="fixed"
            bottom="0"
            maxW="container.sm"
            backgroundColor={"white"}
          >
            <Box>
              <Stack>
                <Textarea
                  isDisabled={!isConnected}
                  placeholder="Share what ever you did today!"
                  size="lg"
                  onChange={(event) =>
                    setCommitMessage(event.currentTarget.value)
                  }
                />
                <Flex marginBottom={3} justifyContent="flex-end">
                  <Button
                    isDisabled={!isConnected}
                    colorScheme="blue"
                    maxW={"20%"}
                    onClick={submitCommit}
                  >
                    commit
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Container>
        </Container>
      </Box>
    </>
  );
}
