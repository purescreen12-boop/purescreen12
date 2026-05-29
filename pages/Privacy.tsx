import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Eye, Lock, Cookie, UserCheck,
  Database, Mail, ChevronDown, ChevronUp
} from 'lucide-react';

const Privacy: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: `We collect information you provide directly to us, such as when you create an account, upload content, or contact us for support. This includes:

• Personal Information: Name, email address, phone number, profile information
• Content: Movies, trailers, thumbnails, and descriptions you upload
• Communications: Messages, comments, and feedback you send us
• Usage Data: How you interact with our platform, pages visited, features used

We also automatically collect certain information when you use our service, including your IP address, browser type, device information, and usage patterns.`
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send technical notices, updates, security alerts, and support messages
• Respond to your comments, questions, and requests
• Communicate with you about products, services, and promotions
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions and other illegal activities
• Personalize your experience and provide content recommendations

Your content is used to provide the streaming service to other users while maintaining your ownership rights.`
    },
    {
      title: "Information Sharing and Disclosure",
      icon: UserCheck,
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:

• Service Providers: We may share information with trusted third parties who assist us in operating our website, conducting our business, or servicing you
• Legal Requirements: We may disclose information if required by law, court order, or government request
• Protection of Rights: We may share information to protect our rights, property, or safety, or that of our users
• Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred

Public information such as your username, profile picture, and uploaded content is visible to other users of the platform.`
    },
    {
      title: "Data Security",
      icon: Lock,
      content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

• Encryption of data in transit and at rest
• Regular security assessments and updates
• Access controls and authentication procedures
• Secure server infrastructure and monitoring
• Employee training on data protection

While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.`
    },
    {
      title: "Cookies and Tracking Technologies",
      icon: Cookie,
      content: `We use cookies and similar tracking technologies to enhance your experience on our platform:

• Essential Cookies: Required for basic site functionality
• Analytics Cookies: Help us understand how you use our service
• Preference Cookies: Remember your settings and preferences
• Authentication Cookies: Keep you logged in during your session

You can control cookie settings through your browser preferences. However, disabling certain cookies may affect site functionality.

We also use PureScreen database system to save your preferences, movie progress, and other user-specific data on your device.`
    },
    {
      title: "Your Rights and Choices",
      icon: Shield,
      content: `You have certain rights regarding your personal information:

• Access: Request a copy of the personal information we hold about you
• Correction: Update or correct inaccurate information
• Deletion: Request deletion of your personal information
• Portability: Receive your data in a structured, machine-readable format
• Opt-out: Unsubscribe from marketing communications
• Restriction: Limit how we process your information

To exercise these rights, contact us using the information provided below. We will respond to your requests within 24 hours.

You may also delete your account at any time through your profile settings.`
    },
    {
      title: "Children's Privacy",
      icon: Shield,
      content: `PureScreen is designed to be a friendly streaming platform. In addition to general audience content, we also provide a dedicated selection of children’s programming, including Christian animations, Bible story cartoons, faith-based educational shows, and inspiring movies created specifically for young viewers.

We are committed to creating a safe and uplifting environment for children. Some features may require parental guidance, and parents or guardians are encouraged to supervise their children’s online activities. We also recommend the use of parental control tools to help ensure that children access content appropriate for their age.`
    },
    {
      title: "International Data Transfers",
      icon: Database,
      content: `Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.

By using our service, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.`
    },
    {
      title: "Changes to This Privacy Policy",
      icon: Shield,
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.

Your continued use of our service after any changes indicates your acceptance of the updated Privacy Policy.`
    },
    {
      title: "Contact Us",
      icon: Mail,
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

• Email: support@purescreen.site
• Through our Help Center
• Via the social media handles.

We are committed to addressing your privacy concerns and will respond to your inquiries as quickly as possible.

For urgent privacy matters, you can reach us at: support@purescreen.site`
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield size={40} className="text-[#d4af37]" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <span>Last updated: January 8, 2026</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Your Privacy</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            At PureScreen, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our faith-based streaming platform.
          </p>
          <p className="text-gray-300 leading-relaxed">
            We believe in transparency and give you control over your data. By using PureScreen, you trust us with your information, and we are committed to earning and maintaining that trust through responsible data practices.
          </p>
        </div>

        {/* Privacy Sections */}
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

        {/* Data Protection Notice */}
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-3xl p-8 text-center mb-8">
          <Lock size={32} className="text-[#d4af37] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Your Data is Protected</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            We implement industry-standard security measures and comply with applicable data protection laws to keep your information safe. Your trust and privacy are our top priorities.
          </p>
        </div>

        {/* Action Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Questions About Your Privacy?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            If you have any questions about our privacy practices or would like to exercise your data rights, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/help-center"
              className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#c49f27] transition-colors"
            >
              Visit Help Center
            </Link>
            <Link
              to="/terms-of-use"
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              Read Terms of Use
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
          <p>This Privacy Policy is governed by applicable data protection laws.</p>
          <p className="mt-2">© 2026 PureScreen. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;