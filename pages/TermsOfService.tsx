
import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-blue">
            <h1 className="text-4xl font-bold text-deepBlue mb-4">Terms of Service</h1>
            <p className="text-gray-500 mb-8">Last updated: February 2025</p>
            
            <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Unfindable platform ("Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">2. The Marketplace Model</h2>
                    <p>
                        Unfindable acts as a venue to match Requesters (buyers) and Finders (sellers). We are not a party to any transaction between users unless explicitly stated. We do not guarantee the quality, safety, or legality of items advertised, the truth or accuracy of listings, the ability of sellers to sell items, or the ability of buyers to pay for items.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">3. User Accounts</h2>
                    <p>
                        To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">4. Fees and Payments</h2>
                    <p>
                        Unfindable charges fees for certain services, such as transaction fees on completed orders. You agree to pay all fees associated with your use of the Platform. All payments are securely processed through our third-party payment providers. Funds are held in escrow until the Requester confirms receipt of the item.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">5. Prohibited Items & Conduct</h2>
                    <p>
                        You may not post requests for or offer to sell illegal items, hazardous materials, weapons, or any items prohibited by our policies. You agree not to use the Service to harass, abuse, or harm another person or to post any content that is hateful, threatening, or pornographic.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">6. Dispute Resolution</h2>
                    <p>
                        In the event of a dispute between a Requester and a Finder, we encourage you to contact us. Unfindable may, at its discretion, attempt to help resolve disputes, but we have no obligation to do so.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-deepBlue mb-3">7. Termination</h2>
                    <p>
                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                    </p>
                </section>
            </div>
        </div>
    </div>
  );
};
