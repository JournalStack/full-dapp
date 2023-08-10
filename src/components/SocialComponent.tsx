import { useState, useEffect } from "react";
import {
  useSocialMediaAddPost,
  usePrepareSocialMediaAddPost,
  useSocialMediaLikePost,
  usePrepareSocialMediaLikePost,
  useSocialMediaPosts
} from "../generated";

export function SocialComponent() {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<string[]>([]); // State to hold the posts

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
        {content}
      </div>
    );
  };


  return (
    <div>
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
      <style>{`
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
          right: 5px;
        }
      `}</style>
    </div>
  );
}
