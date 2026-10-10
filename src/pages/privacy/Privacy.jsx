import React, { useEffect } from 'react';
import Header from '../landingPage/header';
import CopyRight from '../landingPage/copyRight';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Privacy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Privacy Policy - 360Pipe";
  }, []);

  const handleManageAppsClick = (e) => {
    e.preventDefault();
    const token = Cookies.get('authToken');
    if (token) {
      navigate('/dashboard/manageapps');
    } else {
      navigate('/login', {
        state: { from: '/dashboard/manageapps' }
      });
    }
  };

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
                Legal & Compliance
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                Privacy Policy
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
                This Privacy Policy applies to the <strong>360Pipe</strong> web application (
                <a
                  href="https://devwebapp.360pipe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-blue-700"
                >
                  https://devwebapp.360pipe.com
                </a>
                ) and its calendar integration services, including Google Calendar and Microsoft Outlook Calendar synchronization.
              </p>
            </div>

            <div className="space-y-10 text-gray-700 leading-relaxed">
              {/* Section 1: Introduction */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">1.</span> Introduction
                </h2>
                <p className="mb-4">
                  <strong>360Pipe</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides business productivity, CRM workflow management, and calendar integration services through{' '}
                  <a
                    href="https://devwebapp.360pipe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    https://devwebapp.360pipe.com
                  </a>
                  .
                </p>
                <p className="mb-4">
                  This Privacy Policy explains how we collect, access, use, store, protect, and disclose information when users connect Google Calendar or Microsoft Outlook Calendar to our application, as well as when utilizing our appointment scheduling, opportunity tracking, and sales workflow features.
                </p>
                <p>
                  By connecting a calendar account, you authorize us to access the information permitted by the permissions displayed during the authorization process and to perform the calendar operations you request.
                </p>
              </section>

              {/* Section 2: Information We Access */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">2.</span> Information We Access
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Google Calendar</h3>
                    <p className="mb-3">
                      When you connect your Google account, we may access the following information, depending on the permissions you grant and the features you use:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
                      <li>
                        <strong>Calendar event details:</strong> Event titles, descriptions, dates, times, time zones, locations, and unique event identifiers.
                      </li>
                      <li>
                        <strong>Attendee information & meeting details:</strong> Participant email addresses, attendance status, and meeting notes when available and required for meeting scheduling or customer appointment management.
                      </li>
                      <li>
                        <strong>Calendar identifiers:</strong> Identifiers and metadata needed to recognize the specific calendar on which an event is scheduled or synced.
                      </li>
                      <li>
                        <strong>OAuth authorization credentials:</strong> Secure access and refresh tokens required to maintain your authorized connection to Google Calendar.
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2 italic">
                      We access only the information permitted by the Google OAuth scopes granted by you and strictly required for our calendar and appointment functionality.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Microsoft Outlook Calendar</h3>
                    <p className="mb-3">
                      When you connect your Microsoft account, we may access the following information, depending on the permissions you grant and the features you use:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
                      <li>
                        <strong>Outlook calendar event details:</strong> Subjects, descriptions, dates, times, time zones, locations, and event identifiers.
                      </li>
                      <li>
                        <strong>Attendee information & meeting details:</strong> Attendee email addresses, responses, and related event properties required for schedule synchronization and appointment management.
                      </li>
                      <li>
                        <strong>Calendar identifiers:</strong> Metadata and calendar IDs needed to synchronize and manage events across your Microsoft account.
                      </li>
                      <li>
                        <strong>OAuth authorization credentials:</strong> Secure authorization credentials required to maintain your active connection to Microsoft Outlook Calendar.
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2 italic">
                      We access only the information permitted by the Microsoft permissions granted by you and required for our calendar functionality.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Information You Provide</h3>
                    <p>
                      We may also collect information you provide directly through our application, such as your user profile details, team preferences, appointment slot settings, working hours, web conference links, and custom calendar integration settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use Calendar Information */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">3.</span> How We Use Calendar Information
                </h2>
                <p className="mb-3">
                  We use Google Calendar and Microsoft Outlook Calendar information solely to provide the calendar integration, appointment booking, and scheduling features requested by our users, including:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Connecting authorized Google and Microsoft calendar accounts to your 360Pipe workspace.</li>
                  <li>Creating new calendar events at the user&apos;s request (such as booking appointments, demos, customer meetings, and sales follow-ups).</li>
                  <li>Retrieving and displaying relevant event information within our calendar and activity views to prevent double-booking.</li>
                  <li>Updating existing calendar events when requested (such as rescheduling meetings or updating meeting links).</li>
                  <li>Deleting or canceling calendar events when requested and authorized by the user.</li>
                  <li>Synchronizing calendar availability with our appointment scheduling links and relevant pipeline features.</li>
                  <li>Maintaining authorized connections and troubleshooting integration or synchronization errors.</li>
                  <li>Protecting the application against unauthorized access, fraudulent use, and security incidents.</li>
                </ul>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                  <strong>Strict Scope Guarantee:</strong> We do not perform calendar operations outside the permissions granted by the user and the functionality explicitly authorized by the user.
                </div>
              </section>

              {/* Section 4: Authorization and Account Connections */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">4.</span> Authorization and Account Connections
                </h2>
                <p className="mb-3">
                  Users connect Google Calendar or Microsoft Outlook Calendar through the respective provider&apos;s standard OAuth 2.0 authorization process.
                </p>
                <p className="mb-3">
                  Users can review the requested permissions before granting access. We do not intentionally access calendar information through these integrations before obtaining the required authorization.
                </p>
                <p className="mb-3">
                  Our application securely stores OAuth refresh tokens on our backend infrastructure so that authorized calendar operations can continue seamlessly without requiring users to reconnect every time an access token expires.
                </p>
                <p>
                  Access tokens and refresh tokens are treated as confidential credentials, protected by encryption, and are never exposed to other users or unauthorized third parties.
                </p>
              </section>

              {/* Section 5: Storage and Security */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">5.</span> Storage and Security
                </h2>
                <p className="mb-3">
                  We store the information necessary to provide our calendar integration services on our secure application infrastructure and associated databases.
                </p>
                <p className="mb-3">
                  We use appropriate technical and organizational measures to protect calendar information and OAuth credentials against unauthorized access, disclosure, alteration, and destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mb-3">
                  <li>Strict access controls and role-based authorization for administrative systems.</li>
                  <li>Secure communication over HTTPS with industry-standard TLS encryption in transit.</li>
                  <li>Encrypted storage and safeguards for OAuth tokens and sensitive credentials.</li>
                  <li>Restricted backend network access and ongoing server security monitoring.</li>
                </ul>
                <p className="text-sm text-gray-600">
                  While no method of electronic transmission or storage is 100% impenetrable, we continually evaluate and enhance our security safeguards to protect all user data entrusted to us.
                </p>
              </section>

              {/* Section 6: Sharing and Disclosure of Information */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">6.</span> Sharing and Disclosure of Information
                </h2>
                <p className="mb-3 font-semibold text-gray-900">
                  We do not sell Google Calendar or Microsoft Outlook Calendar data.
                </p>
                <p className="mb-3">
                  We may share or process information only where strictly necessary to:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4">
                  <li>Operate and maintain our application through trusted service providers that support our cloud infrastructure, hosting, databases, or cybersecurity under strict data protection terms.</li>
                  <li>Perform calendar operations explicitly requested or authorized by the user.</li>
                  <li>Comply with applicable laws, court orders, or enforceable governmental requests.</li>
                  <li>Protect our users, application, and systems against fraud, abuse, or critical security vulnerabilities.</li>
                </ul>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-950 space-y-2">
                  <p>
                    <strong>Google API User Data Compliance:</strong> We do not use Google user data for advertising, sell it to data brokers, or transfer it for purposes unrelated to the user-facing features described in this policy, except as permitted by applicable Google policies and with any required consent.
                  </p>
                  <p>
                    <strong>Microsoft Data Compliance:</strong> We do not share Microsoft calendar information for unrelated purposes without an appropriate legal basis or required user authorization.
                  </p>
                </div>
              </section>

              {/* Section 7: Data Retention and Deletion */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">7.</span> Data Retention and Deletion
                </h2>
                <p className="mb-3">
                  We retain calendar information and related credentials only for as long as reasonably necessary to provide the requested services, fulfill the purposes described in this policy, and comply with legal obligations.
                </p>
                <p className="mb-3">
                  When a user disconnects a calendar account, we immediately stop using the associated authorization credentials for future calendar operations and follow our procedures for revoking access and removing stored credentials.
                </p>
                <p className="mb-3">
                  Calendar event data or other information already synchronized with application records (e.g. historical appointment logs) may require a separate deletion request. Disconnecting an account does not delete existing events already created on Google Calendar or Microsoft Outlook Calendar.
                </p>
                <p>
                  Users can contact us at any time to request complete deletion of information stored by our application, subject to applicable statutory retention requirements.
                </p>
              </section>

              {/* Section 8: Disconnecting Google Calendar or Microsoft Outlook Calendar */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">8.</span> Disconnecting Google Calendar or Microsoft Outlook Calendar
                </h2>
                <p className="mb-3">
                  Users can disconnect their calendar accounts at any time directly through the 360Pipe application via the{' '}
                  <NavLink
                    to="/dashboard/manageapps"
                    onClick={handleManageAppsClick}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Manage Apps
                  </NavLink>{' '}
                  page.
                </p>
                <p className="mb-3">
                  Users may also revoke our application&apos;s access at any time through their respective provider account settings:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 mb-4">
                  <li>
                    <strong>Google Account Permissions:</strong>{' '}
                    <a
                      href="https://myaccount.google.com/connections"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      https://myaccount.google.com/connections
                    </a>
                  </li>
                  <li>
                    <strong>Microsoft Account Permissions:</strong>{' '}
                    <a
                      href="https://account.live.com/consent/Manage"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      https://account.live.com/consent/Manage
                    </a>
                  </li>
                </ul>
                <p className="text-sm text-gray-600">
                  After access is revoked, our application will no longer be able to synchronize or perform calendar operations until you reconnect and grant permissions again. Revoking provider access does not automatically delete previously synchronized records from our application; users may contact us to request data purging.
                </p>
              </section>

              {/* Section 9: Third-Party Services and Policies */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">9.</span> Third-Party Services and Policies
                </h2>
                <p className="mb-3">
                  Our calendar integrations rely on third-party APIs provided by Google and Microsoft:
                </p>
                <ul className="list-disc list-inside space-y-3 pl-2 mb-4">
                  <li>
                    <strong>Google Calendar:</strong> Access is subject to Google&apos;s applicable terms and the{' '}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google API Services User Data Policy
                    </a>
                    , including its Limited Use requirements.
                  </li>
                  <li>
                    <strong>Microsoft Outlook Calendar:</strong> Access is provided through Microsoft identity and Microsoft Graph services and is governed by Microsoft&apos;s terms and policies:{' '}
                    <a
                      href="https://learn.microsoft.com/en-us/graph/outlook-calendar-concept-overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Microsoft Graph Overview
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://privacy.microsoft.com/privacystatement"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Microsoft Privacy Statement
                    </a>
                    .
                  </li>
                </ul>
                <p className="text-sm text-gray-600">
                  Google and Microsoft process data under their respective terms and privacy policies.
                </p>
              </section>

              {/* Section 10: Your Rights and Choices */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">10.</span> Your Rights and Choices
                </h2>
                <p className="mb-3">
                  Depending on your jurisdiction and applicable data protection laws, you may have the right to:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mb-3">
                  <li>Access and review personal information we hold about you.</li>
                  <li>Request correction of inaccurate or incomplete data.</li>
                  <li>Request deletion of your data or revocation of calendar synchronization.</li>
                  <li>Restrict or object to specific processing activities.</li>
                </ul>
                <p>
                  You can manage your permissions through your Google or Microsoft settings, disconnect your integration inside 360Pipe, or contact us directly to exercise any of these rights.
                </p>
              </section>

              {/* Section 11: Children's Privacy */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">11.</span> Children&apos;s Privacy
                </h2>
                <p>
                  Our application is designed for business productivity and enterprise sales management and is not directed at or knowingly designed to collect personal information from individuals under the age of 18 (or the age of majority in your jurisdiction). If you believe a child has provided us with personal information, please contact us immediately so we can promptly delete it.
                </p>
              </section>

              {/* Section 12: Changes to This Privacy Policy */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">12.</span> Changes to This Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our features, integrations, security measures, or regulatory requirements. When revisions occur, we will update the &quot;Last Updated&quot; date at the top of this page. We encourage you to review this policy periodically. Where required by law or platform policies, we will provide additional notice or obtain necessary consent prior to applying material changes.
                </p>
              </section>

              {/* Section 13: Contact Us */}
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">13.</span> Contact Us
                </h2>
                <p className="mb-4">
                  If you have questions, feedback, or data deletion requests regarding this Privacy Policy or our calendar integrations, please contact our privacy team:
                </p>
                <div className="space-y-2 text-sm sm:text-base">
                  <p>
                    <strong>Application:</strong> 360Pipe
                  </p>
                  <p>
                    <strong>Company / Legal Entity:</strong> 360Pipe Inc.
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
                    <strong>Privacy Policy URL:</strong>{' '}
                    <a
                      href="https://devwebapp.360pipe.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://devwebapp.360pipe.com/privacy
                    </a>
                  </p>
                  <p>
                    <strong>Privacy Contact Email:</strong>{' '}
                    <a
                      href="mailto:360pipeinc@gmail.com"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      360pipeinc@gmail.com
                    </a>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  We review and respond to privacy inquiries and access/deletion requests in accordance with applicable legal standards.
                </p>
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

export default Privacy;
