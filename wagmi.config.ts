import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import * as chains from "wagmi/chains";
import { ATTESTATION_STATION_ADDRESS } from "@eth-optimism/atst";

const COUNTER_ADDRESS ="0x4c5859f0F772848b2D91F1D83E2Fe57935348029";
const SOCIAL_MEDIA_ADDRESS = "0x1291Be112d480055DaFd8a610b7d1e203891C274";

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
          [chains.optimism.id]: SOCIAL_MEDIA_ADDRESS,
          [chains.optimismGoerli.id]: SOCIAL_MEDIA_ADDRESS,
          [chains.foundry.id]: SOCIAL_MEDIA_ADDRESS,
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
