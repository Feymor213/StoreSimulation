
class Program
{
    public static void Main(string[] args)
    {
        string inputFile = "testdata/input.json";
        string outputFile = "testdata/output.json";
    }
}

class Engine
{
    int duration_days;
    int duration_hours = 8;
    int customers_eveery_hour;
    Product[] products;
    Customer[] customers;

    public Engine(int duration_days, Product[] products, Customer[] customers, int customers_eveery_hours)
    {
        foreach (Customer customer in customers)
        {
            if (!IsValidCustomer(customer))
            {
                throw new ArgumentException("Customer must have interest defined for all of the products");
            }
        }
        this.customers = customers;
    }

    public bool IsValidCustomer(Customer customer) // If has interests for all products defined
    {
        foreach (Product product in products)
        {
            if (!customer.interests.Keys.Contains(product.id))
            {
                return false;
            }
        }
        return true;
    }

    void Tick()
    {

    }

    void Mainloop()
    {

    }
}

struct OutputData
{
    int timesVisited;
    int timesBought;
    int profits;
    int opCosts;
}

class Customer
{
    public Dictionary<int, float> interests; // ProductID -> interest
    float impulsivity;
    int patience;

    public bool AreValidValues()
    {
        if (
            impulsivity < 0 || impulsivity > 1 ||
            patience < 0 || patience > 100
        )
        {
            return false;
        }
        foreach (float interest in interests.Values)
        {
            if (interest < 0 || interest > 1)
            {
                return false;
            }
        }
        return true;
    }
}

struct Checkout
{
    int id;
}

struct Product
{
    public readonly int id;
    public readonly int name;
    public readonly int price;
}