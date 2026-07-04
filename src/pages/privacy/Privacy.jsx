import React from 'react';
import Header from '../landingPage/header';
import CopyRight from '../landingPage/copyRight';

const Privacy = () => {
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
                `}} />

        {/* Scrollable Content Area - ONLY this section scrolls */}
        <div className="flex-1 overflow-y-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-8">Last Updated: July 4, 2026</p>

            {/* Section 1: Introduction */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction & Scope</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to <strong>360Pipe.ai</strong>. We respect your privacy and are committed to protecting the personal data of our users. This Privacy Policy describes how the 360Pipe.ai Chrome Extension collects, uses, stores, and shares information when you install and use our extension.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                This extension is designed to act as an AI-powered sales assistant, helping you capture conversations during business meetings, provide live coaching prompts, and keep your CRM data updated.
              </p>
            </section>

            {/* Section 2: Data We Collect */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect and Access</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To fulfill the features of the extension, we access and collect the following data only when necessary:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li className="pl-2">
                  <strong className="text-gray-900">Meeting Transcripts & Captions:</strong> When active on supported meeting web platforms (Google Meet, Microsoft Teams), the extension processes the on-screen captions or transcripts locally to provide real-time sales advice.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">Authentication Cookies:</strong> We access cookies associated with our web app domain (360pipe.com) to securely verify your login status and sync credentials across the web app and extension.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">Local Browser Storage:</strong> We use the extension's local storage API to remember preferences, settings, and config keys (e.g., your OpenAI API key) on your browser.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">CRM Authentication Tokens:</strong> If you connect your Salesforce CRM account, authentication tokens are used to synchronize customer records and log opportunities directly.
                </li>
              </ol>
            </section>

            {/* Section 3: How We Use Data */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use the Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We process your data strictly to deliver and improve our service's single purpose:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li className="pl-2">To generate real-time AI suggestions, questions, and sales coaching guides during meetings.</li>
                <li className="pl-2">To synchronize meeting summary data, contact info, and opportunity updates directly into your Salesforce CRM.</li>
                <li className="pl-2">To maintain your session state so you do not have to sign in repeatedly.</li>
              </ol>
              <p className="text-gray-700 leading-relaxed mt-4 bg-gray-50 border border-gray-100 p-4 rounded-lg">
                💡 <strong>We do not sell, rent, or lease your personal data.</strong> Your information is processed exclusively to deliver our sales-coaching services.
              </p>
            </section>

            {/* Section 4: Third-Party Services */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services & AI Integration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our extension integrates with third-party service providers to generate insights:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li className="pl-2">
                  <strong className="text-gray-900">OpenAI API:</strong> Transcripts are processed through OpenAI APIs. These requests are governed by OpenAI's API data privacy terms, which state that API data is not used to train models.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">CRM Services (Salesforce):</strong> Data is transmitted directly to your Salesforce account via Salesforce APIs to update opportunities and customer profiles.
                </li>
              </ol>
            </section>

            {/* Section 5: Data Security */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security & Storage</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We prioritize data safety and employ industry-standard practices:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li className="pl-2">All communications between the extension, meeting platforms, CRM, and our APIs are encrypted in transit using Secure Sockets Layer (SSL/TLS).</li>
                <li className="pl-2">API keys and user configurations are encrypted and stored in local, extension-scoped browser storage that other web pages cannot read.</li>
              </ol>
            </section>

            {/* Section 6: User Controls */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Choices & Controls</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You maintain full control over the extension's data access:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li className="pl-2">You can log out at any time, which deletes authentication cookies and stops synchronization.</li>
                <li className="pl-2">You can disconnect your Salesforce integration directly from the settings panel.</li>
                <li className="pl-2">You can uninstall the extension at any time via the Chrome Extensions settings page to immediately purge all local files and storage configurations.</li>
              </ol>
            </section>

            {/* Section 7: Policy Changes */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to this Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. When we make updates, we will revise the "Last Updated" date at the top of the policy page. We recommend reviewing this document periodically to stay informed about how we protect your data.
              </p>
            </section>

            {/* Section 8: Contact Info */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions, feedback, or concerns regarding your privacy or data usage with the 360Pipe.ai extension, please contact us at:
              </p>
              <div className="mt-4 text-gray-800 space-y-2">
                <p>📩 <strong>Email:</strong> 360pipeinc@gmail.com</p>
                <p>🌐 <strong>Website:</strong> <a href="https://devwebapp.360pipe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://360pipe.com</a></p>
              </div>
            </section>
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
