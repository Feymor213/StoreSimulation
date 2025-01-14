using System.Reflection;
using System.Security.Cryptography;
using Newtonsoft.Json;

class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location));
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
    public ProductCategory[] Categories { get; }
    public CustomerType[] CustomerTypes { get; }
    public Checkout[] Checkouts { get; }
    public DeviationCalendar Calendar { get; }

    public SimulationData(int days, int customersPerHour, Product[] products,ProductCategory[] categories , CustomerType[] customers, Checkout[] checkouts, DeviationCalendar calendar)
    {        
        Days = days > 0 ? days : throw new ArgumentException("Amount of days must be a positive number.");
        CustomersPerHour = customersPerHour > 0 ? customersPerHour : throw new ArgumentException("Customers per hour must be a positive number.");
        Products = products ?? throw new ArgumentNullException(nameof(products));
        Categories = categories ?? throw new ArgumentNullException(nameof(categories));
        CustomerTypes = customers ?? throw new ArgumentNullException(nameof(customers));
        Checkouts = checkouts ?? throw new ArgumentNullException(nameof(checkouts));
        Calendar = calendar ?? throw new ArgumentNullException(nameof(calendar));

        CheckUniqueProductsID();
        foreach (CustomerType customerType in CustomerTypes)
        {
            customerType.CompileInterests(Products);
        }
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
                if (!customerType.Interests.ContainsKey(product.ID))
                {
                    
                    throw new ArgumentException($"Customer type {customerType.Name} does not define interest value for product ID {product.ID}");
                }
            }
        }

        if (frequenciesSum != 1) throw new ArgumentException("Frequencies of all customer types must add up to 1");
    }
}

class DeviationCalendar
{
    public Dictionary<int, Deviation> Deviations { get; }

    public DeviationCalendar(Dictionary<int, Deviation> deviations)
    {
        Deviations = deviations;
    }
}
class Deviation
{
    public Dictionary<int, float> ProductInterests { get; }

    public Deviation(Dictionary<int, float> productInterests)
    {
        ProductInterests = productInterests ?? throw new ArgumentNullException(nameof(productInterests));
        foreach (float bias in ProductInterests.Values)
        {
            if (bias < 0 || bias > 1)
            {
                throw new ArgumentException($"Bias can't be less than 0 or more than 1. Got {bias} instead.");
            }
        }
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
    readonly DeviationCalendar calendar;

    List<Customer> activeCustomers = [];

    OutputData outputData;
    int currentDayN;

    public Engine(SimulationData data)
    {
        durationDays = data.Days;
        customersPerHour = data.CustomersPerHour;
        customerTypes = data.CustomerTypes;
        products = data.Products;
        availableCheckouts = data.Checkouts;
        outputData = new OutputData(data);
        calendar = data.Calendar;
    }

    public OutputData GetData()
    {
        return outputData;
    }

    void Tick(Random random) // 1 tick = 1 minute
    {
        Deviation deviation = new Deviation([]);
        if (calendar.Deviations.ContainsKey(currentDayN))
        {
            deviation = calendar.Deviations[currentDayN];
        }
        // Spawn customer
        if (random.Next(100) < customersPerHour/0.6)
        {
            CustomerType type = CustomerType.SelectRandom(customerTypes, random);
            Customer newCustomer = new Customer(type, products, deviation);
            activeCustomers.Add(newCustomer);
            outputData.timesVisited += 1;
            outputData.customerTypeOutput[newCustomer.CustomerTypeID].visits += 1;
        }

        // Update customers, who are still shopping
        foreach (Customer customer in activeCustomers.ToArray())
        {
            customer.timeInStore += 1;
            outputData.customerTypeOutput[customer.CustomerTypeID].totalTimeInStore += 1;

            if (customer.cooldownToNextPurchase > 0)
            {
                // Customer takes the time to decide / find the next product
                customer.cooldownToNextPurchase -= 1;
                continue;
            }

            if (customer.shoppingList.Count == 0)
            {
                // Move customer from shipping hall to the checkouts
                Checkout.GetCheckoutWithLeastCustomers(availableCheckouts).queue.Add(customer);
                activeCustomers.Remove(customer);
                
                continue;
            }

            // Take the product from the shelf
            Product takenProduct = customer.shoppingList.Pop();
            customer.cart.Push(takenProduct);
            outputData.productOutput[takenProduct.ID].soldByShoppingList += 1;
            outputData.productOutput[takenProduct.ID].amountSold += 1;

            // Take another one by impulse
            if (random.Next(100) < customer.Impulsivity*100)
            {
                // Take random product
                customer.cart.Push(products[random.Next(products.Length)]);
                outputData.productOutput[takenProduct.ID].soldByImpulse += 1;
                outputData.productOutput[takenProduct.ID].amountSold += 1;
            }

            customer.cooldownToNextPurchase = 3; // 3 min
        }

        // Update checkouts
        foreach (Checkout checkout in availableCheckouts)
        {
            if (checkout.queue.Count == 0) continue;

            // Update waiting count for everyone waiting
            foreach (Customer customer in checkout.queue)
            {
                if (customer == checkout.queue[0]) {continue;} // Don't update time for the first customer (one being served right now)
                customer.minutesInQueue += 1;
                if (customer.minutesInQueue >= customer.Patience) {checkout.queue.Remove(customer);} // Customer leaves if his patience was exhausted
            }

            if (checkout.queue[0].cart.Count == 0)
            {
                // Customer leaves the store
                Customer customer = checkout.queue[0];
                checkout.queue.RemoveAt(0);
                outputData.transactions += 1;
                outputData.totalTimeInStore += customer.timeInStore;
                outputData.customerTypeOutput[customer.CustomerTypeID].transactions += 1;
                outputData.checkoutOutput[checkout.ID].transactions += 1;

                continue;
            }

            // Next item in the customer's cart is processed
            Product soldProduct = checkout.queue[0].cart.Pop();
            outputData.profits += soldProduct.Price;
            outputData.customerTypeOutput[checkout.queue[0].CustomerTypeID].totalProfit += soldProduct.Price;
            outputData.customerTypeOutput[checkout.queue[0].CustomerTypeID].totalProductsPurchased += 1;
            outputData.checkoutOutput[checkout.ID].profits += soldProduct.Price;
            outputData.productsPurchased += 1;
        }
    }

    public void Mainloop()
    {
        Random random = new Random();
        for (int i = 0; i < durationDays; i++)
        {
            currentDayN = i;
            for (int j = 0; j < duration_hours*60; j++)
            {
                Tick(random);
            }
        }
        
        foreach (Checkout checkout in availableCheckouts)
        {
            outputData.opCosts += (checkout.HumanCost + checkout.TechnicalCost)*duration_hours*durationDays;
            outputData.checkoutOutput[checkout.ID].humanCost += checkout.HumanCost*duration_hours*durationDays;
            outputData.checkoutOutput[checkout.ID].technicalCost += checkout.TechnicalCost*duration_hours*durationDays;
        }
    }
}

class OutputData
{
    public int timesVisited;
    public int transactions;
    public int productsPurchased;
    public int totalTimeInStore;
    public int profits;
    public int opCosts;

    public Dictionary<int, CheckoutOutput> checkoutOutput;
    public Dictionary<int, ProductOutput> productOutput;
    public Dictionary<int, CustomerTypeOutput> customerTypeOutput;

    public OutputData(SimulationData data)
    {
        checkoutOutput = [];
        foreach (Checkout checkout in data.Checkouts)
        {
            checkoutOutput[checkout.ID] = new CheckoutOutput();
        }

        productOutput = [];
        foreach (Product product in data.Products)
        {
            productOutput[product.ID] = new ProductOutput(product.Name, product.Price);
        }

        customerTypeOutput = [];
        foreach (CustomerType customer in data.CustomerTypes)
        {
            customerTypeOutput[customer.ID] = new CustomerTypeOutput();
        }
    }

    public void Print()
    {
        Console.WriteLine($"Times visited: {timesVisited}");
        Console.WriteLine($"Transactions: {transactions}");
        Console.WriteLine($"Purchased products: {productsPurchased}");
        Console.WriteLine($"Profits: {profits}");
        Console.WriteLine($"Operating costs: {opCosts}");
    }
}
class CheckoutOutput
{
    public int profits;
    public int technicalCost;
    public int humanCost;
    public int transactions;
}
class ProductOutput
{
    public readonly string name;
    public readonly int price;
    public int amountSold;
    public int soldByShoppingList;
    public int soldByImpulse;

    public ProductOutput(string name, int price)
    {
        this.name = name;
        this.price = price;
    }
}
class CustomerTypeOutput
{
    public int visits;
    public int transactions;
    public int totalProductsPurchased;
    public int totalTimeInStore;
    public int totalProfit;
}

class CustomerType
{
    public int ID { get; }
    public string Name { get; }
    public float Frequency { get; } // Value range: <0, 1>. How frequently the customer shows up.
    private Dictionary<int, float> interests = [];
    public Dictionary<int, float> Interests { get {return interests;} } // Keys - product IDs. Values - interest in the product in range <0, 1>.
    public Dictionary<int, float> ProductInterests { get; }
    public Dictionary<int, float> CategoryInterests { get; }
    public float Impulsivity { get; } // Value range: <0, 1>. Chance to buy the product impulsively.
    public int Patience { get; } // Minutes before leaving the store while standing in queue at the checkout

    public CustomerType(int id, string name, float frequency, Dictionary<int, float> interestsProducts, Dictionary<int, float> interestsCategories, float impulsivity, int patience)
    {
        ID = id;
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Frequency = frequency >= 0 && frequency <= 1 ? frequency : throw new ArgumentException("Frequency value must be in range between 0 and 1");
        ProductInterests = interestsProducts ?? throw new ArgumentNullException(nameof(interestsProducts));
        CategoryInterests = interestsCategories ?? throw new ArgumentNullException(nameof(interestsCategories));
        Impulsivity = impulsivity >= 0 && impulsivity <= 1 ? impulsivity : throw new ArgumentException("Impulsivity value must be in range between 0 and 1");
        Patience = patience >= 0 && patience <= 100 ? patience : throw new ArgumentException("Patience value must be in range between 0 and 100");
    }

    // Create a single interests dictinary out of two (product interest and category interests). Product interests are preferred.
    public void CompileInterests(Product[] products)
    {
        Dictionary<int, float> newInterests = [];
        foreach (Product product in products)
        {
            if (ProductInterests.ContainsKey(product.ID))
            {
                newInterests[product.ID] = ProductInterests[product.ID];
                continue;
            }
            newInterests[product.ID] = CategoryInterests[product.CategoryID];
        }

        interests = newInterests;
    }

    public static CustomerType SelectRandom(CustomerType[] customerTypes, Random random)
    {
        Dictionary<int, CustomerType> breakpoints = [];

        int currentBreakPoint = 0;
        int pointer = random.Next(100);
        int selectedBreakpoint = int.MaxValue;

        foreach (CustomerType customerType in customerTypes)
        {
            int newBreakpoint = currentBreakPoint+(int)(customerType.Frequency*100);
            breakpoints[newBreakpoint] = customerType;
            currentBreakPoint = newBreakpoint;

            int distance = newBreakpoint - pointer;
            if (distance >= 0 && distance < selectedBreakpoint)
            {
                selectedBreakpoint = newBreakpoint;
            }
        }

        return breakpoints[selectedBreakpoint];
    }
}

class Customer
{
    public int CustomerTypeID { get; }
    public Dictionary<int, float> Interests { get; }
    public float Impulsivity { get; }
    public int Patience { get; }
    public Stack<Product> shoppingList;

    public Stack<Product> cart = [];
    
    public int cooldownToNextPurchase = 0;
    public int minutesInQueue = 0;
    public int timeInStore = 0;

    public Customer(CustomerType customerType, Product[] availableProducts, Deviation deviation)
    {
        Interests = customerType.Interests;
        Impulsivity = customerType.Impulsivity;
        Patience = customerType.Patience;
        shoppingList = GenerateShoppingList(availableProducts, deviation);
        CustomerTypeID = customerType.ID;
    }

    Stack<Product> GenerateShoppingList(Product[] availableProducts, Deviation deviation)
    {
        Stack<Product> list = [];
        Random random = new Random();
        foreach (Product product in availableProducts)
        {
            float interest = Interests[product.ID];
            if (deviation.ProductInterests.Keys.Contains(product.ID))
            {
                interest = deviation.ProductInterests[product.ID];
            }
            if (random.Next(100) < interest*100) list.Push(product);
        }
        return list;
    }
}

class Checkout
{
    public int ID { get; }
    public int Capacity { get; } // Customers per hour 
    public int HumanCost { get; } // Per hour
    public int TechnicalCost { get; } // Per hour
    public List<Customer> queue = [];

    public Checkout(int id, int capacity, int humanCost, int technicalCost)
    {
        ID = id;
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

class ProductCategory
{
    public int ID { get; }
    public string Name { get; }

    public ProductCategory(int id, string name)
    {
        ID = id > 0 ? id : throw new ArgumentException($"ID must be a positive integer. Got {id} instead.");
        Name = name ?? throw new ArgumentNullException(nameof(name));
    }

    public static ProductCategory GetByID(ProductCategory[] categories, int id)
    {
        foreach (ProductCategory category in categories)
        {
            if (category.ID == id)
            {
                return category;
            }
        }
        throw new ArgumentOutOfRangeException($"Category with id {id} does not exist");
    }
}

struct Product
{
    public int ID { get; }
    public string Name { get; }
    public int Price { get; }
    public int CategoryID { get; }
    public Product(int id, string name, int price, int categoryID)
    {
        ID = id > 0 ? id : throw new ArgumentException($"ID must be a positive integer. Got {id} instead.");
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Price = price > 0 ? price : throw new ArgumentException($"Price must be a positive integer. Got {price} instead.");
        CategoryID = categoryID;
    }
}