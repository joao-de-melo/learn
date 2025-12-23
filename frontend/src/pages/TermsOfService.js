import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="legal-container">
      <div className="legal-card">
        <h1>Terms of Service</h1>
        <p className="legal-date">Last updated: December 7, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Learn Made Fun ("Service"), you agree to be bound by these Terms of
            Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Learn Made Fun is an educational platform that provides interactive learning games and
            activities for children. The Service allows parents and guardians to create profiles for
            their children and track their learning progress.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <h3>3.1 Account Creation</h3>
          <p>
            To use our Service, you must create an account. You agree to provide accurate, current,
            and complete information during registration and to update such information to keep it
            accurate, current, and complete.
          </p>

          <h3>3.2 Account Security</h3>
          <p>
            You are responsible for safeguarding your account credentials and for all activities that
            occur under your account. You agree to notify us immediately of any unauthorized use of
            your account.
          </p>

          <h3>3.3 Age Requirements</h3>
          <p>
            You must be at least 18 years old (or the age of majority in your jurisdiction) to create
            an account. The Service is designed for parents/guardians to use with their children.
          </p>
        </section>

        <section>
          <h2>4. Parental Responsibility</h2>
          <p>
            As a parent or guardian, you are responsible for:
          </p>
          <ul>
            <li>Supervising your child's use of the Service</li>
            <li>Managing your child's profile and data</li>
            <li>Ensuring appropriate use of the platform</li>
            <li>Reviewing your child's learning progress</li>
          </ul>
        </section>

        <section>
          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Share your account credentials with others</li>
            <li>Use the Service to harm or exploit children in any way</li>
            <li>Reverse engineer or attempt to extract the source code of the Service</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            All content, features, and functionality of the Service, including but not limited to
            text, graphics, logos, games, and software, are the exclusive property of Learn Made Fun
            and are protected by copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2>7. User Content</h2>
          <p>
            Any content you create or upload to the Service (such as custom games) remains your
            property. By creating content, you grant us a non-exclusive license to use, display,
            and store that content for the purpose of providing the Service.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
            SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEARN MADE FUN SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
            PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service at our sole discretion,
            without prior notice, for conduct that we believe violates these Terms or is harmful to
            other users, us, or third parties, or for any other reason.
          </p>
          <p>
            You may terminate your account at any time by deleting your account through the Service
            or by contacting us.
          </p>
        </section>

        <section>
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any
            material changes by posting the new Terms on this page and updating the "Last updated"
            date. Your continued use of the Service after such changes constitutes acceptance of
            the new Terms.
          </p>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the
            jurisdiction in which Learn Made Fun operates, without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p><strong>Email:</strong> support@learn-made-fun.web.app</p>
        </section>

        <div className="legal-footer">
          <Link to="/login">Back to Login</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
