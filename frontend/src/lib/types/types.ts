export interface CustomerData {
  customer: {
    name: string,
    impulsivity: number,
    patience: number,
    default: boolean
  }
  interestsCategory: interestsCategory[];
  interestsProduct: interestsProduct[];
}
export interface interestsCategory {
  categoryID: string,
  interest: number
}
export interface interestsProduct {
  productID: string,
  interest: number
}

export interface NewCheckoutData {
  name: string,
  capacity: number,
  humanCost: number,
  technicalCost: number
}


export type ParameterDeleteAsync = (id: string) => Promise<{success: boolean}>;

export interface SimOutputData {
  timesVisited: number,
  transactions: number,
  productsPurchased: number,
  totalTimeInStore: number,
  profits: number,
  opCosts: number,
  checkoutOutput: Record<string, CheckoutOutputData>,
  productOutput: Record<string, ProductOutputData>,
  customerTypeOutput: Record<string, CustomerOutputData>
}
export interface CheckoutOutputData {
  profits: number,
  technicalCost: number,
  humanCost: number,
  transactions: number,
}
export interface ProductOutputData {
  name: string,
  price: number,
  amountSold: number,
  soldByShoppingList: number,
  soldByImpulse: number,
}
export interface CustomerOutputData {
  visits: number,
  transactions: number,
  totalProductsPurchased: number,
  totalTimeInStore: number,
  totalProfit: number,
}

export interface StandardAPIResponse {
  success: boolean,
  message: string,
  [key: string]: any;
}