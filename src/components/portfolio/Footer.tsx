import { Separator } from "@/components/ui/separator";
import { Heart, Code } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 bg-muted/10">
      <div className="container max-w-6xl mx-auto">
        <Separator className="mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold gradient-text mb-2">M.R.H.Mahmood</h3>
            <p className="text-muted-foreground">
              IT Professional & aspiring IT undergraduate
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-muted-foreground mb-2">
              © {currentYear} M.R.H.Mahmood. All rights reserved.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>and</span>
              <Code className="w-4 h-4 text-primary" />
              <span>by Mahmood</span>
            </div>
          </div>
        </div>
        
        <Separator className="mt-8" />
        
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Crafted with modern web technologies • Responsive Design • Professional Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;