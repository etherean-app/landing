import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
import { JoinButton } from "./components/JoinButton";

export function Profile() {
  const { address, connector, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName });
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && connector) {
    return (
      <div className="grid gap-6">
        <div>
          {ensAvatar ? <img src={ensAvatar} alt="ENS Avatar" /> : null}
          <div>{ensName ? `${ensName} (${address})` : address}</div>
          <div className="grid grid-flow-col items-center">
            <div>Connected to {connector.name} </div>
            <button onClick={() => disconnect()}>Disconnect</button>
          </div>
        </div>
        <div>
          <JoinButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}
