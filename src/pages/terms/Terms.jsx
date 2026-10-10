import React, { useEffect } from 'react';
import Header from '../landingPage/header';
import CopyRight from '../landingPage/copyRight';
import { NavLink } from 'react-router-dom';

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service - 360Pipe";
  }, []);

  return (
    <>
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <Header />
        </div>

        {/* Style override to force Header to be solid white, relative (in flex flow), and clean */}
        <style dangerouslySetInnerHTML={{
          __html: `
            header {
              position: relative !important;
              background-color: white !important;
              box-shadow: none !important;
            }
          `
        }} />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200">
            {/* Header / Intro */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-3">
                Legal &amp; Terms
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                Terms of Service
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span><strong>Effective Date:</strong> October 10, 2026</span>
                <span>•</span>
                <span><strong>Last Updated:</strong> October 10, 2026</span>
              </div>
            </div>

            {/* Quick Notice Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-10 text-sm text-blue-900 leading-relaxed">
              <p>
                These Terms of Service govern your access to and use of <strong>360Pipe</strong>, our customer relationship management (CRM) platform, calendar integration tools, and related productivity services.
              </p>
            </div>

            <div className="space-y-10 text-gray-700 leading-relaxed">
              {/* Section 1: Introduction */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">1.</span> Introduction
                </h2>
                <p className="mb-4">
                  Welcome to <strong>360Pipe</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of the 360Pipe website, CRM platform, calendar integrations, and related services (collectively, the &quot;Services&quot;).
                </p>
                <p>
                  By accessing or using 360Pipe, you agree to these Terms. If you do not agree, please do not use the Services.
                </p>
              </section>

              {/* Section 2: Eligibility and Account Registration */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">2.</span> Eligibility and Account Registration
                </h2>
                <p className="mb-4">
                  You must have the legal authority to enter into these Terms to use our Services. You agree to provide accurate and complete information when creating an account and to keep your account information up to date.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for activities conducted through your account. Please notify us promptly if you suspect unauthorized access.
                </p>
              </section>

              {/* Section 3: Description of Services */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">3.</span> Description of Services
                </h2>
                <p className="mb-3">
                  360Pipe provides customer relationship management (CRM) functionality and related productivity tools. Depending on your subscription and configuration, the Services may include:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 mb-4">
                  <li>Contact, customer, and sales opportunity management.</li>
                  <li>Task and activity tracking.</li>
                  <li>Calendar synchronization and appointment scheduling.</li>
                  <li>Integrations with third-party services, including Google Calendar and Microsoft Outlook Calendar.</li>
                  <li>Sales reporting, analytics, and productivity features.</li>
                </ul>
                <p>
                  We may modify, improve, suspend, or discontinue features of the Services as permitted by applicable law.
                </p>
              </section>

              {/* Section 4: Third-Party Calendar Integrations */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">4.</span> Third-Party Calendar Integrations
                </h2>
                <p className="mb-3">
                  360Pipe allows you to connect supported third-party calendar services, including Google Calendar and Microsoft Outlook Calendar, to enable calendar-related functionality.
                </p>
                <p className="mb-3">
                  When you authorize a calendar integration:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 mb-4">
                  <li>You authorize 360Pipe to access the calendar information and perform the actions permitted by the permissions you grant.</li>
                  <li>Your calendar provider may require you or your organization&apos;s administrator to approve access.</li>
                  <li>Calendar data may be synchronized between the connected service and 360Pipe to provide the features you request.</li>
                  <li>The availability and functionality of integrations depend on the third-party provider and its policies, APIs, and service availability.</li>
                  <li>You may disconnect an integration through the available settings or revoke access through your Google or Microsoft account.</li>
                  <li>Disconnecting an integration may stop future synchronization but may not automatically delete data previously imported into 360Pipe. You may need to delete such data separately.</li>
                  <li>You are responsible for ensuring that you have the necessary rights and permissions to connect and share any calendar information you authorize us to access.</li>
                </ul>
              </section>

              {/* Section 5: Acceptable Use */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">5.</span> Acceptable Use
                </h2>
                <p className="mb-3">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 mb-4">
                  <li>Use the Services for unlawful, fraudulent, or unauthorized purposes.</li>
                  <li>Attempt to gain unauthorized access to accounts, systems, or data.</li>
                  <li>Interfere with the security, integrity, or operation of the Services.</li>
                  <li>Upload malicious software or harmful content.</li>
                  <li>Use the Services in a manner that violates another person&apos;s privacy or intellectual property rights.</li>
                  <li>Circumvent applicable usage limits, security controls, or access restrictions.</li>
                </ul>
                <p>
                  We may restrict or suspend access when reasonably necessary to protect the Services, our users, or third parties, or to comply with applicable law.
                </p>
              </section>

              {/* Section 6: User Data and Privacy */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">6.</span> User Data and Privacy
                </h2>
                <p className="mb-4">
                  Your use of the Services is also governed by our{' '}
                  <NavLink to="/privacy" className="text-blue-600 hover:underline font-medium">
                    Privacy Policy
                  </NavLink>
                  , which explains how we collect, use, store, and disclose personal information.
                </p>
                <p className="mb-4">
                  You retain your rights to the data you submit to 360Pipe, subject to applicable law and any rights necessary for us to provide the Services. You grant us permission to process that data as reasonably necessary to operate, maintain, secure, and provide the Services in accordance with our Privacy Policy and your instructions.
                </p>
                <p className="mb-4">
                  We use authorized third-party services where necessary to provide integrations and other features. Your use of those services may also be subject to their separate terms and privacy policies.
                </p>
                <p>
                  Please review our{' '}
                  <NavLink to="/privacy" className="text-blue-600 hover:underline font-medium">
                    Privacy Policy
                  </NavLink>{' '}
                  for further information about calendar data, data retention, security, and your privacy rights.
                </p>
              </section>

              {/* Section 7: Intellectual Property */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">7.</span> Intellectual Property
                </h2>
                <p className="mb-4">
                  The Services, including their software, design, branding, and original content, are owned by or licensed to 360Pipe and are protected by applicable intellectual property laws.
                </p>
                <p className="mb-4">
                  Except as expressly permitted by us or applicable law, you may not copy, modify, distribute, reverse engineer, or create derivative works from the Services.
                </p>
                <p>
                  These Terms do not transfer ownership of your data to us.
                </p>
              </section>

              {/* Section 8: Subscription, Fees, and Payments */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">8.</span> Subscription, Fees, and Payments
                </h2>
                <p className="mb-4">
                  Certain features may require a paid subscription. Applicable fees, billing periods, payment terms, and cancellation conditions will be disclosed when you purchase or subscribe to those features.
                </p>
                <p>
                  Unless otherwise stated or required by applicable law, fees are non-refundable. Any cancellation will be subject to the terms presented with your subscription.
                </p>
              </section>

              {/* Section 9: Third-Party Services */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">9.</span> Third-Party Services
                </h2>
                <p className="mb-4">
                  360Pipe may rely on third-party services, including Google and Microsoft, for authentication, calendar access, hosting, and other functionality.
                </p>
                <p className="mb-4">
                  We do not control third-party services and are not responsible for their availability, changes, policies, or independent actions. Your use of third-party services remains subject to their applicable terms and policies.
                </p>
                <p>
                  Google Calendar and Microsoft Outlook are third-party services and are not owned or operated by 360Pipe.
                </p>
              </section>

              {/* Section 10: Service Availability and Disclaimer */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">10.</span> Service Availability and Disclaimer
                </h2>
                <p className="mb-4">
                  We strive to provide reliable and secure Services but do not guarantee uninterrupted, error-free, or continuous availability.
                </p>
                <p>
                  To the extent permitted by applicable law, the Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis, without warranties not expressly stated in these Terms or required by law.
                </p>
              </section>

              {/* Section 11: Limitation of Liability */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">11.</span> Limitation of Liability
                </h2>
                <p className="mb-4">
                  To the extent permitted by applicable law, 360Pipe will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, business opportunities, or data arising from your use of or inability to use the Services.
                </p>
                <p>
                  Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.
                </p>
              </section>

              {/* Section 12: Suspension and Termination */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">12.</span> Suspension and Termination
                </h2>
                <p className="mb-4">
                  You may stop using the Services at any time and may close your account using the available account settings or by contacting us.
                </p>
                <p className="mb-4">
                  We may suspend or terminate access if you materially violate these Terms, create a security risk, or if suspension or termination is otherwise permitted by applicable law or your agreement with us.
                </p>
                <p>
                  Upon termination, access to certain features may cease. Data handling, retention, and deletion will be governed by our Privacy Policy and any applicable contractual or legal obligations.
                </p>
              </section>

              {/* Section 13: Changes to These Terms */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">13.</span> Changes to These Terms
                </h2>
                <p className="mb-4">
                  We may update these Terms from time to time. We will publish the updated version on our website and revise the &quot;Last Updated&quot; date. Where required by law, we will provide notice of material changes.
                </p>
                <p>
                  Your continued use of the Services after the updated Terms become effective constitutes acceptance of the revised Terms, to the extent permitted by applicable law.
                </p>
              </section>

              {/* Section 14: Governing Law */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">14.</span> Governing Law
                </h2>
                <p className="mb-4">
                  These Terms will be governed by the laws applicable to the entity operating 360Pipe, without regard to conflict-of-law principles, subject to any mandatory consumer protections that apply to you.
                </p>
                <p>
                  Any disputes will be handled by the competent courts or dispute-resolution forums determined under applicable law.
                </p>
              </section>

              {/* Section 15: Contact Us */}
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">15.</span> Contact Us
                </h2>
                <p className="mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="space-y-2 text-sm sm:text-base">
                  <p>
                    <strong>Service:</strong> 360Pipe CRM
                  </p>
                  <p>
                    <strong>Company Legal Name:</strong> 360Pipe Inc.
                  </p>
                  <p>
                    <strong>Website:</strong>{' '}
                    <a
                      href="https://devwebapp.360pipe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://devwebapp.360pipe.com
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:360pipeinc@gmail.com"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      360pipeinc@gmail.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Fixed Footer Section */}
        <div className="border-t border-gray-200 bg-white z-40">
          <CopyRight />
        </div>
      </div>
    </>
  );
};

export default Terms;
