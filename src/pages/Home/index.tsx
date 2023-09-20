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
  useUploadFile,
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
import { filecoinCalibration } from "viem/chains";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

export const Home = () => {
  const { modelParser, appVersion } = useContext(AppContext);
  const navigate = useNavigate();
  const [postModel, setPostModel] = useState<Model>();
  const [currentStreamId, setCurrentStreamId] = useState<string>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);

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

    try {
      // Both file and folder supported by upload function
      const response = await lighthouse.upload(path, apiKey, false, dealParam);
      console.log(response);
      console.log(
        "Visit at: https://gateway.lighthouse.storage/ipfs/" +
          response.data.Hash
      );
    } catch (error) {
      console.log(error);
    }
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

  const deal_status = async (cid: string): Promise<void> => {
    const status = await lighthouse.dealStatus(cid);
    console.log(
      "🚀 ~ file: index.tsx:426 ~ constdeal_status= ~ status:",
      status
    );
  };

  // CORS ISSUE
  const register_job = async (): Promise<void> => {
    const formData = new FormData();

    const cid = "QmTgLAp2Ze2bv7WV2wnZrvtpR5pKJxZ2vtBxZPwr7rM61a";
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
      <Button onClick={connect}>connect</Button>
      <div className="black-text">{pkh}</div>
      <hr />
      <Button onClick={createPublicPost}>createPublicPost</Button>
      {publicPost && (
        <div className="json-view">
          <ReactJson src={publicPost} collapsed={true} />
        </div>
      )}
      <Button onClick={createEncryptedPost}>createEncryptedPost</Button>
      {encryptedPost && (
        <div className="json-view">
          <ReactJson src={encryptedPost} collapsed={true} />
        </div>
      )}
      <Button onClick={createPayablePost}>createPayablePost</Button>
      {payablePost && (
        <div className="json-view">
          <ReactJson src={payablePost} collapsed={true} />
        </div>
      )}
      <div className="red">
        You need a testnet lens profile to monetize data.
      </div>
      <Button onClick={loadPosts}>loadPosts</Button>
      {posts && (
        <div className="json-view">
          <ReactJson src={posts} collapsed={true} />
        </div>
      )}
      <Button onClick={updatePost}>updatePost</Button>
      {updatedPost && (
        <div className="json-view">
          <ReactJson src={updatedPost} collapsed={true} />
        </div>
      )}
      <Button onClick={monetizePost}>monetizePost</Button>
      {monetizedPost && (
        <div className="json-view">
          <ReactJson src={monetizedPost} collapsed={true} />
        </div>
      )}
      <Button onClick={unlockPost}>unlockPost</Button>
      {unlockedPost && (
        <div className="json-view">
          <ReactJson src={unlockedPost} collapsed={true} />
        </div>
      )}
      {/* Lighthouse */}
      <Button onClick={uploadFile}>uploadFile</Button>
      <Button onClick={getData}>PoDSI: proof of inclusion</Button>
      <Button
        onClick={() =>
          callFileDetails("QmZETJF6NC9p9KkkgczH7SJymhi6HdwvJSv6n2GWdDK4T6")
        }
      >
        callFileDetails
      </Button>
      <Button
        onClick={() => submit("QmZETJF6NC9p9KkkgczH7SJymhi6HdwvJSv6n2GWdDK4T6")}
      >
        Submit
      </Button>
      <Button
        onClick={() =>
          deal_status("QmTgLAp2Ze2bv7WV2wnZrvtpR5pKJxZ2vtBxZPwr7rM61a")
        }
      >
        Deal Status
      </Button>
      <Button onClick={() => register_job()}>Register Job</Button>

      <hr />
      <Button onClick={() => navigate("/toolkits")}>Go To Toolkits Page</Button>
      <br />
      <hr />
      <Button onClick={() => navigate("/profile")}>Go To Profile Page</Button>
      <br />

      {/* New Post */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* register your input into the hook by invoking the "register" function */}
        <input defaultValue="test" {...register("example")} />

        {/* include validation with required or other standard HTML validation rules */}
        <input {...register("exampleRequired", { required: true })} />
        {/* errors will return when field validation fails  */}
        {errors.exampleRequired && <span>This field is required</span>}

        <input type="submit" />
      </form>
    </>
  );
};
