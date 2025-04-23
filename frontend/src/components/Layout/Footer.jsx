import React from "react";

// Import the CSS file
import "../../styles/components/layout/footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} TruckerELD - Electronic Logging
            Device
          </div>

          <div className="footer-links">
            <a href="#" className="footer-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-link">
              Terms of Service
            </a>
            <a href="#" className="footer-link">
              Contact Us
            </a>
          </div>
        </div>

        <div className="footer-compliance">
          This application complies with FMCSA regulations for Electronic
          Logging Devices.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
