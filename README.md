# RecipeAgora

<br />
<div align="center">
  <img src="https://github.com/aeither/recipe-agora/assets/36173828/992855f4-48b8-43cc-aed5-13f7da9f160b" alt="Logo" width="180" >

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

### 4.Start

```
pnpm dev
```

The demo has been successfully launched. Try it!

## Extra

**Registering a recipe**

https://calibration.filfox.info/en/message/bafy2bzaceab5kwtjivvvkuasg3djzo4ev6v4shwjky2zultydl7tdd7e7rgy2?t=1

**Explore and register**

![CleanShot 2023-09-21 at 17 42 57@2x](https://github.com/aeither/recipe-agora/assets/36173828/bfd255a0-57a4-421c-ad62-6922018ef60a)

**Add comment**

![Add comment](https://github.com/aeither/recipe-agora/assets/36173828/910e2788-53ae-41bd-81db-12207e79975e)

**Share recipes**

![Share recipes](https://github.com/aeither/recipe-agora/assets/36173828/bd07d601-a018-46d5-8487-76b64e8c3d58)



