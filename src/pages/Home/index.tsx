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
      <hr />
      <button onClick={() => navigate("/toolkits")}>Go To Toolkits Page</button>
      <br />
    </>
  );
};
