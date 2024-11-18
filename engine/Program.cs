
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

    void Tick(Random random)
    {
        foreach (Customer customer in customers)
        {
            foreach (Product product in products)
            {
                if (!customer.cart.Contains(product) && random.Next(100) < customer.interests[product.id])
            }
        }
    }

    void Mainloop()
    {
        Random random = new Random();
        for (int i = 0; i < duration_days*duration_hours; i++)
        {
            Tick(random);
        }
    }
}

struct OutputData
{
    int timesVisited;
    int transactions;
    int productsPurchased;
    int profits;
    int opCosts;
}

class Customer
{
    public readonly Dictionary<int, float> interests; // ProductID -> interest
    public readonly float impulsivity;
    public readonly int patience;

    public Product[] cart;
    public readonly Product[] ShoppingList;

    public Customer(Dictionary<int, float> interests, float impulsivity, int patience)
    {
        if (!AreValidValues())
        {
            throw new ArgumentException("Invalid values provided for the customer instance");
        }
        this.interests = interests;
        this.impulsivity = impulsivity;
        this.patience = patience;
        this.cart = [];
    }

    void SetShoppingList()
    {

    }

    bool AreValidValues()
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
    public readonly int id;
    public readonly int humanCost; // Per hour
    public readonly int technicalCost; // Per hour
}

struct Product
{
    public readonly int id;
    public readonly int name;
    public readonly int price;
}