
import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-blue">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-deepBlue mb-4">Privacy Policy</h1>
            <p className="text-gray-500 mb-8">Last updated: February 2025</p>
            
            <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-lg sm:text-xl font-bold text-deepBlue mb-3">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for Requesters), and other information you choose to provide.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg sm:text-xl font-bold text-deepBlue mb-3">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to facilitate the connection between Requesters and Finders, including:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Provide, maintain, and improve our Services.</li>
                        <li>Process payments and send related receipts.</li>
                        <li>Send you technical notices, updates, security alerts, and support messages.</li>
                        <li>Respond to your comments, questions, and requests.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg sm:text-xl font-bold text-deepBlue mb-3">3. Sharing of Information</h2>
                    <p>
                        We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>With Finders to enable them to provide the Services you request.</li>
                        <li>With the general public if you submit content in a public forum, such as blog comments, social media posts, or other features of our Services that are viewable by the general public.</li>
                        <li>With third parties with whom you choose to let us share information, for example other apps or websites that integrate with our API or Services.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg sm:text-xl font-bold text-deepBlue mb-3">4. Security</h2>
                    <p>
                        Unfindable takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg sm:text-xl font-bold text-deepBlue mb-3">5. Your Choices</h2>
                    <p>
                        <strong>Account Information:</strong> You may update, correct or delete information about you at any time by logging into your online account or by emailing us at support@unfindable.com.
                    </p>
                </section>
            </div>
        </div>
    </div>
  );
};
