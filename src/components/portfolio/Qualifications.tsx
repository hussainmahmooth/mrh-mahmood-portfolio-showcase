import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Brain, 
  Globe, 
  Cloud, 
  Megaphone, 
  BarChart3, 
  Code2,
  CheckCircle
} from "lucide-react";

const Qualifications = () => {
  const certificates = [
    {
      icon: Brain,
      title: "Artificial Intelligence (Level 1)",
      description: "Foundational certification covering AI concepts, machine learning basics, and practical applications in modern technology.",
      level: "Level 1",
      category: "AI & Machine Learning",
      verified: true,
    },
    {
      icon: Globe,
      title: "Web Design",
      description: "Comprehensive certification in modern web design principles, responsive layouts, and user experience optimization.",
      level: "Professional",
      category: "Web Development",
      verified: true,
    },
    {
      icon: Cloud,
      title: "AWS & Networking",
      description: "Cloud infrastructure and networking fundamentals including AWS services, network architecture, and security best practices.",
      level: "Associate",
      category: "Cloud Computing",
      verified: true,
    },
    {
      icon: Megaphone,
      title: "Social Media Marketing",
      description: "Digital marketing strategies, social media campaign management, and audience engagement optimization techniques.",
      level: "Professional",
      category: "Digital Marketing",
      verified: true,
    },
    {
      icon: BarChart3,
      title: "Data Science & Analytics",
      description: "Data analysis methodologies, statistical modeling, and visualization techniques for business intelligence applications.",
      level: "Intermediate",
      category: "Data Science",
      verified: true,
    },
    {
      icon: Code2,
      title: "Python Programming",
      description: "Python programming fundamentals, object-oriented programming, and application development using Python ecosystem.",
      level: "Intermediate",
      category: "Programming",
      verified: true,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI & Machine Learning":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Web Development":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Cloud Computing":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Digital Marketing":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Data Science":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Programming":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Professional":
        return "bg-accent/20 text-accent border-accent/30";
      case "Associate":
        return "bg-primary/20 text-primary border-primary/30";
      case "Intermediate":
        return "bg-secondary/50 text-secondary-foreground border-secondary";
      case "Level 1":
        return "bg-muted/50 text-muted-foreground border-border";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <section id="qualifications" className="py-20 px-4 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Qualifications</span> & Certificates
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional certifications and qualifications that validate expertise across 
            multiple domains of technology and business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <Card
                key={index}
                className="bg-gradient-card border-border hover:shadow-card hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden"
              >
                <CardContent className="p-6 h-full">
                  {/* Verified Badge */}
                  {cert.verified && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 bg-accent/20 text-accent px-2 py-1 rounded-full text-xs border border-accent/30">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="p-3 bg-gradient-primary rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {cert.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                        {cert.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getLevelColor(cert.level)} border text-xs`}
                        >
                          {cert.level}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${getCategoryColor(cert.category)} border text-xs`}
                        >
                          {cert.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">6</div>
              <div className="text-sm text-muted-foreground">Total Certificates</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-accent mb-2">4</div>
              <div className="text-sm text-muted-foreground">Tech Domains</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-accent mb-2">2024</div>
              <div className="text-sm text-muted-foreground">Latest Year</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Qualifications;