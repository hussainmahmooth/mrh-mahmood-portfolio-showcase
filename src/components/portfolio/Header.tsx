import { Button } from "@/components/ui/button";
import { Download, Mail, ExternalLink } from "lucide-react";
import profileImage from "@/assets/profile.jpg";

const Header = () => {
  return (
    <header className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="relative">
              <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-elegant glow-effect">
                <img
                  src={profileImage}
                  alt="M.R.H.Mahmood - Professional Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -inset-4 bg-gradient-primary rounded-2xl opacity-20 blur-xl -z-10"></div>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">M.R.H.</span>
                <br />
                <span className="text-foreground">Mahmood</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-medium">
                IT Professional & aspiring IT undergraduate
              </p>
              <p className="text-lg text-muted-foreground">
                Currently studying at{" "}
                <span className="text-accent font-semibold">ICST</span>
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="hero"
                size="hero"
                className="group"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Contact Me
              </Button>
              <Button
                variant="contact"
                size="hero"
                className="group"
                onClick={() => {
                  const projectsSection = document.getElementById('projects');
                  projectsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                View Projects
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;