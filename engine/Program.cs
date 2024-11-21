
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

class Program
{
    public static void Main(string[] args)
    {
        string inputFile = "testdata/input.json";
        string json = File.ReadAllText(inputFile);
        SimulationData data = JsonConvert.DeserializeObject<SimulationData>(json) ?? throw new ArgumentNullException(nameof(json));

        Engine engine = new Engine(data);
        engine.Mainloop();

        string outputFile = "testdata/output.json";
        File.WriteAllText(outputFile, JsonConvert.SerializeObject(engine.GetData()));
    }
}

class SimulationData
{
    public int Days { get; }
    public int CustomersPerHour { get; }
    public Product[] Products { get; }
    public CustomerType[] CustomerTypes { get; }
    public Checkout[] Checkouts { get; }

    public SimulationData(int days, int customersPerHour, Product[] products, CustomerType[] customers, Checkout[] checkouts)
    {        
        Days = days > 0 ? days : throw new ArgumentException("Amount of days must be a positive number.");
        CustomersPerHour = customersPerHour > 0 ? customersPerHour : throw new ArgumentException("Customers per hour must be a positive number.");
        Products = products ?? throw new ArgumentNullException(nameof(products));
        CustomerTypes = customers ?? throw new ArgumentNullException(nameof(customers));
        Checkouts = checkouts ?? throw new ArgumentNullException(nameof(checkouts));

        CheckUniqueProductsID();
        CheckCustomerTypes();
    }

    // If all have distinct IDs
    void CheckUniqueProductsID()
    {
        List<int> encounteredIDs = [];
        foreach (Product product in Products)
        {
            if (encounteredIDs.Contains(product.ID)) throw new ArgumentException($"Duplicate product ID: {product.ID}");
            encounteredIDs.Add(product.ID);
        }
    }    

    // If all frequencies add up to 1 and if has defined interests for all products
    void CheckCustomerTypes()
    {
        float frequenciesSum = 0;

        foreach (CustomerType customerType in CustomerTypes)
        {
            frequenciesSum += customerType.Frequency;
            foreach (Product product in Products)
            {
                if (!customerType.Interests.ContainsKey(product.ID)) throw new ArgumentException($"Customer type {customerType.Name} does not define interest value for product ID {product.ID}");
            }
        }

        if (frequenciesSum != 1) throw new ArgumentException("Frequencies of all customer types must add up to 1");
    }
}

class Engine
{
    readonly int durationDays;
    const int duration_hours = 8;
    readonly int customersPerHour;
    readonly Product[] products;
    readonly Checkout[] availableCheckouts;
    readonly CustomerType[] customerTypes;

    List<Customer> activeCustomers = [];

    OutputData outputData;

    public Engine(SimulationData data)
    {
        durationDays = data.Days;
        customersPerHour = data.CustomersPerHour;
        customerTypes = data.CustomerTypes;
        products = data.Products;
        availableCheckouts = data.Checkouts;
    }

    public OutputData GetData()
    {
        return outputData;
    }

    void Tick(Random random) // 1 tick = 1 minute
    {
        // Spawn customer
        if (random.Next(100) < customersPerHour) // Shitty wrong logic.
        {
            CustomerType type = customerTypes[0]; // TEMPORARY SHIT. Type will be selected randomly
            activeCustomers.Add(new Customer(type, products));
            outputData.timesVisited += 1;
        }

        // Update customers, who are still shopping
        foreach (Customer customer in activeCustomers.ToArray())
        {
            if (customer.cooldownToNextPurchase > 0)
            {
                // Customer takes the time to decide / find the next product
                customer.cooldownToNextPurchase -= 1;
                continue;
            }

            if (customer.shoppingList.Count == 0)
            {
                // Move customer from shipping hall to the checkouts
                Checkout.GetCheckoutWithLeastCustomers(availableCheckouts).queue.Enqueue(customer);
                activeCustomers.Remove(customer);
                
                continue;
            }

            // Take the product from the shelf
            customer.cart.Push(customer.shoppingList.Pop());
            customer.cooldownToNextPurchase = 3; // 3 min
        }

        // Update checkouts
        foreach (Checkout checkout in availableCheckouts)
        {
            if (checkout.queue.Count == 0) continue;

            if (checkout.queue.Peek().cart.Count == 0)
            {
                // Customer leaves the store
                checkout.queue.Dequeue();
                outputData.transactions += 1;

                continue;
            }

            // Next item in the customer's cart is processed
            outputData.profits += checkout.queue.Peek().cart.Pop().Price;
            outputData.productsPurchased += 1;
        }
    }

    public void Mainloop()
    {
        Random random = new Random();
        for (int i = 0; i < durationDays*duration_hours*60; i++)
        {
            Tick(random);
        }
        
        foreach (Checkout checkout in availableCheckouts)
        {
            outputData.opCosts += (checkout.HumanCost + checkout.TechnicalCost)*duration_hours*durationDays;
        }
    }
}

struct OutputData
{
    public int timesVisited;
    public int transactions;
    public int productsPurchased;
    public int profits;
    public int opCosts;

    public void Print()
    {
        Console.WriteLine($"Times visited: {timesVisited}");
        Console.WriteLine($"Transactions: {transactions}");
        Console.WriteLine($"Purchased products: {productsPurchased}");
        Console.WriteLine($"Profits: {profits}");
        Console.WriteLine($"Operating costs: {opCosts}");
    }
}

class CustomerType
{
    public string Name { get; }
    public float Frequency { get; } // Value range: <0, 1>. How frequently the customer shows up.
    public Dictionary<int, float> Interests { get; } // Keys - product IDs. Values - interest in the product in range <0, 1>.
    public float Impulsivity { get; } // Value range: <0, 1>. Chance to buy the product impulsively.
    public int Patience { get; } // Minutes before leaving the store while standing in queue at the checkout

    public CustomerType(string name, float frequency, Dictionary<int, float> interests, float impulsivity, int patience)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Frequency = frequency >= 0 && frequency <= 1 ? frequency : throw new ArgumentException("Frequency value must be in range between 0 and 1");
        Interests = interests ?? throw new ArgumentNullException(nameof(interests));
        Impulsivity = impulsivity >= 0 && impulsivity <= 1 ? impulsivity : throw new ArgumentException("Impulsivity value must be in range between 0 and 1");
        Patience = patience >= 0 && patience <= 100 ? patience : throw new ArgumentException("Patience value must be in range between 0 and 100");
    }
}

class Customer
{
    public Dictionary<int, float> Interests { get; }
    public float Impulsivity { get; }
    public int Patience { get; }
    public Stack<Product> shoppingList;

    public Stack<Product> cart = [];
    
    public int cooldownToNextPurchase = 0;

    public Customer(CustomerType customerType, Product[] availableProducts)
    {
        Interests = customerType.Interests;
        Impulsivity = customerType.Impulsivity;
        Patience = customerType.Patience;
        shoppingList = GenerateShoppingList(availableProducts);
    }

    Stack<Product> GenerateShoppingList(Product[] availableProducts)
    {
        Stack<Product> list = [];
        Random random = new Random();
        foreach (Product product in availableProducts)
        {
            if (random.Next(100) < Interests[product.ID]*100) list.Push(product);
        }
        return list;
    }
}

class Checkout
{
    public int Capacity { get; } // Customers per hour 
    public int HumanCost { get; } // Per hour
    public int TechnicalCost { get; } // Per hour
    public Queue<Customer> queue = [];

    public Checkout(int capacity, int humanCost, int technicalCost)
    {
        Capacity = capacity > 0 ? capacity : throw new ArgumentException($"Checkout capacity value must be a positive integer. Got {capacity} instead.");
        HumanCost = humanCost > 0 ? humanCost : throw new ArgumentException($"Checkout human cost value must be a positive integer. Got {humanCost} instead.");
        TechnicalCost = technicalCost > 0 ? technicalCost : throw new ArgumentException($"Checkout technical cost value must be a positive integer. Got {technicalCost} instead.");
    }

    public static Checkout GetCheckoutWithLeastCustomers(Checkout[] checkouts)
    {
        if (checkouts.Length == 0) {throw new Exception("Checkout array must not be empty");}
        Checkout leastCustomersCheckout = checkouts[0];
        foreach (Checkout checkout in checkouts)
        {
            if (checkout.queue.Count < leastCustomersCheckout.queue.Count)
            {
                leastCustomersCheckout = checkout;
            }
        }
        return leastCustomersCheckout;
    }
}

struct Product
{
    public int ID { get; }
    public string Name { get; }
    public int Price { get; }
    public Product(int id, string name, int price)
    {
        ID = id > 0 ? id : throw new ArgumentException($"ID must be a positive integer. Got {id} instead.");
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Price = price > 0 ? price : throw new ArgumentException($"Price must be a positive integer. Got {price} instead.");
    }
}