import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Code2,
  BarChart3, 
  Cloud, 
  Brain, 
  Megaphone,
  Globe,
  Database
} from "lucide-react";

const Skills = () => {
  const skills = [
    {
      icon: Globe,
      title: "Web Design",
      description: "Creating responsive, user-friendly websites with modern design principles and accessibility standards.",
      level: "Advanced",
      technologies: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS"],
    },
    {
      icon: Code2,
      title: "Python",
      description: "Developing applications, automation scripts, and data processing solutions using Python's versatile ecosystem.",
      level: "Intermediate",
      technologies: ["Django", "Flask", "Pandas", "NumPy", "Automation"],
    },
    {
      icon: BarChart3,
      title: "Data Science & Analytics",
      description: "Extracting insights from data through statistical analysis, visualization, and machine learning techniques.",
      level: "Intermediate",
      technologies: ["Python", "SQL", "Tableau", "Excel", "Statistics"],
    },
    {
      icon: Cloud,
      title: "AWS & Networking",
      description: "Cloud infrastructure management, networking solutions, and scalable system architecture design.",
      level: "Intermediate",
      technologies: ["AWS EC2", "S3", "VPC", "Networking", "Cloud Architecture"],
    },
    {
      icon: Brain,
      title: "Artificial Intelligence (Level 1)",
      description: "Foundational knowledge in AI concepts, machine learning algorithms, and intelligent system development.",
      level: "Beginner",
      technologies: ["Machine Learning", "AI Concepts", "Neural Networks", "Python", "TensorFlow"],
    },
    {
      icon: Megaphone,
      title: "Social Media Marketing",
      description: "Strategic digital marketing campaigns, content creation, and audience engagement across social platforms.",
      level: "Intermediate",
      technologies: ["Content Strategy", "Analytics", "Campaign Management", "SEO", "Social Platforms"],
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Advanced":
        return "bg-accent/20 text-accent border-accent/30";
      case "Intermediate":
        return "bg-primary/20 text-primary border-primary/30";
      case "Beginner":
        return "bg-muted/50 text-muted-foreground border-border";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <section id="skills" className="py-20 px-4 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Technical <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive set of technical competencies spanning web development, 
            data science, cloud technologies, and emerging AI solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <Card
                key={index}
                className="bg-gradient-card border-border hover:shadow-card hover:shadow-primary/5 transition-all duration-300 group"
              >
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getLevelColor(skill.level)} border`}
                      >
                        {skill.level}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {skill.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2 font-medium">
                        Technologies & Tools:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skill.technologies.map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="text-xs bg-secondary/50 hover:bg-secondary/80 transition-colors"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;