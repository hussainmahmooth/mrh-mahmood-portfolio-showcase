import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Award, 
  HeartHandshake, 
  GraduationCap, 
  Building2, 
  Users,
  Trophy
} from "lucide-react";

const Projects = () => {
  const projects = [
    {
      icon: HeartHandshake,
      title: "Medical Management Hub",
      description: "Comprehensive healthcare management system designed to streamline patient records, appointments, and medical staff coordination.",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      category: "Healthcare",
      featured: true,
    },
    {
      icon: GraduationCap,
      title: "LMS Website",
      description: "Learning Management System providing course management, student tracking, and interactive learning experiences.",
      technologies: ["PHP", "MySQL", "Bootstrap", "JavaScript"],
      category: "Education",
      featured: true,
    },
    {
      icon: Building2,
      title: "Hostel Management Project",
      description: "Digital solution for hostel administration including room allocation, fee management, and resident services.",
      technologies: ["Python", "Django", "SQLite", "CSS"],
      category: "Management",
      featured: false,
    },
    {
      icon: Users,
      title: "Student Management System (CRUD)",
      description: "Full-featured student information system with create, read, update, and delete operations for academic records.",
      technologies: ["Java", "MySQL", "Swing", "JDBC"],
      category: "Academic",
      featured: false,
    },
  ];

  const achievements = [
    {
      icon: Trophy,
      title: "Hackathon Recognition",
      description: "Placed well in a competitive hackathon competition, demonstrating problem-solving skills and innovative thinking under pressure.",
      highlight: "Competition Achievement",
    },
  ];

  return (
    <section id="projects" className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Projects & <span className="gradient-text">Achievements</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A showcase of practical applications and competitive achievements that demonstrate 
            technical proficiency and problem-solving capabilities.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-foreground mb-8">Featured Projects</h3>
          <div className="grid lg:grid-cols-2 gap-8">
            {projects.filter(project => project.featured).map((project, index) => {
              const Icon = project.icon;
              return (
                <Card
                  key={index}
                  className="bg-gradient-card border-border hover:shadow-elegant hover:shadow-primary/10 transition-all duration-300 group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-foreground">
                            {project.title}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {project.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Technologies Used:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="secondary"
                              className="bg-secondary/50 hover:bg-secondary/80 transition-colors"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full group-hover:border-primary/50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Other Projects */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-foreground mb-8">Additional Projects</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.filter(project => !project.featured).map((project, index) => {
              const Icon = project.icon;
              return (
                <Card
                  key={index}
                  className="bg-gradient-card border-border hover:shadow-card transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Icon className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{project.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {project.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="secondary"
                              className="text-xs bg-secondary/30"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-secondary/30">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-2xl font-semibold text-foreground mb-8">Achievements</h3>
          <div className="grid gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card
                  key={index}
                  className="bg-gradient-card border-border hover:shadow-elegant hover:shadow-accent/10 transition-all duration-300"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-gradient-primary rounded-xl">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-semibold text-foreground">
                            {achievement.title}
                          </h4>
                          <Badge className="bg-accent/20 text-accent border-accent/30">
                            {achievement.highlight}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
