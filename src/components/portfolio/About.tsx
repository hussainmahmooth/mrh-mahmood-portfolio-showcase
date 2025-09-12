import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Building2, Target } from "lucide-react";

const About = () => {
  const educationSteps = [
    {
      icon: BookOpen,
      title: "First School",
      institution: "Al Madeena",
      description: "Foundation education",
    },
    {
      icon: GraduationCap,
      title: "Advanced Level",
      institution: "Shams Center College",
      description: "Completed advanced studies",
    },
    {
      icon: Building2,
      title: "Diploma Studies",
      institution: "ICBT Campus",
      description: "ITA and English diploma programs",
    },
    {
      icon: Target,
      title: "Current Studies",
      institution: "ICST",
      description: "Bachelor in IT at International Campus of Science and Technology",
      current: true,
    },
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Passionate IT professional with a strong educational foundation and continuous learning mindset.
            Currently pursuing a Bachelor's degree in IT while building practical experience through various projects.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Educational Journey */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground mb-8">Educational Journey</h3>
            <div className="space-y-4">
              {educationSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-gradient-card border-border hover:shadow-card transition-all duration-300 ${
                      step.current ? 'ring-2 ring-primary/30 glow-effect' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          step.current ? 'bg-gradient-primary' : 'bg-secondary'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            step.current ? 'text-primary-foreground' : 'text-secondary-foreground'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground">{step.title}</h4>
                            {step.current && (
                              <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full border border-accent/30">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-primary mb-1">{step.institution}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Background & Goals */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground mb-8">Background & Goals</h3>
            <Card className="bg-gradient-card border-border hover:shadow-card transition-all duration-300">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-3">Current Focus</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Pursuing a Bachelor's degree in IT at ICST while actively developing practical skills 
                      through hands-on projects in web development, data science, and cloud technologies.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-3">Professional Interests</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Passionate about leveraging technology to solve real-world problems. Particularly 
                      interested in full-stack development, data analytics, artificial intelligence, 
                      and cloud computing solutions.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-3">Future Aspirations</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Aiming to become a versatile IT professional who can bridge the gap between 
                      technical innovation and business needs, contributing to impactful projects 
                      that make a difference.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;