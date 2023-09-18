import { Button } from "@/components/ui/button";
import lighthouse from "@lighthouse-web3/sdk";
import { DealParameters } from "@lighthouse-web3/sdk/dist/types";
import {
  createPublicClient,
  createWalletClient,
  custom,
  hexToString,
  http,
  stringToHex,
} from "viem";
import { filecoinCalibration } from "viem/chains";
import { userInfoAbi } from "../../lib/userInfoAbi";
import React from "react";

export const ProfilePage = () => {
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
    const apiKey = process.env.LIGHTHOUSE_API_KEY; //generate from https://files.lighthouse.storage/ or cli (lighthouse-web3 api-key --new)
    if (!apiKey) return;

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
  };

  const uploadFile2 = async () => {
    console.log("Uploading...");
    const path =
      "/Users/lin/Documents/Projects/open-data/Lighthouse-FVM-Demo-main/example.jpeg"; // Give path to the file

    const apiKey = process.env.LIGHTHOUSE_API_KEY; //generate from https://files.lighthouse.storage/ or cli (lighthouse-web3 api-key --new)
    if (!apiKey) return;

    const dealParam: DealParameters = {
      num_copies: 1,
      repair_threshold: 10, // default 10 days
      renew_threshold: 2880, //2880 epoch per day, default 28800, min 240(2 hours)
      miner: ["t017840"],
      network: "calibration",
      deal_duration: Infinity,
    };
    // Both file and folder supported by upload function
    const response = await lighthouse.upload(path, apiKey, false, dealParam);
    console.log(response);
    console.log(
      "Visit at: https://gateway.lighthouse.storage/ipfs/" + response.data.Hash
    );
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

    const { request } = await publicClient.simulateContract({
      // account,
      account: client.account,
      address: userInfoAddress,
      abi: userInfoAbi,
      args: ["one", "two", "three"],
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
      <div>hello world</div>
      <input onChange={(e) => uploadFileOriginal(e.target.files)} type="file" />
      <Button onClick={uploadFile2}>Upload Local Path</Button>
      <Button onClick={saveInfo}>Interact User Contract</Button>
      <Button onClick={getUserInfo}>Get User Contract</Button>
    </>
  );
};
