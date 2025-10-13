import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2, Microscope, Archive, Search } from "lucide-react";

const Modules = () => {
  const modules = [
    {
      icon: Shield,
      role: "System Admin",
      badge: "Core",
      color: "text-primary",
      responsibilities: [
        "Create areas and police stations",
        "Manage FSL units and departments",
        "Generate secure user credentials via SMTP",
        "System-wide configuration and monitoring"
      ]
    },
    {
      icon: Building2,
      role: "Police Station",
      badge: "Operations",
      color: "text-blue-500",
      responsibilities: [
        "Register crimes and FIRs",
        "Document suspect information",
        "Assign investigation staff",
        "Track case progress"
      ]
    },
    {
      icon: Microscope,
      role: "FSL Officers",
      badge: "Forensics",
      color: "text-purple-500",
      responsibilities: [
        "Collect forensic evidence",
        "Generate SHA-256 hash codes",
        "Encrypt evidence with AES",
        "Upload to AWS S3 cloud storage"
      ]
    },
    {
      icon: Archive,
      role: "Evidence Room",
      badge: "Custody",
      color: "text-amber-500",
      responsibilities: [
        "Log evidence transactions",
        "Maintain chain of custody",
        "Secure physical storage",
        "Generate custody reports"
      ]
    },
    {
      icon: Search,
      role: "Investigation Officers",
      badge: "Analysis",
      color: "text-green-500",
      responsibilities: [
        "Record investigation progress",
        "Create encrypted PDF reports",
        "Track evidence analysis",
        "Prepare court documentation"
      ]
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Role-Based Modules
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialized interfaces for each stakeholder in the investigation process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-all border-l-4 border-l-primary/50 hover:border-l-primary">
              <div className="flex items-start justify-between mb-4">
                <module.icon className={`h-12 w-12 ${module.color}`} />
                <Badge variant="secondary">{module.badge}</Badge>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">{module.role}</h3>
              
              <ul className="space-y-2">
                {module.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modules;
