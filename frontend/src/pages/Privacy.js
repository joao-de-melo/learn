import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="legal-container">
      <div className="legal-card">
        <h1>Privacy Policy</h1>
        <p className="legal-date">Last updated: December 7, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Learn Made Fun ("we," "our," or "us"). We are committed to protecting your privacy
            and the privacy of children who use our educational platform. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (if provided)</li>
            <li>Authentication credentials (securely hashed)</li>
          </ul>

          <h3>2.2 Child Profile Information</h3>
          <p>For child profiles created by parents/guardians:</p>
          <ul>
            <li>First name or nickname</li>
            <li>Age or birth year</li>
            <li>Learning progress and game statistics</li>
          </ul>

          <h3>2.3 Usage Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Game progress and scores</li>
            <li>Learning achievements</li>
            <li>Device type and browser information</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain our educational services</li>
            <li>Track learning progress and achievements</li>
            <li>Improve our games and educational content</li>
            <li>Communicate with you about your account</li>
            <li>Ensure the security of our platform</li>
          </ul>
        </section>

        <section>
          <h2>4. Children's Privacy (COPPA Compliance)</h2>
          <p>
            We take children's privacy seriously. Our service is designed for use by parents/guardians
            with their children. We do not knowingly collect personal information directly from children
            under 13 without parental consent.
          </p>
          <ul>
            <li>Parents/guardians create and manage child profiles</li>
            <li>Children do not have direct access to create accounts</li>
            <li>Parents can review, modify, or delete their child's information at any time</li>
            <li>We do not display advertising to children</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Storage and Security</h2>
          <p>
            We use Firebase (Google Cloud) to store your data securely. We implement appropriate
            technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2>6. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul>
            <li>Service providers (Firebase/Google) for hosting and authentication</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2>8. Cookies and Tracking</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            advertising cookies or third-party tracking for marketing purposes.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our practices, please contact us at:
          </p>
          <p><strong>Email:</strong> privacy@learn-made-fun.web.app</p>
        </section>

        <div className="legal-footer">
          <Link to="/login">Back to Login</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
