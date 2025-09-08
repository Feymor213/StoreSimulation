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