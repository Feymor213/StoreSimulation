import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Store, Coffee, Laptop, Shirt, Heart, Car, Home } from "lucide-react";
import Link from "next/link";

const storeTypes = [
  {
    icon: Coffee,
    title: "Food & Beverage",
    description: "Restaurant, cafe, or food truck simulation",
    color: "text-orange-500"
  },
  {
    icon: Laptop, 
    title: "Electronics Store",
    description: "Tech gadgets and electronics retail",
    color: "text-blue-500"
  },
  {
    icon: Shirt,
    title: "Fashion Retail",
    description: "Clothing and accessories boutique",
    color: "text-pink-500"
  },
  {
    icon: Heart,
    title: "Health & Beauty",
    description: "Wellness and beauty products store",
    color: "text-green-500"
  },
  {
    icon: Car,
    title: "Automotive",
    description: "Car dealership or auto parts store",
    color: "text-red-500"
  },
  {
    icon: Home,
    title: "Home & Garden",
    description: "Furniture and home improvement store",
    color: "text-purple-500"
  }
];

const QuickActions = ({loggedIn}: {loggedIn: boolean}) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Create New Simulation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {loggedIn && "Choose from our pre-built store types or create a custom simulation from scratch"}
            {!loggedIn && "Please login to create your own simulations"}
          </p>
        </div>

        {loggedIn &&
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {storeTypes.map((type, index) => {
              const Icon = type.icon;
              
              return (
                <Card key={index} className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 bg-background rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`h-8 w-8 ${type.color}`} />
                    </div>
                    <CardTitle className="text-lg font-semibold">{type.title}</CardTitle>
                    <CardDescription className="text-sm">{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link href='/create?id=vn3nbworsqqp6rh'>
                      <Button className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Simulation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        }

        { loggedIn && 
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href='/create'>
                <Button variant="default" size="lg" className="px-8">
                  <Store className="h-5 w-5 mr-2" />
                  Custom Store Builder
                </Button>
              </Link>
            </div>
          </div>
        }
      </div>
    </section>
  );
};

export default QuickActions;