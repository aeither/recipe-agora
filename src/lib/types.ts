type FoodSearchCriteria = {
  query: string;
  dataType: string[];
  pageSize: number;
  pageNumber: number;
  sortBy: string;
  sortOrder: string;
  brandOwner: string;
  tradeChannel: string[];
  startDate: string;
  endDate: string;
};

type FoodNutrient = {
  number: number;
  name: string;
  amount: number;
  unitName: string;
  derivationCode: string;
  derivationDescription: string;
};

export type Food = {
  fdcId: number;
  dataType: string;
  description: string;
  foodCode: string;
  foodNutrients: FoodNutrient[];
  publicationDate: string;
  scientificName: string;
  brandOwner: string;
  gtinUpc: string;
  ingredients: string;
  ndbNumber: number;
  additionalDescriptions: string;
  allHighlightFields: string;
  score: number;
};

export type FoodSearchResponse = {
  foodSearchCriteria: FoodSearchCriteria;
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: Food[];
};

export interface Recipe {
  title: string;
  ingredients: string;
  instructions: string;
  author: string;
  cid: string;
}

interface StreamContent {
  content: {
    text: string;
    title?: string;
    counter?: string;
    images: string[];
    videos: string[];
    createdAt: string;
    updatedAt: string;
    appVersion: string;
    encrypted: string;
  };
  file: {
    indexFileId: string;
    comment: {
      mirrorName: string;
      note: string;
      tags: string[];
    };
    fileType: number;
    contentId: string;
    createdAt: string;
    updatedAt: string;
    appVersion: string;
    contentType: string;
  };
}

interface StreamData {
  pkh: string;
  appId: string;
  modelId: string;
  streamContent: StreamContent;
}

export interface StreamDataMap {
  [key: string]: StreamData;
}
