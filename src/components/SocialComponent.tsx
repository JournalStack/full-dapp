import React, { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import axios from 'axios';

import {
  useSocialMediaAddPost,
  usePrepareSocialMediaAddPost,
  useSocialMediaLikePost,
  usePrepareSocialMediaLikePost,
  useSocialMediaPosts,
  useSocialMediaPostCount
} from "../generated";

const COVALENT_API_KEY = 'cqt_rQWjrCJbM99V9Kw6TTDFjDtJqmtk';
const COVALENT_API_URL = 'https://api.covalenthq.com/v1';

const supportedChains = [
  'optimism-goerli',
  'optimism-mainnet',
  'base-testnet',
  'base-mainnet',
  'zora-testnet',
  'zora-mainnet',
  'eth-goerli',
  'eth-mainnet',
  'matic-mumbai',
  'matic-mainnet',
  'bsc-testnet',
  'bsc-mainnet',
  'avalanche-testnet',
  'avalanche-mainnet',
  // Add other supported chain names here
];

export function SocialComponent() {
  const accountHookResult = useAccount();
  const walletAddress = accountHookResult.address;
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<string[]>([]); // State to hold the posts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostUsedChain, setMostUsedChain] = useState('');
  const [transactionCount, setTransactionCount] = useState(0);
  const [isQuickProfileOpen, setIsQuickProfileOpen] = useState(false);


  const { config } = usePrepareSocialMediaAddPost({
    args: [postContent],
  });

  const { write } = useSocialMediaAddPost({
    ...config,
    onSuccess: (transaction) => {
      console.log("Transaction initiated.", transaction);
      setPosts([...posts, postContent]); // Add the post to the posts array
      setPostContent(""); // Clear the input field
    },
  });

  const handlePostContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostContent(event.target.value);
  };

  const handleCommit = async () => {
    if (write) {
      const transactionResult = write();
      console.log("Transaction sent. Transaction details:", transactionResult);
    }

  };

  const handleQuickProfileOpen = () => {
    setIsQuickProfileOpen(true);
  };

  const handleQuickProfileClose = () => {
    setIsQuickProfileOpen(false);
  };


  // Prepare the likePost transaction
  const { config: likePostConfig } = usePrepareSocialMediaLikePost();
  // Execute the likePost transaction
  const { write: likePostWrite } = useSocialMediaLikePost(likePostConfig);

  // Separate component for individual post
  function Post({ content, postId }: { content: string; postId: number }) {
    const [liked, setLiked] = useState(false);

    const { config: likePostConfig } = usePrepareSocialMediaLikePost({
      args: [BigInt(postId)],
    });

    const { write: likePostWrite } = useSocialMediaAddPost({
      ...config,
      onSuccess: (transaction) => {
        console.log("Like Transaction initiated.", transaction);
      },
    });

    const handleLike = () => {
      if (likePostWrite) {
        const result = likePostWrite();
        console.log("Transaction result:", result);
        setLiked(true);
      }
    };

    // Use the hook to query the specific post by its ID
    const { data: postData } = useSocialMediaPosts({
      args: [BigInt(postId)], // Convert to BigInt if needed
    });

    // Use the useEffect hook to respond to changes in the "liked" state
    useEffect(() => {
      if (liked) {
        // Extract the likes count
        const likesCount = postData ? postData[2] : undefined;

        // Log the likes count
        console.log("Likes count for the liked post:", likesCount);
      }
    }, [liked, postData]);


    return (
      <div className="post">
        <button onClick={() => handleLike()} className="like-button">
          Like
        </button>

        <div className="most-used-chain-badge">
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {mostUsedChain && <p>User {walletAddress} Most used chain: {mostUsedChain} , Total Transactions: {transactionCount} </p>}
        </div>
        {content}
      </div>
    );
  }


  // Hook to get postCount
  const { data: postCount } = useSocialMediaPostCount();

  useEffect(() => {
    if (postCount !== undefined) {
      console.log("Post count from the smart contract:", postCount);
    }
  }, [postCount]);

  useEffect(() => {
    const calculateMostUsedChain = async () => {
      try {
        let highestTransactionCount = 0;
        let mostUsedChainName = '';

        for (const chain of supportedChains) {
          try {
            const transactionsSummaryResponse = await axios.get(
              `${COVALENT_API_URL}/${chain}/address/${walletAddress}/transactions_summary/?key=${COVALENT_API_KEY}`
            );

            const transactionCount =
              transactionsSummaryResponse.data.data.items[0]?.total_count || 0;

            if (transactionCount > highestTransactionCount) {
              highestTransactionCount = transactionCount;
              console.log(transactionCount);
              mostUsedChainName = chain;
            }
          } catch (error) {
            console.error(`Failed to get transactions summary for ${chain}:`, error);
          }
        }

        setMostUsedChain(mostUsedChainName);
        setTransactionCount(highestTransactionCount);
      } catch (error) {
        console.error('Failed to get Transaction Summaries:', error);
        setError('An error occurred while fetching data.');
      }
      setLoading(false);
    };

    setLoading(true);
    calculateMostUsedChain();
  }, [walletAddress]);


  return (
    <div className="social-component">
      <input
        type="text"
        value={postContent}
        onChange={handlePostContentChange}
        placeholder="...Update everyone! ..."
      />
      <button onClick={handleCommit}>Commit</button>
      <div className="posts-container">
        {posts.map((post, index) => (
          <Post key={index} content={post} postId={index} />
        ))}
      </div>
      <style>
        {`
        .posts-container {
          margin-top: 20px;
        }
        .post {
          border: 1px solid #ccc;
          padding: 10px;
          margin: 5px 0;
          background-color: #f9f9f9;
          position: relative;
        }
        .like-button {
          position: absolute;
          top: 5px;
          right: 50px;
        }
        .quick-profile-button {
          position: absolute;
          top: 5px;
          right: 5px;
        }
        .most-used-chain-badge {
          margin-top: 20px;
        }
      `}
      </style>
    </div>
  );
}

export default SocialComponent;
