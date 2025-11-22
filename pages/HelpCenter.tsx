
import React, { useState } from 'react';
import { Search, HelpCircle, Package, FileText, Shield, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelpCenter: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I post a request?",
      answer: "Simply navigate to the 'Post Request' page, fill in the details of the item you're looking for, including photos and your budget, and submit. Finders will then be notified."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes, your payment is held securely in escrow until you confirm that you have received the item and are satisfied with it. We use trusted payment processors to ensure your data is safe."
    },
    {
      question: "How do I verify my account?",
      answer: "You can verify your account by going to Account Settings and uploading a government-issued ID. Verified users get a badge on their profile, increasing trust within the community."
    },
    {
      question: "What happens if the item isn't found?",
      answer: "If no finder is able to fulfill your request by the deadline, the request expires. You will not be charged, and you can choose to repost the request if you wish."
    },
  ];

  return (
    <div className="bg-offWhite min-h-screen">
        <div className="bg-deepBlue text-white py-16">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h1 className="text-3xl font-bold mb-6">How can we help you?</h1>
                <div className="relative">
                    <input type="text" placeholder="Search for help articles..." className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none shadow-lg" />
                    <button className="absolute right-2 top-2 bg-softTeal text-white px-4 py-2 rounded-md font-medium">Search</button>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Getting Started', icon: HelpCircle, link: '/getting-started' },
                    { title: 'Buying & Requests', icon: Package, link: '/buying-requests' },
                    { title: 'Selling & Finding', icon: Search, link: '/selling-finding' },
                    { title: 'Payments', icon: FileText, link: '/payments' },
                    { title: 'Account Settings', icon: Shield, link: '/account-settings' },
                    { title: 'Safety & Trust', icon: CheckCircle, link: '/safety-trust' },
                ].map((cat, i) => (
                    <Link 
                        key={i} 
                        to={cat.link}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer text-center block"
                    >
                        <cat.icon className="h-10 w-10 text-softTeal mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900">{cat.title}</h3>
                    </Link>
                ))}
            </div>
            
             <div className="mt-16">
                <h2 className="text-2xl font-bold text-deepBlue mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 cursor-pointer text-left focus:outline-none"
                            >
                                <span className="font-medium text-gray-700">{faq.question}</span>
                                {openIndex === i ? 
                                    <ChevronUp className="h-5 w-5 text-softTeal flex-shrink-0" /> : 
                                    <HelpCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                }
                            </button>
                            {openIndex === i && (
                                <div className="px-4 pb-4 pt-0 text-gray-600 text-sm leading-relaxed">
                                    <div className="pt-2 border-t border-gray-100 mt-2">
                                        {faq.answer}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
