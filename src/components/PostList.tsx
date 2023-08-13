import { Box, Button, Flex, Spacer, Stack, Text } from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import React, { useState, useEffect } from "react";
import {
  usePrepareSocialMediaLikePost,
  useSocialMediaLikePost,
  useSocialMediaPostCount,
  useSocialMediaRead,
} from "../generated";
import { readMessageFromIpfs } from "../utils/ipfs";

export function PostList() {
  const { data: postCount } = useSocialMediaPostCount();

  if (!postCount) return <Text>No Posts</Text>;
  return (
    <Stack spacing={6}>
      {Array.from({ length: postCount ? Number(postCount) : 0 }, (_, i) => {
        return <PostElement key={i} postId={i + 1} />;
      })}
    </Stack>
  );
}

interface Props {
  postId: number;
}

function PostElement({ postId }: Props) {
  const [content, setContent] = useState("");
  const { data: post } = useSocialMediaRead({
    functionName: "posts",
    args: [BigInt(postId)],
  });

  useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    async function getContent() {
      const content = post?.at(1)?.toString() || "";
      // const content = await readMessageFromIpfs(post?.at(1)?.toString() || "");
      setContent(content);
    }

    // You need to restrict it at some point
    // This is just dummy code and should be replaced by actual
    if (!content && post) {
      getContent();
    }
  }, [post]);

  const { config: socialMediLikePostConfig } = usePrepareSocialMediaLikePost({
    args: [BigInt(postId)],
  });

  const { write: socialMediaLikePost } = useSocialMediaLikePost({
    ...socialMediLikePostConfig,
    onSuccess: (transaction) => {
      console.log("Transaction initiated.", transaction);
    },
  });

  const submitLike = () => {
    if (socialMediaLikePost) {
      const result = socialMediaLikePost();
      console.log("Transaction sent. Transaction details:", result);
    }
  };

  return (
    <>
      {post ? (
        <Box boxShadow={"base"} p={"6"} rounded={"md"} padding={6}>
          <Stack direction={"row"}>
            <Text>{post.at(2)?.toString()}</Text>
            <Spacer />
            <Flex justifyContent="flex-end">
              <Button
                rightIcon={<StarIcon />}
                colorScheme="red"
                variant="outline"
                onClick={submitLike}
              >
                {post.at(3)?.toString()}
              </Button>
            </Flex>
          </Stack>
          <Text>{post.at(1)?.toString() || ""}</Text>
          <Text>{content}</Text>
        </Box>
      ) : (
        <p>loading post</p>
      )}
    </>
  );
}
