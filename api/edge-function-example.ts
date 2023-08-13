import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Provider, Wallet } from "ethers";
import crypto from "crypto";
export const config = {
  runtime: "edge",
};

export function getSHA256Hash(data: any): string {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(data));
  return hash.digest("hex");
}

interface PostLiked {
  likeGiver: string;
}

interface PostLikedsData {
  postLikeds: PostLiked[];
}

async function fetchPostLikeds(likeGiver: string): Promise<PostLiked[]> {
  const response = await fetch(
    "https://api.thegraph.com/subgraphs/name/creedscode/jorunalstack",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query giveLike {
            postLikeds(
              where: {likeGiver: "${likeGiver}"}
              first: 1
            ) {
              likeGiver
            }
          }
        `,
      }),
    },
  );
  const data = await response.json();
  return data.data?.postLikeds ?? [];
}
export async function getDelegationSigner(
  res: Response,
): Promise<Wallet | null> {
  const provider = new Provider.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BACKEND_RPC_SEPOLIA_URL,
  );
  const delegateSeedPhrase = process.env.NEXT_PRIVATE_DELEGATE_SEED_PHRASE;

  if (!delegateSeedPhrase) {
    res.status(500).json("Delegate seed phrase is not set");
    return null;
  }

  const signer = Wallet.fromMnemonic(delegateSeedPhrase).connect(provider);

  return signer;
}
export default async function handler(request: Request, response: Response) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const cookies = request.headers.get("cookie");
  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = null;
  }

  // Hash the data
  const hashedData = getSHA256Hash(await fetchPostLikeds(query["wallet"]));
  console.log("hashedData", hashedData);

  try {
    const schemaEncoder = new SchemaEncoder("string dataHash");
    console.log("schemaEncoder", schemaEncoder);

    const encoded = schemaEncoder.encodeData([
      { name: "dataHash", type: "string", value: hashedData },
    ]);

    const signer = await getDelegationSigner(response);
    if (!signer) {
      return;
    }
    console.log("signer", signer);

    eas.connect(signer);

    const recipient = userAddress;
    console.log("recipient", recipient);

    const tx = await eas.attest({
      data: {
        recipient: recipient,
        data: encoded,
        refUID: ethers.constants.HashZero,
        revocable: true,
        expirationTime: 0,
      },
      schema: CUSTOM_SCHEMAS.GITHUB_SCHEMA,
    });
    console.log("tx", tx);

    const uid = await tx.wait();
    console.log("uid", uid);

    const attestation = await getAttestation(uid);
    console.log("attestation", attestation);

    return new Response(
      JSON.stringify({
        body,
        query,
        cookies,
        data: { recipient: recipient, uid: "uid" },
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("errorDebug", error);
    return new Response(
      JSON.stringify({
        body,
        query,
        cookies,
        data: "certificate creation failed",
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }
}

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { ethers } from "ethers";
import axios from "axios";

export const alchemyApiKey = process.env.VITE_ALCHEMY_API_KEY;

export const CUSTOM_SCHEMAS = {
  FIRSTLIKE:
    "0x04e786c276457b4045eca31a80dababf3a3288ed250ff3ab4bf54aec6b3ce709",
};

dayjs.extend(duration);
dayjs.extend(relativeTime);

function getChainId() {
  return Number(process.env.NEXT_SEPOLIA_CHAIN_ID);
}

// export const CHAINID = getChainId();
export const CHAINID = 11155111;

// if (!CHAINID) {
//   throw new Error('No chain ID env found');
// }

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
  {
    chainId: 11155111,
    chainName: "sepolia",
    subdomain: "sepolia.",
    version: "0.26",
    contractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    etherscanURL: "https://sepolia.etherscan.io",
    contractStartBlock: 2958570,
    rpcProvider: `https://sepolia.infura.io/v3/`,
  },
];

export const activeChainConfig = EAS_CHAIN_CONFIGS.find(
  (config) => config.chainId === CHAINID,
);

export const baseURL = `https://${activeChainConfig!.subdomain}easscan.org`;

if (!activeChainConfig) {
  throw new Error("No active chain config found");
}

export const EASContractAddress = activeChainConfig.contractAddress;

export const EASVersion = activeChainConfig.version;

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: CHAINID,
};

export const timeFormatString = "MM/DD/YYYY h:mm:ss a";
export async function getAddressForENS(name: string) {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_INFURA_ID}`,
    "mainnet",
  );

  return await provider.resolveName(name);
}
export async function getENSName(address: string) {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_INFURA_ID}`,
    "mainnet",
  );
  return await provider.lookupAddress(address);
}
export async function getAttestation(uid: string): Promise<Attestation | null> {
  const response = await axios.post<AttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Query($where: AttestationWhereUniqueInput!) {\n  attestation(where: $where) {\n    id\n    attester\n    recipient\n    revocationTime\n    expirationTime\n    time\n    txid\n    data\n  }\n}",
      variables: {
        where: {
          id: uid,
        },
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.attestation;
}
export async function getAttestationsForAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: [
              CUSTOM_SCHEMAS.GITHUB_SCHEMA,
              CUSTOM_SCHEMAS.WORLDCOIN_SCHEMA,
            ],
          },
          OR: [
            {
              attester: {
                equals: address,
              },
            },
            {
              recipient: {
                equals: address,
              },
            },
          ],
        },
        orderBy: [
          {
            time: "desc",
          },
        ],
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.attestations;
}
export async function getConfirmationAttestationsForUIDs(refUids: string[]) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  refUID\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: [
              CUSTOM_SCHEMAS.GITHUB_SCHEMA,
              CUSTOM_SCHEMAS.WORLDCOIN_SCHEMA,
            ],
          },
          refUID: {
            in: refUids,
          },
        },
        orderBy: [
          {
            time: "desc",
          },
        ],
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.attestations;
}
export async function getENSNames(addresses: string[]) {
  const response = await axios.post<EnsNamesResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Query($where: EnsNameWhereInput) {\n  ensNames(where: $where) {\n    id\n    name\n  }\n}",
      variables: {
        where: {
          id: {
            in: addresses,
            mode: "insensitive",
          },
        },
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.ensNames;
}
export type EASChainConfig = {
  chainId: number;
  chainName: string;
  version: string;
  contractAddress: string;
  schemaRegistryAddress: string;
  etherscanURL: string;
  /** Must contain a trailing dot (unless mainnet). */
  subdomain: string;
  contractStartBlock: number;
  rpcProvider: string;
};

export interface AttestationResult {
  data: Data;
}

export interface MyAttestationResult {
  data: MyData;
}

export interface EnsNamesResult {
  data: {
    ensNames: { id: string; name: string }[];
  };
}

export interface Data {
  attestation: Attestation | null;
}

export interface MyData {
  attestations: Attestation[];
}

export interface Attestation {
  id: string;
  schemaId: string;
  schemaName: string;
  attester: string;
  recipient: string;
  refUID: string;
  revocationTime: number;
  expirationTime: number;
  time: number;
  txid: string;
  data: string;
}

export type ResolvedAttestation = Attestation & {
  name: string;
  confirmation?: Attestation;
};
