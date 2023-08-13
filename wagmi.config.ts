import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import * as chains from "wagmi/chains";
import { ATTESTATION_STATION_ADDRESS } from "@eth-optimism/atst";

const COUNTER_ADDRESS = "0x4c5859f0F772848b2D91F1D83E2Fe57935348029";

/**
 * Wagmi cli will automatically generate react hooks from your forge contracts
 * @see https://wagmi.sh/cli/getting-started
 * You can also generate hooks from etherscan
 * @see https://wagmi.sh/cli/plugins/etherscan
 * Or for erc20 erc721 tokens
 * @see https://wagmi.sh/cli/plugins/erc
 * Or from hardhat
 * @see https://wagmi.sh/cli/plugins/hardhat
 * Or from an arbitrary fetch request
 * @see https://wagmi.sh/cli/plugins/fetch
 *
 * You can also generate vanilla actions for @wagmi/core
 * @see https://wagmi.sh/cli/plugins/actions
 */
export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    /**
     * Generates react hooks from your forge contracts
     * @see https://wagmi.sh/cli/plugins/foundry
     */
    foundry({
      deployments: {
        AttestationStation: {
          [chains.optimism.id]: ATTESTATION_STATION_ADDRESS,
          [chains.optimismGoerli.id]: ATTESTATION_STATION_ADDRESS,
          [chains.foundry.id]: ATTESTATION_STATION_ADDRESS,
        },
        Counter: {
          [chains.optimism.id]: COUNTER_ADDRESS,
          [chains.optimismGoerli.id]: COUNTER_ADDRESS,
          [chains.foundry.id]: COUNTER_ADDRESS,
        },
        SocialMedia: {
          [chains.baseGoerli.id]: "0x09D9D67ba1Fcc9942017Ea385fA468ED692dD1eB",
          [chains.optimism.id]: "0x6ad4b032885a1e3bb4b69458aad11c05ac557f46",
          [chains.optimismGoerli.id]:
            "0xf1dc759fff77ef4a8381f27aa32c435713b18ca9",
          [chains.zoraTestnet.id]: "0xf072bfec8d13ef915349524c2143c7bb63c3ef7d",
          [chains.foundry.id]: "0xf1dc759fff77ef4a8381f27aa32c435713b18ca9",
        },
      },
    }),
    /**
     * Generates react hooks from your abis
     * @see https://wagmi.sh/cli/plugins/react
     */
    react(),
  ],
});
