import lighthouse from "@lighthouse-web3/sdk";
import { DealParameters } from "@lighthouse-web3/sdk/dist/types";
import React from "react";

export const Dashboard = () => {
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
    console.log("🚀 ~ file: index.tsx:19 ~ uploadFileOriginal ~ apiKey:", apiKey)
    if (!apiKey) return;

    const dealParam = {
      network: "calibration",
    };
    const output = await lighthouse.upload(
      file,
      apiKey as string,
      false,
      dealParam as DealParameters,
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

  return (
    <>
      <div>Profile</div>
      <input onChange={(e) => uploadFileOriginal(e.target.files)} type="file" />
    </>
  );
};
