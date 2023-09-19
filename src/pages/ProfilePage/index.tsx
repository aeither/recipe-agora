import { Button } from "@/components/ui/button";
import lighthouse from "@lighthouse-web3/sdk";
import { DealParameters } from "@lighthouse-web3/sdk/dist/types";
import React, { useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { filecoinCalibration } from "viem/chains";
import { userInfoAbi } from "../../lib/userInfoAbi";

export const ProfilePage = () => {
  const [CID, setCID] = useState<String>();
  const [name, setName] = useState<String>();
  const [bio, setBio] = useState<String>();

  const progressCallback = (progressData: {
    total: number;
    uploaded: number;
  }) => {
    let percentageDone = (
      100 -
      progressData?.total / progressData?.uploaded
    ).toFixed(2);
    console.log(percentageDone);
  };

  const uploadFileOriginal = async (file: any) => {
    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY; //generate from https://files.lighthouse.storage/ or cli (lighthouse-web3 api-key --new)
    if (typeof apiKey !== "string") {
      console.log("apiKey is NOT string");
      return;
    }

    const dealParam: DealParameters = {
      num_copies: 1,
      repair_threshold: 10, // default 10 days
      renew_threshold: 2880, //2880 epoch per day, default 28800, min 240(2 hours)
      miner: ["t017840"],
      network: "calibration",
      deal_duration: Infinity,
    };
    const output = await lighthouse.upload(
      file,
      apiKey,
      false,
      dealParam,
      progressCallback
    );
    console.log("File Status:", output);
    /*
      output:
        data: {
          Name: "filename.txt",
          Size: 88000,
          Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
        }
      Note: Hash in response is CID.
    */
    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
    setCID("https://gateway.lighthouse.storage/ipfs/" + output.data.Hash);
  };

  const saveInfo = async () => {
    const userInfoAddress = "0x8FeC581402D788fCBbc074488883b9d64A5dc790";
    const ww = window as any;

    // Viem
    const publicClient = createPublicClient({
      chain: filecoinCalibration,
      transport: http("https://filecoin-calibration.chainstacklabs.com/rpc/v1"),
    });

    const [account] = await ww.ethereum.request({
      method: "eth_requestAccounts",
    });
    const client = createWalletClient({
      account,
      chain: filecoinCalibration,
      transport: custom(ww.ethereum),
    });

    console.log("name, CID, bio: ", name, CID, bio);
    const { request } = await publicClient.simulateContract({
      // account,
      account: client.account,
      address: userInfoAddress,
      abi: userInfoAbi,
      args: [name, CID, bio],
      functionName: "addUser",
    });
    const hash = await client.writeContract(request);
    console.log("🚀 ~ file: index.tsx:373 ~ submit ~ hash:", hash);

    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    console.log(
      "🚀 ~ file: index.tsx:383 ~ submit ~ transaction:",
      transaction
    );
  };

  const getUserInfo = async () => {
    const userInfoAddress = "0x8FeC581402D788fCBbc074488883b9d64A5dc790";
    const ww = window as any;

    // Viem
    const publicClient = createPublicClient({
      chain: filecoinCalibration,
      transport: http("https://filecoin-calibration.chainstacklabs.com/rpc/v1"),
    });

    const [account] = await ww.ethereum.request({
      method: "eth_requestAccounts",
    });
    const client = createWalletClient({
      account,
      chain: filecoinCalibration,
      transport: custom(ww.ethereum),
    });

    const data = await publicClient.readContract({
      address: userInfoAddress,
      abi: userInfoAbi,
      functionName: "users",
      args: [client.account.address],
    });
    console.log("🚀 ~ file: index.tsx:150 ~ getUserInfo ~ data:", data);
  };

  return (
    <>
      <div>Profile</div>
      <input onChange={(e) => uploadFileOriginal(e.target.files)} type="file" />
      <input onChange={(e) => setName(e.target.value)} type="text" />
      <input onChange={(e) => setBio(e.target.value)} type="text" />
      <Button onClick={saveInfo}>Save</Button>
      <Button onClick={getUserInfo}>Get Profile Info</Button>
    </>
  );
};
