import { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useAccount, useSignMessage } from "wagmi";
import useSWR, { Fetcher } from "swr";
import { API_URL, JOINED_COOKIE_NAME, MESSAGE_TO_SIGN } from "../constants";

type Response = {
  [address in string]: number;
};

const fetcherWaitlist: Fetcher<Response, string> = () => {
  return fetch(API_URL).then((res) => res.json());
};

const postAddress = async (body: { address: string; signature: string }) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await response.json();
};

export const JoinButton = () => {
  const { address } = useAccount();
  const { data: signature, error, isLoading, signMessage } = useSignMessage();
  const [cookies, setCookie] = useCookies([JOINED_COOKIE_NAME]);
  const [errorJoin, setErrorJoin] = useState<Error | undefined>();
  const {
    data: dataWaitlist,
    error: errorWaitlist,
    isLoading: isLoadingWaitlist,
  } = useSWR("waitlist", fetcherWaitlist);
  console.log("useSWR: ", dataWaitlist, errorWaitlist, isLoadingWaitlist);

  const isInWaitlist = useMemo(() => {
    if (dataWaitlist && address) {
      return dataWaitlist[address.toLowerCase()];
    }

    return false;
  }, [address, dataWaitlist]);

  useEffect(() => {
    const request = async () => {
      // console.debug(address, signature, cookies[JOINED_COOKIE_NAME]);
      if (
        !isInWaitlist &&
        address &&
        signature
        // && !cookies[JOINED_COOKIE_NAME]
      ) {
        console.info(address, signature, cookies[JOINED_COOKIE_NAME]);
        try {
          await postAddress({
            address,
            signature,
          });
          // setCookie(JOINED_COOKIE_NAME, 1);
        } catch (err) {
          console.error(err);
          setErrorJoin(err as Error);
        }
      }
    };
    request();
  }, [isInWaitlist, address, cookies, setCookie, signature]);

  const joinWaitlist = useCallback(() => {
    signMessage({ message: MESSAGE_TO_SIGN });
  }, [signMessage]);

  if (isLoadingWaitlist) {
    return <div>Loading</div>;
  }

  if (
    // cookies[JOINED_COOKIE_NAME] &&
    signature &&
    !errorJoin
  ) {
    return <div>You're successfuly joined waitlist</div>;
  }

  if (
    isInWaitlist &&
    // || cookies[JOINED_COOKIE_NAME]
    !errorWaitlist
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
      {errorWaitlist && <div>{errorWaitlist.message}</div>}
    </div>
  );
};
