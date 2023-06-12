using System;
using System.Collections.Generic;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            Mainloop loop = new Mainloop(2, 30, 600, 120, 30);
            loop.Start();
            loop.statsOutput.Display();
        }
    }

    class Stats
    {
        public int customersServed, checkoutsUsed, totalSimulationTime, maxQueueFill, customersLeft, customerWaitLimit;
        public double averageWaitTime, averageQueueFill, averageGroceriesCount;
        public int waitTimeEntries, queueFillEntries, groceryCountEntries;

        public void Display()
        {
            Console.WriteLine("Simulation ran for {0} seconds with {1} seconds of customer patience while using {2} checkouts:", totalSimulationTime, customerWaitLimit, checkoutsUsed);
            Console.WriteLine("\nServed {0} Customers.", customersServed);
            Console.WriteLine("{0} customers left while waiting in queue.", customersLeft);
            Console.WriteLine("Maximum recorded queue length was {0} people.", maxQueueFill);
            Console.WriteLine("\nAverage waiting time was {0} seconds.", averageWaitTime);
            Console.WriteLine("Average queue length was {0} people.", averageQueueFill);
            Console.WriteLine("Each customer had an average of {0} grocery items.", averageGroceriesCount);
        }

        public void AddToAverageWaitTime(int waitTime)
        {
            averageWaitTime = (averageWaitTime*waitTimeEntries + waitTime)/(waitTimeEntries+1);
            waitTimeEntries += 1;
        }

        public void AddToAverageQueueFill(int queueLength)
        {
            averageQueueFill = (averageQueueFill*queueFillEntries + queueLength)/(queueFillEntries+1);
            queueFillEntries += 1;
        }

        public void AddToAverageGroceriesCount(int groceriesCount)
        {
            averageGroceriesCount = (averageGroceriesCount*groceryCountEntries + groceriesCount)/(groceryCountEntries+1);
            groceryCountEntries += 1;
        }
    }

    class Mainloop 
    {
        public static int currentTick = 0;
        public int simulationTimeLimit, secondsTillNewCustomer, customerWaitLimit, averageGroceriesCount;
        private bool instanceExists = false;
        Checkout[] checkouts;
        public Stats statsOutput = new Stats();

        public Mainloop(int checkoutN, int secondsTillNewCustomer, int simulationTimeLimit, int customerWaitLimit, int averageGroceriesCount)
        {
            if(instanceExists){
                throw new Exception("You may only create one instance of the \"Mainloop\" class.");
            }
            instanceExists = true;
            this.simulationTimeLimit = simulationTimeLimit;
            this.secondsTillNewCustomer = secondsTillNewCustomer;
            this.customerWaitLimit = customerWaitLimit;
            this.averageGroceriesCount = averageGroceriesCount;
            checkouts = new Checkout[checkoutN];
            for(int i = 0; i < checkouts.Length; i++)
            {
                checkouts[i] = new Checkout(statsOutput);
            }
            
            statsOutput.checkoutsUsed = checkoutN;
            statsOutput.totalSimulationTime = simulationTimeLimit;
            statsOutput.customerWaitLimit = customerWaitLimit;
        }

        public void Start()
        {
            for(int i = 0; i < this.simulationTimeLimit; i++)
            {
                Mainloop.currentTick = i;
                Tick(i);
            }
        }

        public void Tick(int currentTick)
        {
            Random random = new Random();
            if(random.Next(secondsTillNewCustomer) == 0) //Activates on average once in [secondsTillNewCustomer] ticks and simulates a new customer walking in.
            {
                Checkout optimalCheckout = checkouts[0];
                foreach(Checkout checkout in checkouts)
                {
                    if(checkout.TotalWaitTime() < optimalCheckout.TotalWaitTime())
                    {
                        optimalCheckout = checkout;
                    }
                }
                int groceriesCount = random.Next(averageGroceriesCount*2);
                optimalCheckout.AddNewCustomer(new Customer(groceriesCount, currentTick, customerWaitLimit));

                statsOutput.AddToAverageGroceriesCount(groceriesCount);
            }
            foreach(Checkout checkout in checkouts)
            {
                checkout.ServeNext();
                checkout.KickOutAnnoyed();
            }
        }

        ~Mainloop() {
            instanceExists = false;
        }
        
    }

    class Customer
    {
        public int groceriesCount; //Equals to how long will it take to serve this customer at the checkout (each grocery item takes 1s to process).
        public int waitingLimit; //How long will the customer wait before going away.
        public int joinedAt;

        public Customer(int groceriesCount, int timeStamp, int waitingLimit)
        {
            this.groceriesCount = groceriesCount;
            this.waitingLimit = waitingLimit;
            joinedAt = timeStamp;
        }

        public bool WaitingExceeded(int currentTimeStamp)
        {
            if(joinedAt + waitingLimit <= currentTimeStamp)
            {
                return true;
            }
            return false;
        }
    }

    class Checkout
    {
        private List<Customer> queue = new List<Customer>();
        private int unavaliableTill = 0; //Index of tick, when the previous customer can be concidered served.
        public Stats statsOutput;

        public Checkout(Stats statsOutput)
        {
            this.statsOutput = statsOutput;
        }

        public IReadOnlyCollection<Customer> CustomerList()
        {
            return queue.AsReadOnly();
        }

        public void AddNewCustomer(Customer customer)
        {
            queue.Add(customer);

            if(statsOutput.maxQueueFill < queue.Count)
            {
                statsOutput.maxQueueFill = queue.Count;
            }
            statsOutput.AddToAverageQueueFill(queue.Count);
        }

        public void ServeNext()
        {
            if(queue.Count == 0)
            {
                return;
            }
            if (Mainloop.currentTick <= unavaliableTill)
            {
                return;
            }
            Customer customer = queue[0];
            unavaliableTill = Mainloop.currentTick + customer.groceriesCount;
            
            statsOutput.customersServed += 1;
            statsOutput.AddToAverageWaitTime(Mainloop.currentTick - customer.joinedAt);

            queue.RemoveAt(0);
            queue.TrimExcess();
        }

        public void KickOutAnnoyed() //Makes a customer go away if they waited for too long.
        {
            if(queue.Count == 0)
            {
                return;
            }
            if(queue[0].WaitingExceeded(Mainloop.currentTick))
            {
                statsOutput.customersLeft += 1;
                statsOutput.AddToAverageWaitTime(queue[0].waitingLimit);

                queue.RemoveAt(0);
                queue.TrimExcess();
            }
        }

        public int TotalWaitTime() //returns sum of all customers' waiting times. Basically how long will it take for this checkout to empty it's queue.
        {
            int total = Math.Abs(unavaliableTill-Mainloop.currentTick);
            foreach(Customer customer in queue)
            {
                total += customer.groceriesCount;
            }
            return total;
        }
    }
}
