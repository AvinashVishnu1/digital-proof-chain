import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-evidence.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Secure digital evidence management interface"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Military-Grade Security</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Digital Evidence Management
            <span className="block text-primary mt-2">Built for Trust</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            Secure, cloud-based platform with encryption, role-based access control, and tamper-proof chain of custody tracking. 
            Ensuring justice through technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Access System
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-border/50">
            <div>
              <div className="text-2xl font-bold text-primary">SHA-256</div>
              <div className="text-sm text-muted-foreground">Hash Encryption</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">AES-256</div>
              <div className="text-sm text-muted-foreground">File Encryption</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">AWS S3</div>
              <div className="text-sm text-muted-foreground">Cloud Storage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Audit Trail</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
