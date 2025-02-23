export interface CustomerData {
    customer: {
        name: string,
        impulsivity: number,
        patience: number,
        default: boolean
    }
    interestsCategory: Array<interestsCategory>;
    interestsProduct: Array<interestsProduct>;
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