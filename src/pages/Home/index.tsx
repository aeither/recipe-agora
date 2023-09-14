import React, { useState, useEffect, useCallback, useContext } from "react";
import ReactJson from "react-json-view";
import { Currency } from "@dataverse/dataverse-connector";
import {
  StreamType,
  useApp,
  useCreateStream,
  useFeedsByAddress,
  useMonetizeStream,
  useStore,
  useUnlockStream,
  useUpdateStream,
} from "@dataverse/hooks";
import { Model } from "@dataverse/model-parser";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../main";
import lighthouse from "@lighthouse-web3/sdk";
import { DealParameters } from "@lighthouse-web3/sdk/dist/types";
import { ethers } from "ethers";
import { dealStatusAbi } from "../../lib/dealStatusAbi";

import {
  createPublicClient,
  createWalletClient,
  custom,
  hexToString,
  http,
  stringToHex,
} from "viem";
import { filecoinCalibration, mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const Home = () => {
  const { modelParser, appVersion } = useContext(AppContext);
  const navigate = useNavigate();
  const [postModel, setPostModel] = useState<Model>();
  const [currentStreamId, setCurrentStreamId] = useState<string>();

  useEffect(() => {
    const postModel = modelParser.getModelByName("post");
    setPostModel(postModel);
  }, []);

  /**
   * @summary import from @dataverse/hooks
   */
  const { address, pkh, streamsMap: posts } = useStore();

  const { connectApp } = useApp({
    appId: modelParser.appId,
    autoConnect: true,
    onSuccess: (result) => {
      console.log("[connect]connect app success, result:", result);
    },
  });

  const { createdStream: publicPost, createStream: createPublicStream } =
    useCreateStream({
      streamType: StreamType.Public,
      onSuccess: (result: any) => {
        console.log("[createPublicPost]create public stream success:", result);
        setCurrentStreamId(result.streamId);
      },
    });

  const { createdStream: encryptedPost, createStream: createEncryptedStream } =
    useCreateStream({
      streamType: StreamType.Encrypted,
      onSuccess: (result: any) => {
        console.log(
          "[createEncryptedPost]create encrypted stream success:",
          result
        );
        setCurrentStreamId(result.streamId);
      },
    });

  const { createdStream: payablePost, createStream: createPayableStream } =
    useCreateStream({
      streamType: StreamType.Payable,
      onSuccess: (result: any) => {
        console.log(
          "[createPayablePost]create payable stream success:",
          result
        );
        setCurrentStreamId(result.streamId);
      },
    });

  const { loadFeedsByAddress } = useFeedsByAddress({
    onError: (error) => {
      console.error("[loadPosts]load streams failed,", error);
    },
    onSuccess: (result) => {
      console.log("[loadPosts]load streams success, result:", result);
    },
  });

  const { updatedStreamContent: updatedPost, updateStream } = useUpdateStream({
    onSuccess: (result) => {
      console.log("[updatePost]update stream success, result:", result);
    },
  });

  const { monetizedStreamContent: monetizedPost, monetizeStream } =
    useMonetizeStream({
      onSuccess: (result) => {
        console.log("[monetize]monetize stream success, result:", result);
      },
    });

  const { unlockedStreamContent: unlockedPost, unlockStream } = useUnlockStream(
    {
      onSuccess: (result) => {
        console.log("[unlockPost]unlock stream success, result:", result);
      },
    }
  );

  /**
   * @summary custom methods
   */
  const connect = useCallback(async () => {
    connectApp();
  }, [connectApp]);

  const createPublicPost = useCallback(async () => {
    if (!postModel) {
      console.error("postModel undefined");
      return;
    }

    createPublicStream({
      modelId: postModel.streams[postModel.streams.length - 1].modelId,
      stream: {
        appVersion,
        title: "I am the title",
        text: "hello",
        images: [
          "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link",
        ],
        videos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }, [postModel, createPublicStream]);

  const createEncryptedPost = useCallback(async () => {
    if (!postModel) {
      console.error("postModel undefined");
      return;
    }

    const date = new Date().toISOString();

    createEncryptedStream({
      modelId: postModel.streams[postModel.streams.length - 1].modelId,
      stream: {
        appVersion,
        text: "hello",
        images: [
          "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link",
        ],
        videos: [],
        createdAt: date,
        updatedAt: date,
      },
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
  }, [postModel, createEncryptedStream]);

  const createPayablePost = useCallback(async () => {
    if (!postModel) {
      console.error("postModel undefined");
      return;
    }

    const date = new Date().toISOString();
    createPayableStream({
      modelId: postModel.streams[postModel.streams.length - 1].modelId,
      stream: {
        appVersion,
        text: "metaverse",
        images: [
          "https://bafkreidhjbco3nh4uc7wwt5c7auirotd76ch6hlzpps7bwdvgckflp7zmi.ipfs.w3s.link/",
        ],
        videos: [],
        createdAt: date,
        updatedAt: date,
      },
      currency: Currency.WMATIC,
      amount: 0.0001,
      collectLimit: 1000,
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
  }, [postModel, address, pkh, createPayableStream]);

  const loadPosts = useCallback(async () => {
    if (!postModel) {
      console.error("postModel undefined");
      return;
    }
    if (!pkh) {
      console.error("pkh undefined");
      return;
    }

    await loadFeedsByAddress({
      pkh,
      modelId: postModel.streams[postModel.streams.length - 1].modelId,
    });
  }, [postModel, pkh, loadFeedsByAddress]);

  const updatePost = useCallback(async () => {
    if (!postModel) {
      console.error("postModel undefined");
      return;
    }
    if (!currentStreamId) {
      console.error("currentStreamId undefined");
      return;
    }
    updateStream({
      model: postModel,
      streamId: currentStreamId,
      stream: {
        text: "update my post -- " + new Date().toISOString(),
        images: [
          "https://bafkreidhjbco3nh4uc7wwt5c7auirotd76ch6hlzpps7bwdvgckflp7zmi.ipfs.w3s.link",
        ],
        updatedAt: new Date().toISOString(),
      },
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
  }, [postModel, currentStreamId, updateStream]);

  const monetizePost = useCallback(async () => {
    if (!postModel) {
      console.error("postModel undefined");
      return;
    }
    if (!currentStreamId) {
      console.error("currentStreamId undefined");
      return;
    }

    monetizeStream({
      streamId: currentStreamId,
      currency: Currency.WMATIC,
      amount: 0.0001,
      collectLimit: 1000,
    });
  }, [postModel, currentStreamId, monetizeStream]);

  const unlockPost = useCallback(async () => {
    if (!currentStreamId) {
      console.error("currentStreamId undefined");
      return;
    }
    unlockStream(currentStreamId);
  }, [currentStreamId, unlockStream]);

  // Lighthouse

  // Proof of Data Segment Inclusion (PoDSI)
  // Reference: https://docs.lighthouse.storage/lighthouse-1/filecoin-virtual-machine/section-a#step-3-understanding-podsi-getting-the-podsi-for-your-file
  const getData = async () => {
    const cid = "QmS7Do1mDZNBJAVyE8N9r6wYMdg27LiSj5W9mmm9TZoeWp";
    try {
      const response = await fetch(
        `https://api.lighthouse.storage/api/lighthouse/get_proof?cid=${cid}&network=testnet`
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

  // TODO How to upload file from different path
  const uploadFile = async () => {
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

  const callFileDetails = async (cid: string) => {
    // Provider
    const provider = new ethers.providers.JsonRpcProvider(
      "https://api.calibration.node.glif.io/rpc/v1"
    );

    // Contract object
    const contractAddress = "0x6ec8722e6543fB5976a547434c8644b51e24785b";
    const contract = new ethers.Contract(
      contractAddress,
      dealStatusAbi,
      provider
    );

    // Call getAllDeals
    let fileInfo = await contract.getAllDeals(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(cid)),
      {
        gasLimit: 50_000_000,
      }
    );
    console.log(fileInfo);
  };

  const submit = async (cid: string) => {
    const ww = window as any;

    // Viem
    const publicClient = createPublicClient({
      chain: filecoinCalibration,
      transport: http(),
    });

    const [account] = await ww.ethereum.request({
      method: "eth_requestAccounts",
    });
    const client = createWalletClient({
      account,
      chain: filecoinCalibration,
      transport: custom(ww.ethereum),
    });
    console.log("🚀 ~ file: index.tsx:351 ~ submit ~ client:", client);

    const addresses = await client.getAddresses();
    console.log("🚀 ~ file: index.tsx:346 ~ submit ~ address:", addresses);
    const chainId = await client.getChainId();
    console.log("🚀 ~ file: index.tsx:356 ~ submit ~ chainId:", chainId);

    const { request } = await publicClient.simulateContract({
      // account,
      account: client.account,
      address: "0x6ec8722e6543fB5976a547434c8644b51e24785b",
      abi: dealStatusAbi,
      args: [stringToHex(cid)],
      functionName: "submit",
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
    console.log(
      "Topic: ",
      hexToString(transaction.logs[0].topics[0] || "0x", { size: 32 })
    );

    // // Signer
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "https://api.calibration.node.glif.io/rpc/v1"
    // );
    // const privateKey = process.env.PRIVATE_KEY;
    // console.log("🚀 ~ file: index.tsx:341 ~ submit ~ privateKey:", privateKey);
    // const signer = new ethers.Wallet(privateKey, provider);

    // const apiKey = process.env.LIGHTHOUSE_API_KEY; //generate from https://files.lighthouse.storage/ or cli (lighthouse-web3 api-key --new)
    // if (!apiKey) return;

    // // Contract
    // const contractAddress = "0x6ec8722e6543fB5976a547434c8644b51e24785b";
    // const contract = new ethers.Contract(
    //   contractAddress,
    //   dealStatusAbi,
    //   signer
    // );

    // // Call submit
    // const cidHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(cid));
    // const submit = await contract.submit(cidHex, {
    //   gasLimit: 500_000_000,
    // });

    // const response = await submit.wait();
    // const eventData = response.events[0].args;
    // console.log("Tx Id:", Number(eventData[0]));
    // console.log("CID", ethers.utils.toUtf8String(eventData[1]));
  };

  return (
    <>
      <button onClick={connect}>connect</button>
      <div className="black-text">{pkh}</div>
      <hr />
      <button onClick={createPublicPost}>createPublicPost</button>
      {publicPost && (
        <div className="json-view">
          <ReactJson src={publicPost} collapsed={true} />
        </div>
      )}
      <button onClick={createEncryptedPost}>createEncryptedPost</button>
      {encryptedPost && (
        <div className="json-view">
          <ReactJson src={encryptedPost} collapsed={true} />
        </div>
      )}
      <button onClick={createPayablePost}>createPayablePost</button>
      {payablePost && (
        <div className="json-view">
          <ReactJson src={payablePost} collapsed={true} />
        </div>
      )}
      <div className="red">
        You need a testnet lens profile to monetize data.
      </div>
      <button onClick={loadPosts}>loadPosts</button>
      {posts && (
        <div className="json-view">
          <ReactJson src={posts} collapsed={true} />
        </div>
      )}
      <button onClick={updatePost}>updatePost</button>
      {updatedPost && (
        <div className="json-view">
          <ReactJson src={updatedPost} collapsed={true} />
        </div>
      )}
      <button onClick={monetizePost}>monetizePost</button>
      {monetizedPost && (
        <div className="json-view">
          <ReactJson src={monetizedPost} collapsed={true} />
        </div>
      )}
      <button onClick={unlockPost}>unlockPost</button>
      {unlockedPost && (
        <div className="json-view">
          <ReactJson src={unlockedPost} collapsed={true} />
        </div>
      )}
      {/* Lighthouse */}
      <button onClick={getData}>PoDSI: proof of inclusion</button>
      <button
        onClick={() =>
          callFileDetails("QmZETJF6NC9p9KkkgczH7SJymhi6HdwvJSv6n2GWdDK4T6")
        }
      >
        callFileDetails
      </button>
      <button
        onClick={() => submit("QmZETJF6NC9p9KkkgczH7SJymhi6HdwvJSv6n2GWdDK4T6")}
      >
        Submit
      </button>
      <hr />
      <button onClick={() => navigate("/toolkits")}>Go To Toolkits Page</button>
      <br />
    </>
  );
};
