import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8" />
              <span className="text-xl font-bold">SecureEvidence</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 max-w-md">
              Secure, cloud-based digital crime and evidence management system ensuring integrity, 
              confidentiality, and accountability in criminal investigations.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">System</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>Architecture</li>
              <li>Security</li>
              <li>Documentation</li>
              <li>Support</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Compliance</li>
              <li>Data Protection</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-secondary-foreground/20 text-center text-sm text-secondary-foreground/60">
          <p>© 2025 SecureEvidence. All rights reserved. | Built with enterprise-grade security</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
