import { Card } from "@/components/ui/card";
import iconEncryption from "@/assets/icon-encryption.png";
import iconCustody from "@/assets/icon-custody.png";
import iconAccess from "@/assets/icon-access.png";
import { FileCheck, Cloud, Lock, Users, FileText, Activity } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: iconEncryption,
      title: "Military-Grade Encryption",
      description: "SHA-256 hashing and AES encryption ensure evidence integrity and confidentiality at every stage."
    },
    {
      icon: iconCustody,
      title: "Chain of Custody",
      description: "Automated tracking of every evidence transaction with digital logs in XML/PDF formats."
    },
    {
      icon: iconAccess,
      title: "Role-Based Access",
      description: "Secure access control for Admin, Police, FSL Officers, Evidence Room Staff, and Investigation Officers."
    }
  ];

  const capabilities = [
    {
      icon: FileCheck,
      title: "FIR Management",
      description: "Digital crime and FIR registration with automated suspect tracking."
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "AWS S3 integration for secure, scalable evidence storage with 99.99% uptime."
    },
    {
      icon: Lock,
      title: "Tamper-Proof",
      description: "Cryptographic verification prevents unauthorized modifications to evidence."
    },
    {
      icon: Users,
      title: "Multi-Department",
      description: "Seamless collaboration between police stations, forensic labs, and investigation units."
    },
    {
      icon: FileText,
      title: "Digital Reports",
      description: "Automated PDF report generation with encrypted investigation progress logs."
    },
    {
      icon: Activity,
      title: "Real-Time Tracking",
      description: "Live monitoring of evidence status and location throughout investigation lifecycle."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why SecureEvidence?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Addressing critical vulnerabilities in traditional evidence management with modern cloud technology
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <img 
                src={feature.icon} 
                alt={feature.title}
                className="w-20 h-20 mb-6 object-contain"
              />
              <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-all">
              <capability.icon className="h-10 w-10 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-2">{capability.title}</h4>
              <p className="text-sm text-muted-foreground">{capability.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
