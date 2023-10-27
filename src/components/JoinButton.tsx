import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useAccount, useSignMessage } from "wagmi";
import { API_URL, JOINED_COOKIE_NAME, MESSAGE_TO_SIGN } from "../constants";
import { ServerError } from "../error";

const postAddress = (body: { address: string; signature: string }) => {
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const result = await res.json();

    if (!res.ok) {
      throw new ServerError(result);
    }

    return result;
  });
};

export const JoinButton = () => {
  const { address } = useAccount();
  const { data: signature, error, isLoading, signMessage } = useSignMessage();
  const [cookies, setCookie] = useCookies([JOINED_COOKIE_NAME]);
  const [errorJoin, setErrorJoin] = useState<ServerError | undefined>();
  const isInWaitlist = cookies[JOINED_COOKIE_NAME];

  useEffect(() => {
    const request = async () => {
      if (!isInWaitlist && address && signature) {
        try {
          await postAddress({
            address,
            signature,
          });
          setCookie(JOINED_COOKIE_NAME, 1);
        } catch (err) {
          setErrorJoin(err as ServerError);

          if (
            (err as ServerError).message ===
            "Ethereum address already subscribed"
          ) {
            setCookie(JOINED_COOKIE_NAME, 1);
          }
        }
      }
    };
    request();
  }, [isInWaitlist, address, cookies, setCookie, signature]);

  const joinWaitlist = useCallback(() => {
    signMessage({ message: MESSAGE_TO_SIGN });
  }, [signMessage]);

  if (signature && !errorJoin) {
    return <div>You're successfuly joined waitlist</div>;
  }

  if (isInWaitlist) {
    return <div>You're in waitlist already</div>;
  }

  return (
    <div>
      <button disabled={isLoading} onClick={joinWaitlist}>
        {isLoading ? "Check Wallet" : "Join the waitlist"}
      </button>
      {error && <div>{error.message}</div>}
      {errorJoin && <div>{errorJoin.message}</div>}
    </div>
  );
};
