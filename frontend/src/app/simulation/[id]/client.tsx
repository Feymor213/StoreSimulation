import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import { AuthModel } from "pocketbase";
import { SimulationOutputData } from "@/lib/types/simulation";
import { Simulation } from "@/lib/types/pocketbase";

const SimulationResults = async ({ id, user, simulation }: { id: string, user: AuthModel, simulation: Simulation }) => {
  if (!simulation.outputData) {
    return <div>No output data available for this simulation.</div>;
  }
  const data = JSON.parse(simulation.outputData) as SimulationOutputData;

  // Calculate derived metrics
  const avgItemsInCart = data.productsPurchased / data.transactions;
  const avgTimeInStore = data.totalTimeInStore / data.timesVisited;
  const avgItemPrice = data.profits / data.productsPurchased;
  const totalRevenue = data.profits;
  const totalExpenses = data.opCosts;
  const numCheckouts = Object.keys(data.checkoutOutput).length;

  const formatCurrency = (value: number) => `$${(value / 100).toFixed(2)}`;
  const formatTime = (minutes: number) => `${minutes.toFixed(1)} min`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header loggedIn={} /> */}
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Simulation Results of {simulation.name}
          </h1>
          <p className="text-muted-foreground">
            {simulation.description}
          </p>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.timesVisited}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.transactions}</div>
              <p className="text-xs text-muted-foreground">
                {((data.transactions / data.timesVisited) * 100).toFixed(1)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Items per Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgItemsInCart.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Time in Store</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(avgTimeInStore)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.productsPurchased}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Item Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgItemPrice)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Number of Checkouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numCheckouts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue - totalExpenses)}</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Customer Types Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Customer Types Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Type</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Avg Items per Cart</TableHead>
                  <TableHead>Avg Time in Store</TableHead>
                  <TableHead>Total Items Purchased</TableHead>
                  <TableHead>Avg Item Price</TableHead>
                  <TableHead>Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.customerTypeOutput).map(([typeId, typeData]) => {
                  const avgItemsPerCart = typeData.totalProductsPurchased / typeData.transactions;
                  const avgTimePerCustomer = typeData.totalTimeInStore / typeData.visits;
                  const avgItemPriceForType = typeData.totalProfit / typeData.totalProductsPurchased;
                  
                  return (
                    <TableRow key={typeId}>
                      <TableCell>
                        <Badge variant="secondary">Type {typeId}</Badge>
                      </TableCell>
                      <TableCell>{typeData.visits}</TableCell>
                      <TableCell>{typeData.transactions}</TableCell>
                      <TableCell>{avgItemsPerCart.toFixed(1)}</TableCell>
                      <TableCell>{formatTime(avgTimePerCustomer)}</TableCell>
                      <TableCell>{typeData.totalProductsPurchased}</TableCell>
                      <TableCell>{formatCurrency(avgItemPriceForType)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(typeData.totalProfit)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Checkout Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Checkout Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Checkout #</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Technical Maintenance</TableHead>
                  <TableHead>Labor Expenses</TableHead>
                  <TableHead>Customers Served</TableHead>
                  <TableHead>Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.checkoutOutput).map(([checkoutId, checkoutData]) => {
                  const netProfit = checkoutData.profits - checkoutData.technicalCost - checkoutData.humanCost;
                  
                  return (
                    <TableRow key={checkoutId}>
                      <TableCell>
                        <Badge variant="outline">#{checkoutId}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(checkoutData.profits)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(checkoutData.technicalCost)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(checkoutData.humanCost)}</TableCell>
                      <TableCell>{checkoutData.transactions}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(netProfit)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Product Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Items Sold</TableHead>
                  <TableHead>Shopping List</TableHead>
                  <TableHead>Impulse Purchases</TableHead>
                  <TableHead>Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.productOutput).map(([productId, productData]) => {
                  const totalRevenue = productData.amountSold * productData.price;
                  const impulsePercentage = productData.amountSold > 0 
                    ? (productData.soldByImpulse / productData.amountSold * 100).toFixed(1)
                    : "0";
                  
                  return (
                    <TableRow key={productId}>
                      <TableCell className="font-medium capitalize">{productData.name}</TableCell>
                      <TableCell>{formatCurrency(productData.price)}</TableCell>
                      <TableCell>{productData.amountSold}</TableCell>
                      <TableCell>{productData.soldByShoppingList}</TableCell>
                      <TableCell>
                        {productData.soldByImpulse}
                        <span className="text-muted-foreground text-sm ml-1">
                          ({impulsePercentage}%)
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(totalRevenue)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SimulationResults;