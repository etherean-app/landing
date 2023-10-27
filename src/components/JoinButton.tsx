import { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useAccount, useSignMessage } from "wagmi";
// import { Fetcher } from "swr";
// import useSWRImmutable from "swr/immutable";
import { API_URL, JOINED_COOKIE_NAME, MESSAGE_TO_SIGN } from "../constants";
import { ServerError } from "../error";

// type WaitlistResponse = {
//   [address in string]: number;
// };

// const fetcherWaitlist: Fetcher<WaitlistResponse, string> = () => {
//   return fetch(API_URL).then((res) => res.json());
// };

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
  // const {
  //   data: dataWaitlist,
  //   error: errorWaitlist,
  //   isLoading: isLoadingWaitlist,
  //   mutate,
  // } = useSWRImmutable("waitlist", fetcherWaitlist);

  const isInWaitlist = useMemo(() => {
    // if (dataWaitlist && address) {
    //   return dataWaitlist[address.toLowerCase()];
    // }

    // return false;

    return cookies[JOINED_COOKIE_NAME];
  }, [cookies]);

  useEffect(() => {
    const request = async () => {
      if (!isInWaitlist && address && signature) {
        console.info(address, signature, cookies[JOINED_COOKIE_NAME]);
        try {
          await postAddress({
            address,
            signature,
          });
          // await mutate();
          setCookie(JOINED_COOKIE_NAME, 1);
        } catch (err) {
          console.log(999, err);
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

  // if (isLoadingWaitlist) {
  //   return <div>Loading</div>;
  // }

  if (
    // cookies[JOINED_COOKIE_NAME] &&
    signature &&
    !errorJoin
  ) {
    return <div>You're successfuly joined waitlist</div>;
  }

  if (
    isInWaitlist
    // || cookies[JOINED_COOKIE_NAME]
    // && !errorWaitlist
  ) {
    return <div>You're in waitlist already</div>;
  }

  return (
    <div>
      <button disabled={isLoading} onClick={joinWaitlist}>
        {isLoading ? "Check Wallet" : "Join the waitlist"}
      </button>
      {error && <div>{error.message}</div>}
      {errorJoin && <div>{errorJoin.message}</div>}
      {/* {errorWaitlist && <div>{errorWaitlist.message}</div>} */}
    </div>
  );
};
