import { IPFSHTTPClient, create } from "ipfs-http-client";

export const postToIPFS = async (data: any): Promise<string> => {
  let ipfs: IPFSHTTPClient | undefined;
  let cid = "";

  try {
    const authorization =
      "Basic " +
      btoa(
        import.meta.env.VITE_INFURA_ID +
          ":" +
          import.meta.env.VITE_INFURA_SECRET,
      );
    ipfs = create({
      url: import.meta.env.VITE_IPFS_ENDPOINT,
      headers: {
        authorization,
      },
    });
    const result = await (ipfs as IPFSHTTPClient).add(data);
    cid = `${result.path}`;
  } catch (error) {
    console.error("IPFS error ", error);
  }
  return cid;
};

export const readMessageFromIpfs = async (cid: string): Promise<any> => {
  if (cid === "") return "no cid";
  try {
    const response = await fetch(import.meta.env.VITE_IPFS_BASE_URL + cid);
    const responseObject = await response.json();
    return responseObject.postContent;
  } catch (error) {
    console.error("IPFS error ", error);
    return "IPFS Error content: " + cid;
  }
};
