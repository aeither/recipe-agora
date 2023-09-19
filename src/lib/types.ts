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
