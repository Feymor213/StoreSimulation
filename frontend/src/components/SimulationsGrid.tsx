import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, Play, Pause, BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Simulation } from "@/lib/types/pocketbase";
import { SimulationOutputData } from "@/lib/types/simulation";


// const mockSimulations: Simulation[] = [
//   {
//     id: "1",
//     name: "Coffee Shop Downtown",
//     type: "Food & Beverage",
//     status: "running",
//     revenue: "$12,450",
//     customers: 342,
//     growth: "+12.5%",
//     lastUpdated: "2 minutes ago"
//   },
//   {
//     id: "2", 
//     name: "Tech Gadgets Store",
//     type: "Electronics",
//     status: "completed",
//     revenue: "$28,900",
//     customers: 156,
//     growth: "+8.2%",
//     lastUpdated: "1 hour ago"
//   },
//   {
//     id: "3",
//     name: "Fashion Boutique",
//     type: "Clothing",
//     status: "completed",
//     revenue: "$15,200",
//     customers: 89,
//     growth: "+15.8%",
//     lastUpdated: "Yesterday"
//   },
//   {
//     id: "4",
//     name: "Pet Supply Store",
//     type: "Retail",
//     status: "running",
//     revenue: "$9,800",
//     customers: 234,
//     growth: "+22.1%",
//     lastUpdated: "5 minutes ago"
//   }
// ];

const SimulationsGrid = ({loggedIn, simulations, limit}: {loggedIn: boolean, simulations: Simulation[], limit: number}) => {

  simulations = simulations.slice(0, limit);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'failed': return 'secondary';  
      case 'finished': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'running' ? Play : Pause;
  };

  return (
    <section id="simulations" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Your Store Simulations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {loggedIn && "Monitor and manage all your simulations from one central dashboard"}
            {!loggedIn && "Please login to view your simulations"}
          </p>
        </div>

        {loggedIn && 
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {simulations.map((simulation) => {
              const StatusIcon = getStatusIcon(simulation.status);

              const outputData = JSON.parse(simulation.outputData || '{}') as SimulationOutputData;
              
              return (
                <Card key={simulation.id} className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        {simulation.name}
                      </CardTitle>
                      <p className="text-muted-foreground">{simulation.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(simulation.state)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {simulation.state}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-background/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="text-xs text-muted-foreground">Revenue</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{outputData.profits}</div>
                      </div>
                      
                      <div className="bg-background/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Users className="h-5 w-5 text-accent" />
                          <span className="text-xs text-muted-foreground">Customers</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{outputData.transactions}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">{simulation.lastUpdated}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/simulation/${simulation.id}`} className="flex-1">
                        <Button className="w-full" disabled={simulation.state !== 'finished'}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        }
        
        { (loggedIn && limit !== Infinity) && 
          <div className="text-center mt-12">
            <Link href='/simulation'>
              <Button variant="outline" size="lg" className="px-8">
                View All Simulations
              </Button>
            </Link>
          </div>
        }
      </div>
    </section>
  );
};

export default SimulationsGrid;