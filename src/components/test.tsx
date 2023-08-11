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
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { StarIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { postToIPFS, readMessageFromIpfs } from "../utils/ipfs";

export default function Test() {
  const { isConnected } = useAccount();
  const [commitMessage, setCommitMessage] = useState("");
  const submitCommit = async () => {
    if (isConnected) {
      const cid = await postToIPFS(
        JSON.stringify({
          postContent: commitMessage,
        }),
      );

      console.log(
        await readMessageFromIpfs(cid),
        "this is what the CID in IPFS states",
      );
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
          <Stack spacing={6}>
            {[
              {
                id: 1,
                addy: "0xAe46E37B5628947aC159F001a847E87452175D99",
                content: "ipfs uri",
                likes: 3,
              },
              {
                id: 1,
                addy: "0xAe46E37B5628947aC159F001a847E87452175D99",
                content: "ipfs uri",
                likes: 3,
              },
              {
                id: 1,
                addy: "0xAe46E37B5628947aC159F001a847E87452175D99",
                content: "ipfs uri",
                likes: 3,
              },
              {
                id: 1,
                addy: "0xAe46E37B5628947aC159F001a847E87452175D99",
                content: "ipfs uri",
                likes: 3,
              },
              {
                id: 1,
                addy: "0xAe46E37B5628947aC159F001a847E87452175D99",
                content: "ipfs uri",
                likes: 3,
              },
            ].map((e) => {
              return (
                <Box
                  boxShadow={"base"}
                  p={"6"}
                  rounded={"md"}
                  padding={6}
                  key={e.id}
                >
                  <Stack direction={"row"}>
                    <Text>{e.addy}</Text>
                    <Spacer />
                    <Flex justifyContent="flex-end">
                      <Button
                        isDisabled={!isConnected}
                        rightIcon={<StarIcon />}
                        colorScheme="red"
                        variant="outline"
                      >
                        {e.likes}
                      </Button>
                    </Flex>
                  </Stack>
                  <Text>{e.content}</Text>
                </Box>
              );
            })}
          </Stack>

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
