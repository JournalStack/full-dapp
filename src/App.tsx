import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { Attestooooooor } from "./components/Attestoooooor";
import { CounterComponent } from "./components/CounterComponent";
import { SocialComponent } from "./components/SocialComponent";
import Test from "./components/test";

export function App() {
  /**
   * Wagmi hook for getting account information
   * @see https://wagmi.sh/docs/hooks/useAccount
   */
  const { isConnected } = useAccount();

  return (
    <>
      {/* <h1>OP Starter Project</h1>

      <ConnectButton /> */}
      {/*
      {isConnected && (
        <>
          <hr />
          <Attestooooooor />
          <hr />
          <SocialComponent />
          <hr />
        </>
      )} */}
      <Test />
    </>
  );
}
