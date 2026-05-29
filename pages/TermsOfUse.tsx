import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Shield, Users, AlertTriangle,
  Mail, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';

const TermsOfUse: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FileText,
      content: `By accessing and using PureScreen ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: "Use License",
      icon: Shield,
      content: `Permission is granted to temporarily access the materials (information or software) on PureScreen for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display (commercial or non-commercial)
• Attempt to decompile or reverse engineer any software contained on PureScreen
• Remove any copyright or other proprietary notations from the materials

This license shall automatically terminate if you violate any of these restrictions and may be terminated by GospelScreen TV at any time.`
    },
    {
      title: "User Accounts",
      icon: Users,
      content: `When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.

You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.

You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you, without appropriate authorization.`
    },
    {
      title: "Content Guidelines",
      icon: AlertTriangle,
      content: `PureScreen is committed to providing faith-based, uplifting content. All uploaded content must adhere to Christian values and principles. Prohibited content includes:

• Material that promotes violence, hatred, or discrimination
• Explicit or inappropriate content
• Copyrighted material without proper authorization
• False or misleading information
• Content that violates any applicable laws or regulations

We reserve the right to remove any content that violates these guidelines and may suspend or terminate accounts that repeatedly upload prohibited material.`
    },
    {
      title: "Intellectual Property",
      icon: Shield,
      content: `The Platform and its original content, features, and functionality are and will remain the exclusive property of PureScreen and its licensors. The service is protected by copyright, trademark, and other laws.

Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of PureScreen.

You retain ownership of content you upload to the Platform, but you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the service.`
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using PureScreen, you agree to the collection and use of information in accordance with our Privacy Policy.

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.`
    },
    {
      title: "Limitation of Liability",
      icon: AlertTriangle,
      content: `In no event shall PureScreen, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.

While we strive to provide accurate and reliable content, we do not warrant that the service will be uninterrupted or error-free.`
    },
    {
      title: "Contact Information",
      icon: Mail,
      content: `If you have any questions about these Terms of Use, please contact us:

• Email: support@purescreen.site
• Through our Help Center
• Via the social media handles.

We will respond to your inquiries as quickly as possible.`
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText size={40} className="text-[#d4af37]" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">Terms of Use</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using PureScreen to understand your rights and responsibilities when accessing our platform.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Calendar size={16} />
            <span>Last updated: January 7, 2026</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to PureScreen</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            PureScreen is a faith-based streaming platform dedicated to sharing uplifting, 
            inspiring content through digital media. Our mission is to spread the 
            Gospel through cinema while maintaining the highest standards of integrity and respect.
          </p>
          <p className="text-gray-300 leading-relaxed">
            These Terms of Use govern your use of our website and services. By accessing or using PureScreen, you agree to be bound by these terms. If you disagree with any part of these terms, you may not access the service.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === index;

            return (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-[#d4af37]" />
                    <span className="text-white font-semibold text-lg">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-[#d4af37]" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Agreement Section */}
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-3xl p-8 text-center">
          <Shield size={32} className="text-[#d4af37] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            By using PureScreen, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. These terms constitute the entire agreement between you and PureScreen regarding the use of our service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/help-center"
              className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#c49f27] transition-colors"
            >
              Visit Help Center
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>These terms are governed by applicable copyright and intellectual property laws.</p>
          <p className="mt-2">© 2026 PureScreen. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;