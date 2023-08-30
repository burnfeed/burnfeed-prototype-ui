import React, { createContext, useContext, useEffect, useState } from "react";
import { JsonRpcProvider, ethers } from "ethers";
import { taiko } from "../config/chain";
import { simPubAddress } from "../config/addresses";
import SimPubProtocolABI from "../abi/SimPubProtocol.json";
import ActionsManager from "./ActionsManager";
import { SimPubAction } from "../config/types";

const SimpubProviderContext = createContext<{
  provider: ethers.Provider | null;
  simPubContract: ethers.Contract | null;
  publishActions: SimPubAction[];
  insertAction: (item: SimPubAction, i?: number) => void;
  replaceAction: (item: SimPubAction, i?: number) => void;
  deleteAction: (i: number) => void;
  txSendCount: number;
} | null>(null);

export function SimpubProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [simPubContract, setSimPubContract] = useState<ethers.Contract | null>(
    null
  );
  const [publishActions, setPublishActions] = useState<SimPubAction[]>([]);
  const [txSendCount, setTxSendCount] = useState(0);
  const [txSending, setTxSending] = useState(false);

  const insertAction = (item: SimPubAction, i: number = -1) => {
    if (txSending || !item || i < -1) return;
    let actions = publishActions.concat([]);
    if (i === -1) {
      actions.push(item);
    } else if (i === 0) {
      actions.unshift(item);
    } else {
      actions = actions.slice(0, i).concat([item]).concat(actions.slice(i));
    }

    setPublishActions(actions);
  };

  const replaceAction = (item: SimPubAction, i: number = -1) => {
    if (txSending || !item || i < -1) return;
    let actions = publishActions.concat([]);
    actions[i] = {...item};
    setPublishActions(actions);
  }

  const deleteAction = (i: number) => {
    if (txSending || i < -1 || i >= publishActions.length) return;
    let actions = publishActions.concat([]);

    if (typeof actions[i].onActionDelete === "function") {
      (actions[i].onActionDelete as Function)();
    }

    if (i === -1 || i == actions.length - 1) {
      actions.pop();
    } else if (i === 0) {
      actions = actions.slice(1);
    } else {
      actions = actions.slice(0, i).concat(actions.slice(i + 1));
    }

    setPublishActions(actions);
  };

  async function init() {
    if (!provider) {
      const p = new JsonRpcProvider(taiko.rpcUrls.public.http[0]);
      setProvider(p);
      if (!simPubContract) {
        const s = new ethers.Contract(simPubAddress, SimPubProtocolABI, p);
        setSimPubContract(s);
      }
    }
  }

  useEffect(() => {
    init();
  });

  return (
    <SimpubProviderContext.Provider
      value={{
        provider,
        simPubContract,
        publishActions,
        insertAction,
        replaceAction,
        deleteAction,
        txSendCount,
      }}
    >
      {children}
      <ActionsManager
        publishActions={publishActions}
        onSendingChange={(status) => {
          setTxSending(status);
        }}
        onActionsRest={() => {
          setPublishActions([]);
          setTimeout(() => {
            setTxSendCount(txSendCount + 1);
            console.log("txSendCount + 1");
          }, 10000);
        }}
      />
    </SimpubProviderContext.Provider>
  );
}

export function useSimpubProvider() {
  const context = useContext(SimpubProviderContext);
  if (!context) {
    throw new Error("useSimpubProvider must be used within a SimpubProvider");
  }
  return context;
}
