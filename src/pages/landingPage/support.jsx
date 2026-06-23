import React from 'react';
import Header from './header';
import CopyRight from './copyRight';

const Support = () => {
    return (
        <>
            <div className="h-screen flex flex-col">
                <Header />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* System and Security */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">System and Security</h2>
                            <p className="text-gray-700 mb-4">
                                The database is encrypted and tokenized. We only allow client connections over SSL so your data is encrypted at rest and in flight. We are fully GDPR compliant to meet the EU Privacy and CCPA compliance requirements.
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>Support for Multi-User</li>
                                <li>Support for Application Roles</li>
                            </ol>
                        </section>

                        {/* Communication */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>Send one email to a contact or mass emails</li>
                                <li>Send mass texts or chat</li>
                                <li>Take and receive phone calls</li>
                                <li>Forward a phone call to another phone</li>
                            </ol>
                        </section>

                        {/* CRM */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">CRM</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to support 10 User Defined Fields.</li>
                                <li>The ability to segment a list based on any field in your contact list.</li>
                                <li>The ability to chat with your contacts</li>
                                <li>The ability to send a singular SMS or Email to one of your contacts</li>
                                <li>The ability to import a contact list from Quicken, SalesForce, MailChimp and Constant Contact</li>
                                <li>See a view of all communication with your customers</li>
                                <li>Allow customers to maintain their own data via SMS or Email (Opt In)</li>
                                <li>Opt Customers out</li>
                                <li>Email Verification of bad email addresses</li>
                                <li>Customizable Opt-in and Opt-out email and sms templates</li>
                                <li>Duplicate contact check</li>
                                <li>Call contacts from the browser</li>
                                <li>Receive Phone calls into browser</li>
                            </ol>
                        </section>

                        {/* AI */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>Text Generation and Rewriting. It's great!!</li>
                                <li>Image creation from text instructions</li>
                                <li>Survey creation</li>
                            </ol>
                        </section>

                        {/* Calendar - Free */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calendar - Free</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>Publish and Synch your Office365 and Google Calendar online to take appointments</li>
                                <li>Schedule marketing events for your clients and leads</li>
                                <li>Schedule events, email and SMS reminders</li>
                            </ol>
                        </section>

                        {/* Email Features */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Features</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to warm up your domain</li>
                                <li>Email Automation &amp; Drip campaigns</li>
                                <li>Built-in Free Email Verification. No more bounces</li>
                                <li>Built-in Domain Protection. Email is throttled by the receiving domain</li>
                                <li>The ability to send a responsive HTML email in any language.</li>
                                <li>The ability for your members to set their language preferences.</li>
                                <li>Import your website styles and colors</li>
                                <li>Website Tracking</li>
                                <li>The ability to personalize a Subject Line.</li>
                                <li>Full A/B Testing with managed and unmanaged AI. We can pick the winner for the best results of From Name, Email Address, Subject Line Or Template.</li>
                                <li>The ability to send email to an individual, group or segmented list.</li>
                                <li>The ability to send a text or HTML email</li>
                                <li>The ability to resend a campaign to those who did not open the email.</li>
                                <li>The ability to build an html email with a WSYWIG drag-and-drop editor. It's GREAT!</li>
                                <li>The ability to edit your images right in our editor</li>
                                <li>The ability to send us your existing email template and we will hand code it properly to work with our engine</li>
                                <li>Predefined common email templates</li>
                                <li>Support for emojis</li>
                                <li>Support for File Attachments</li>
                                <li>Best in Class Opt In and Opt Out</li>
                                <li>The ability to pick up accurate open rates on Gmail and Apple Platforms</li>
                                <li>The ability to save an Email Template as a jpg, pdf or HTML so you can post on your Website</li>
                                <li>Customize your email footer with your logo and address</li>
                                <li>The ability to throttle your email to distribute over a number of days</li>
                            </ol>
                        </section>

                        {/* Automation */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Automation</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to build a workflow or drip campaign with drag and drop and conditional events</li>
                                <li>The ability to customize a return SMS response to a phase</li>
                                <li>The ability to send a workflow via link opened or a website URL visited</li>
                            </ol>
                        </section>

                        {/* SMS Features */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">SMS Features</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>Built in 10 DLC registration</li>
                                <li>The ability to send an SMS/MMS to an individual or group segmented group or individual.</li>
                                <li>SMS Conversations or Chat.</li>
                                <li>Generic SMS Inbox.</li>
                                <li>Configurable and Optional Opt Out Statement.</li>
                                <li>Capture replies to a SMS broadcast or Chat.</li>
                                <li>Forward an SMS replies to a personal cell phone number.</li>
                                <li>Long Texts or one SMS that are not broken up in 160 character parts.</li>
                                <li>The ability to ability to embed a picture, video, form or survey.</li>
                                <li>The ability to build a Text with a WSYWIG emulator.</li>
                                <li>The ability to source any field out of your Contact List.</li>
                                <li>SMS Polls, of course using our same great surveys engine we have with Emails.</li>
                                <li>The ability for a member to STOP a SMS campaign.</li>
                                <li>The ability to schedule your SMS campaign.</li>
                            </ol>
                        </section>

                        {/* SMS Polls */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">SMS Polls</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to create a SMS Poll or send a Survey via SMS with conditional logic</li>
                                <li>Great for creating google reviews for your business!</li>
                            </ol>
                        </section>

                        {/* Forms */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Forms</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to create an online form with zero coding that you can attach to a Survey, Assessment, Email or your website to harvest data that is important to you</li>
                                <li>Full featured forms that use the same editor as the our email editor</li>
                                <li>Presentation is 100% customizable to implement any look and feel</li>
                                <li>Single or Multi-paged forms</li>
                                <li>Embedded landing pages</li>
                                <li>Forms can be Surveys and Surveys can be forms</li>
                                <li>The ability to generate leads or create a follow up for one of your customers.</li>
                            </ol>
                        </section>

                        {/* Surveys */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Surveys</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to customize your survey with a logo and use your look and feel. And it's free! We do not charge more for features!</li>
                                <li>Single and Multi-Page forms</li>
                                <li>The ability to embed a landing page</li>
                                <li>The ability to associate demographic questions into your Survey.</li>
                                <li>The ability to create a survey with 23 different types of Question Types, Multi-Answer, One Answer, Open Answer and others.</li>
                                <li>Support for Matrix Survey questions typically seen in Employee Surveys. Answers on the top and Questions on the left.</li>
                                <li>The ability to set a Question Logic Flow so the questions will change based on a previous answer leveraging drag and drop to ease visualizing Survey logic</li>
                                <li>The ability to call a form based on a Answer</li>
                                <li>The ability to restrict by geographic area on who can respond. Right now its by Country. Tell us what you are looking for!</li>
                                <li>The ability to embed our survey on your Website.</li>
                                <li>The ability to embed a survey in an Email Blast.</li>
                                <li>The ability to embed in a Survey</li>
                                <li>Full graphical reporting with the ability to drill down and view at the Company, Organization and Manager level or Club, Age, Group and coach level.</li>
                            </ol>
                        </section>

                        {/* Assessments */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessments</h2>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>The ability to create an assessment or customized response to a Survey.</li>
                                <li>Different scoring models supported for how customized your answers can be, including the ability to have a 100% unique response for every possible answer.</li>
                                <li>Display the results with powerful visual graphic dials in a Summary and Detail Report.</li>
                                <li>The ability to create your own sections or categories.</li>
                                <li>Plus all the features of Surveys listed above.</li>
                                <li>Ideal to put on your website and highlight the advantages of your product or service.</li>
                            </ol>
                        </section>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="fixed bottom-0 z-30 w-full border-t border-gray-200 shadow-sm bg-white">
                    <CopyRight />
                </div>
            </div>
        </>
    );
};

export default Support;