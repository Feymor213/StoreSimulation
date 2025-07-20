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

export interface NewSimDataShort {
  days: number,
  customersPerHour: number,
  products: string[],
  customers: Array<{
    customerID: string,
    frequency: number
  }>,
  checkouts: string[],
}

export interface NewSimDataFull {
  days: number,
  customersPerHour: number,
  products: ProductFull[],
  customers: CustomerTypeFull[]
  checkouts: CheckoutTypeFull[],
  calendar: Calendar
}
export interface ProductFull {
  id: string,
  name: string,
  price: number
}
export interface CustomerTypeFull {
  id: string,
  name: string,
  frequency: number,
  impulsivity: number,
  patience: number,
  interests: Record<string, number>
}
export interface CheckoutTypeFull {
  id: string,
  capacity: number,
  humanCost: number,
  technicalCost: number
}
export interface Calendar {
  deviations: Record<string, Record<string, number>>
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