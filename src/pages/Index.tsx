import Header from "@/components/portfolio/Header";
import About from "@/components/portfolio/About";
import Skills from "@/components/portfolio/Skills";
import Projects from "@/components/portfolio/Projects";
import Qualifications from "@/components/portfolio/Qualifications";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <About />
      <Skills />
      <Projects />
      <Qualifications />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;