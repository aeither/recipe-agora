import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { shortenAddress } from "@/lib/shortenAddress";
import { FoodSearchResponse, Recipe, StreamDataMap } from "@/lib/types";
import {
  StreamType,
  useApp,
  useCreateStream,
  useFeedsByAddress,
  useStore,
} from "@dataverse/hooks";
import { Model } from "@dataverse/model-parser";
import { zodResolver } from "@hookform/resolvers/zod";
import lighthouse from "@lighthouse-web3/sdk";
import { DealParameters } from "@lighthouse-web3/sdk/dist/types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { filecoinCalibration } from "viem/chains";
import * as z from "zod";
import { recipeRegistryAbi } from "../../lib/recipeRegistryAbi";
import { AppContext } from "../../main";
import { toast, useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  title: z.string(),
  ingredients: z.string(),
  instructions: z.string(),
  cid: z.string(),
});

interface Item {
  id: number;
  name: string;
  quantity: number;
}

const recipeRegistryAddress = "0x5145Dc366F25f96f219850F5aCaD50DF76eE424D";

export const ProfilePage = () => {
  const [CID, setCID] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [ingredients, setIngredients] = useState<string>();
  const [instructions, setInstructions] = useState<string>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Ingredients
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cartText, setCartText] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      ingredients: "",
      instructions: "",
      cid: "",
    },
  });

  // Dataverse
  const { modelParser, appVersion } = useContext(AppContext);
  const navigate = useNavigate();
  const [postModel, setPostModel] = useState<Model>();
  const [currentStreamId, setCurrentStreamId] = useState<string>();

  useEffect(() => {
    const postModel = modelParser.getModelByName("post");
    setPostModel(postModel);
  }, []);

  const store = useStore();
  const storeAddress = store.address;
  const pkh = store.pkh;
  const posts = store.streamsMap as unknown as StreamDataMap | undefined;

  const { connectApp } = useApp({
    appId: modelParser.appId,
    autoConnect: true,
    onSuccess: (result) => {
      console.log("[connect]connect app success, result:", result);
    },
  });

  // custom hooks
  const connect = useCallback(async () => {
    connectApp();
  }, [connectApp]);

  const { loadFeedsByAddress } = useFeedsByAddress({
    onError: (error) => {
      console.error("[loadPosts]load streams failed,", error);
    },
    onSuccess: (result) => {
      console.log("[loadPosts]load streams success, result:", result);
    },
  });

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    await saveInfo();
  }

  // Logics
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

  const uploadRecipeImage = async (file: any) => {
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
    form.setValue("cid", output.data.Hash);
  };

  const saveInfo = async () => {
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
      address: recipeRegistryAddress,
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

  // Ingredients

  const addToSelected = (item: Item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      updatedCart.push({ ...item, quantity: 1 });
    }

    setCart(updatedCart);
  };

  const reduceQuantity = (item: Item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem && existingItem.quantity > 1) {
      existingItem.quantity--;
    } else {
      const itemIndex = updatedCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );
      if (itemIndex !== -1) {
        updatedCart.splice(itemIndex, 1); // Remove the item from the cart if quantity is 1 or less
      }
    }

    setCart(updatedCart);
  };

  const increaseQuantity = (item: Item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      existingItem.quantity++;
    }

    setCart(updatedCart);
  };

  const removeItem = (item: Item) => {
    const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
    setCart(updatedCart);
  };

  const handleExportCart = () => {
    const cartItemsText = cart
      .map((cartItem) => `${cartItem.name} - Quantity: ${cartItem.quantity}`)
      .join("\n");
    setCartText(cartItemsText);
    setIngredients(cartItemsText);
    form.setValue("ingredients", cartItemsText);
  };

  const handleSearch = async () => {
    const apiKey = import.meta.env.VITE_USDA_API_KEY;
    if (typeof apiKey !== "string") {
      console.log("apiKey is NOT string");
      return;
    }
    const pageSize = 5;
    const pageNumber = 1;
    const dataType = "Foundation";
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchQuery}&api_key=${apiKey}&pageNumber=${pageNumber}&pageSize=${pageSize}&dataType=${dataType}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: FoodSearchResponse = await response.json();
      const foodItems = data.foods.map((food) => ({
        id: food.fdcId,
        name: food.description,
        quantity: 0,
      }));
      setItems(foodItems);
    } catch (err) {
      console.error(err);
    }
  };

  const getAllRecipes = async () => {
    // Viem
    const publicClient = createPublicClient({
      chain: filecoinCalibration,
      transport: http("https://filecoin-calibration.chainstacklabs.com/rpc/v1"),
    });

    const data = (await publicClient.readContract({
      address: recipeRegistryAddress,
      abi: recipeRegistryAbi,
      functionName: "getAllRecipes",
    })) as Recipe[];
    console.log("🚀 ~ file: index.tsx:150 ~ getUserInfo ~ data:", data);
    setRecipes(data);
  };

  useEffect(() => {
    getAllRecipes();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <NavigationBar connect={connect} />

      {/* Body */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[260px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_460px]">
          <Tabs defaultValue="account" className="flex flex-col w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Recipes</TabsTrigger>
              <TabsTrigger value="password">Create</TabsTrigger>
            </TabsList>
            {/* Section Recipes */}
            <TabsContent value="account">
              {/* {CID && (
                <>
                  <div>{`https://gateway.lighthouse.storage/ipfs/${CID}`}</div>
                  <Button onClick={getPoDSI}>getPoDSI</Button>
                  <Button onClick={deal_status}>deal_status</Button>
                  <Button onClick={register_job}>register_job</Button>
                </>
              )} */}

              {/* Show Recipes */}
              {/* <Button onClick={getAllRecipes}>Refresh</Button> */}
              <RecipeList
                recipes={recipes}
                posts={posts}
                loadPosts={loadPosts}
                postModel={postModel}
                appVersion={appVersion}
                setCurrentStreamId={setCurrentStreamId}
                storeAddress={storeAddress}
              />

              {/* Comments */}
              {/* <Button onClick={createPublicPost}>createPublicPost</Button> */}
              {/* {publicPost && (
                <div className="json-view">
                  <ReactJson src={publicPost} collapsed={true} />
                </div>
              )} */}

              {/* <Button onClick={() => console.log(publicPost)}>
                publicPost
              </Button>
              <Button onClick={loadPosts}>Log</Button>
              <Button onClick={() => console.log(posts)}>Log</Button> */}
            </TabsContent>

            {/* Section Create */}
            <TabsContent value="password">
              <div>
                <div className="space-y-2 pb-4">
                  <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    Create Recipe
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    <span className="display: inline-block; vertical-align: top; text-decoration: inherit; max-width: 340px;">
                      Give a name, add the ingredients, instructions, upload
                      your dish and your are ready to share
                    </span>
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="name" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of the recipe.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <>
                              {CID && (
                                <img
                                  className="rounded-md"
                                  src={`https://gateway.lighthouse.storage/ipfs/${CID}`}
                                  alt="Profile Image"
                                />
                              )}
                              <Input
                                onChange={(e) =>
                                  uploadRecipeImage(e.target.files)
                                }
                                type="file"
                              />
                            </>
                          </FormControl>
                          <FormDescription>
                            The image of the dish.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredients</FormLabel>
                          <FormControl>
                            <>
                              <div className="flex">
                                <Input
                                  type="text"
                                  placeholder="Search items..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                                <Button onClick={handleSearch}>Search</Button>
                              </div>

                              {items.length > 0 && (
                                <>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Choose</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="flex flex-col gap-1 pb-4">
                                        {items.map((item) => (
                                          <li
                                            className="flex w-full justify-between"
                                            key={item.id}
                                          >
                                            {item.name}
                                            <Button
                                              type="button"
                                              size={"sm"}
                                              variant={"outline"}
                                              onClick={() =>
                                                addToSelected(item)
                                              }
                                            >
                                              Add to Cart
                                            </Button>
                                          </li>
                                        ))}
                                      </ul>
                                      <Separator />

                                      <ul className="pt-4">
                                        {cart.map((cartItem) => (
                                          <li key={cartItem.id}>
                                            <p className="w-full truncate">
                                              {cartItem.name} x{" "}
                                              {cartItem.quantity}
                                            </p>
                                            <div className="flex gap-1">
                                              <Button
                                                type="button"
                                                onClick={() =>
                                                  reduceQuantity(cartItem)
                                                }
                                                variant={"outline"}
                                              >
                                                -
                                              </Button>
                                              <Button
                                                type="button"
                                                onClick={() =>
                                                  increaseQuantity(cartItem)
                                                }
                                                variant={"outline"}
                                              >
                                                +
                                              </Button>
                                              <Button
                                                type="button"
                                                onClick={() =>
                                                  removeItem(cartItem)
                                                }
                                                variant={"destructive"}
                                              >
                                                Remove
                                              </Button>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                    <CardFooter>
                                      <Button
                                        onClick={handleExportCart}
                                        type="button"
                                      >
                                        Confirm Ingredients
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                  <h2>Ingredients</h2>
                                  <Textarea value={cartText} readOnly />
                                </>
                              )}
                            </>
                          </FormControl>
                          <FormDescription>
                            Choose the ingredients.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              // onChange={(e) => setInstructions(e.target.value)}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The instructions to prepare the recipe.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </div>

              {/* <Button onClick={saveInfo}>Save</Button> */}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

function NavigationBar({ connect }: { connect: () => Promise<void> }) {
  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <h1 className="text-white text-xl font-bold">RecipeAgora</h1>

        <Button onClick={connect}>connect</Button>
        {/* <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu> */}
      </div>
    </header>
  );
}

function RecipeList({
  recipes,
  posts,
  loadPosts,
  postModel,
  appVersion,
  setCurrentStreamId,
  storeAddress,
}: // createPublicPost,
{
  recipes: Recipe[];
  posts: StreamDataMap | undefined;
  loadPosts: () => Promise<void>;
  postModel: Model | undefined;
  appVersion: string;
  setCurrentStreamId: React.Dispatch<React.SetStateAction<string | undefined>>;
  storeAddress: string | undefined;
  // createPublicPost: () => Promise<void>;
}) {
  const [comment, setComment] = useState<string>("");

  const { createdStream: publicPost, createStream: createPublicStream } =
    useCreateStream({
      streamType: StreamType.Public,
      onSuccess: (result: any) => {
        console.log("[createPublicPost]create public stream success:", result);
        setCurrentStreamId(result.streamId);
      },
    });

  const createPublicPost = useCallback(async () => {
    console.log("Comment", comment);

    if (!postModel) {
      console.error("postModel undefined");
      return;
    }

    toast({
      title: "Submitted successfully!",
      // description: "Wait few seconds",
    });

    createPublicStream({
      modelId: postModel.streams[postModel.streams.length - 1].modelId,
      stream: {
        appVersion,
        title: storeAddress,
        text: comment,
        images: [],
        videos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }, [postModel, createPublicStream]);

  // RaaS

  const getPoDSI = async (CID: string) => {
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

  const deal_status = async (CID: string): Promise<void> => {
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

  const register_job = async (CID: string): Promise<void> => {
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

  const renderedItems = Object.keys(posts || {}).map((key) => {
    if (!posts) return <>No Comments</>;
    const item = posts[key];

    return (
      <div key={key}>
        {/* <h2>Title: {item.streamContent.content.title || "No title"}</h2> */}
        <p>
          <span className="text-muted-foreground">
            {shortenAddress(item.streamContent.content.title || "")}
          </span>{" "}
          {item.streamContent.content.text}
        </p>
        {/* <p>Images:</p>
        <ul>
          {item.streamContent.content.images.map((image, index) => (
            <li key={index}>
              <img src={image} alt={`Image ${index}`} />
            </li>
          ))}
        </ul>
        <p>Videos:</p>
        <ul>
          {item.streamContent.content.videos.map((video, index) => (
            <li key={index}>
              <video controls>
                <source src={video} type="video/mp4" />
              </video>
            </li>
          ))}
        </ul> */}
      </div>
    );
  });

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
        Highlights
      </h1>
      {/* <Separator/> */}
      <ul className="pt-4">
        {recipes.length !== 0 ? (
          recipes.map((recipe, index) => (
            <li key={index}>
              <Card>
                <CardHeader>
                  <CardTitle>{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="pb-2">
                    <img
                      className="rounded-md"
                      src={`https://gateway.lighthouse.storage/ipfs/${recipe.cid}`}
                      alt="Profile Image"
                    />
                  </div>

                  <p>
                    <span className="text-muted-foreground">Ingredients:</span>{" "}
                    {recipe.ingredients}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Instructions:</span>{" "}
                    {recipe.instructions}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Author:</span>{" "}
                    {shortenAddress(recipe.author)}
                  </p>

                  {recipe.cid && (
                    <>
                      <Button onClick={() => getPoDSI(recipe.cid)}>
                        getPoDSI
                      </Button>
                      <Button onClick={() => deal_status(recipe.cid)}>
                        deal_status
                      </Button>
                      <Button onClick={() => register_job(recipe.cid)}>
                        register_job
                      </Button>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  {posts ? (
                    <>
                      <div className="flex flex-col">
                        {renderedItems}
                        <div className="flex flex-col gap-2 py-2">
                          <Input onChange={(e) => setComment(e.target.value)} />
                          <Button onClick={createPublicPost}>
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button onClick={loadPosts}>Open comments</Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </li>
          ))
        ) : (
          <>
            {/* <Skeleton className="w-[100px] h-[20px] rounded-full" /> */}
            <div className="p-4 text-lg">Loading...</div>
          </>
        )}
      </ul>
    </div>
  );
}
