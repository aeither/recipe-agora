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

This example adds some commonly used
[dweb-toolkit](https://github.com/dataverse-os/dweb-toolkits) on top of the
base. In this example, the models will be diverse and varied.

In this example, each toolkit has its own models. In addition to the `post` and
`profile` models in the base, you can find different toolkit models in the
`./with-toolkits/models/toolkits` folder.

## Run

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
