# RecipeAgora

<br />
<div align="center">
  <img src="https://github.com/aeither/recipe-agora/assets/36173828/588b543b-dc29-4da0-90b0-ae1710d5a1ac" alt="Logo" width="180" >

<h3 align="center">RecipeAgora</h3>
  <p align="center">
    Community owned recipe database.
    <br />
  </p>
</div>

## Overview

RecipeAgora is a decentralized recipe sharing that redefines the way you discover, cherish, and share your favorite recipes. It encapsulates the essence of culinary artistry and community interaction. The web app provides a secure way to share and store forever your cherished recipes, ensuring they remain intact and accessible for generations to come. Recipe Registry: We leverage the power of FVM, not only to store but also to validate and register recipes securely. Users can explore recipes and attach RaaS workers to preserve those recipes forever or make them more available by replicating. For passionate cooks, the user interface offers a simple form to upload a photo of your dish, find the ingredients and add a step by step guide to it.

## How technologies are used

**FVM** Smart contract deployed to Calibration Testnet to ensure the integrity of the recipes. File upload. Check Deal Status and Community RaaS to renew and replicate the community's loved recipes.

**Lighthouse**: Seamlessly manages file uploads. Check PoDSI. Attaching RaaS (Renew, Replicate)

**DataverseOS**: Fueling the social aspect of our platform, bringing foodies together to explore, comment, and celebrate the joy of cooking.

## Instructions

### 1.Prepare

Before running example, you need to install `create-dataverse-app`.

```
pnpm install -g create-dataverse-app
```

### 2.Install

```
pnpm install
```

### 3.Deploy

```
dataverseos deploy
```

This step will need your private key to generate personal signature. Rest
assured, Dataverse will not store or disclose your private key..

After successful deployment, you can find the generated `./output/app.json`,
which contains various information about this new dapp.

### 4.Setup

Copy the enviroment variable from example and fill them out from their respective provider.

```
cp .env.example .env
```

### 5.Start

```
pnpm dev
```

The demo has been successfully launched. Try it!

## Extra

**Registering a recipe**

https://calibration.filfox.info/en/message/bafy2bzaceab5kwtjivvvkuasg3djzo4ev6v4shwjky2zultydl7tdd7e7rgy2?t=1

**Explore and register**

![Explore and register](https://github.com/aeither/recipe-agora/assets/36173828/7e5f136d-775a-4097-bffc-970c435752f0)

**Add comment**

![Share recipes](https://github.com/aeither/recipe-agora/assets/36173828/4fdd8b3d-43ff-4b53-b561-e43f1c2eb2b7)

**Share recipes**

![Add comment](https://github.com/aeither/recipe-agora/assets/36173828/b0b56fc9-0a4d-47d1-8a19-acfdae4bdeae)

## What next

- Unlockables recipes
- Fully Community governed
- Video and slides photo view
- Save and organize recipes
