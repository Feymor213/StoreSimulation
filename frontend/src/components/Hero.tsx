import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const Hero = ({loggedIn}: {loggedIn: boolean}) => {
  return (
    <section className="relative min-h-screen pt-20 bg-[image:var(--gradient-hero)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-95"></div>
      <div className="relative z-10 container mx-auto px-6 py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Welcome to Your
              <span className="block text-accent">Store Simulation</span>
              Dashboard
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Create, manage, and analyze virtual store operations. Test business strategies, 
              track performance metrics, and optimize your retail success in a risk-free environment.
            </p>

            {loggedIn && 
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create">
                  <Button variant="default" size="lg" className="text-lg px-8 py-4">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Simulation
                  </Button>
                </Link>
              </div>
            }

          </div>
          
          {/* <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-hover">
              <img 
                src={heroImage} 
                alt="Store simulation dashboard interface" 
                className="w-full h-auto rounded-lg shadow-card"
              />
              <div className="absolute -top-4 -right-4 bg-accent text-white px-4 py-2 rounded-full font-semibold shadow-soft">
                Live Demo
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;