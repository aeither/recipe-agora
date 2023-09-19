import { Button } from "@/components/ui/button";
import lighthouse from "@lighthouse-web3/sdk";
import { DealParameters } from "@lighthouse-web3/sdk/dist/types";
import React, { useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { filecoinCalibration } from "viem/chains";
import { recipeRegistryAbi } from "../../lib/recipeRegistryAbi";

export const ProfilePage = () => {
  const [CID, setCID] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [ingredients, setIngredients] = useState<string>();
  const [instructions, setInstructions] = useState<string>();

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
    setCID(output.data.Hash);
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
      abi: recipeRegistryAbi,
      args: [title, ingredients, instructions, CID],
      functionName: "addRecipe",
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
    const recipeRegistryAddress = "0x5145Dc366F25f96f219850F5aCaD50DF76eE424D";
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
      address: recipeRegistryAddress,
      abi: recipeRegistryAbi,
      functionName: "getAllRecipes",
    });
    console.log("🚀 ~ file: index.tsx:150 ~ getUserInfo ~ data:", data);
  };

  const getPoDSI = async () => {
    try {
      const response = await fetch(
        `https://api.lighthouse.storage/api/lighthouse/get_proof?cid=${CID}&network=testnet`
      );

      if (!response.ok) {
        throw new Error(`Fetch request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const deal_status = async (): Promise<void> => {
    if (!CID) {
      console.log("CID undefined");
      return;
    }
    console.log("🚀 ~ file: index.tsx:150 ~ constdeal_status= ~ CID:", CID);
    // const status = await lighthouse.dealStatus(CID);

    const response = await fetch(
      `https://calibration.lighthouse.storage/api/deal_status?cid=${CID}`
    );

    if (!response.ok) {
      throw new Error(`Fetch request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    // console.log(
    //   "🚀 ~ file: index.tsx:426 ~ constdeal_status= ~ status:",
    //   status
    // );
  };

  const register_job = async (): Promise<void> => {
    if (!CID) {
      console.log("CID undefined");
      return;
    }

    const formData = new FormData();

    const cid = CID;
    // Optional Parameters
    const requestReceivedTime = new Date();
    const endDate = requestReceivedTime.setMonth(
      requestReceivedTime.getMonth() + 1
    );
    const replicationTarget = 2;
    const epochs = 4; // how many epochs before the deal end should the deal be renewed
    formData.append("cid", cid);
    formData.append("endDate", endDate.toString());
    formData.append("replicationTarget", replicationTarget.toString());
    formData.append("epochs", epochs.toString());

    try {
      const response = await fetch(
        "https://calibration.lighthouse.storage/api/register_job",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div>Profile</div>
      <input onChange={(e) => uploadFileOriginal(e.target.files)} type="file" />
      <input onChange={(e) => setTitle(e.target.value)} type="text" />
      <input onChange={(e) => setIngredients(e.target.value)} type="text" />
      <input onChange={(e) => setInstructions(e.target.value)} type="text" />

      {CID && (
        <>
          <img
            src={`https://gateway.lighthouse.storage/ipfs/${CID}`}
            alt="Profile Image"
          />
          <div>{`https://gateway.lighthouse.storage/ipfs/${CID}`}</div>
          <Button onClick={getPoDSI}>getPoDSI</Button>
          <Button onClick={deal_status}>deal_status</Button>
          <Button onClick={register_job}>register_job</Button>
        </>
      )}
      <Button onClick={saveInfo}>Save</Button>
      <Button onClick={getUserInfo}>Get Profile Info</Button>
    </>
  );
};
