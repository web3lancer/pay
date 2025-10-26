'use client'

import React from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { FiHelpCircle, FiMail, FiPhone } from 'react-icons/fi'

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Click on your profile in the top right, then select "Settings". Find the security section and click "Change Password".'
    },
    {
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Settings > Security and toggle on "Two-Factor Authentication". Follow the setup instructions to complete the process.'
    },
    {
      question: 'Can I change my email address?',
      answer: 'Email addresses cannot be changed for security reasons. If you need to update it, please contact support.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'For account deletion, please contact our support team. We can help you delete your account and all associated data.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard encryption and security practices to protect your data. All sensitive information is encrypted both in transit and at rest.'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar onMenuClick={() => {}} mobile={false} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Help & Support</h1>
          <p className="text-lg text-neutral-600">Find answers to common questions</p>
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-neutral-200 rounded-lg p-4 hover:border-cyan-300 transition-colors"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900">
                  <span>{faq.question}</span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-neutral-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <FiMail className="h-6 w-6 text-cyan-500" />
              <h3 className="text-lg font-bold text-neutral-900">Email Support</h3>
            </div>
            <p className="text-neutral-600 mb-4">
              Have a question? Send us an email and we'll get back to you as soon as possible.
            </p>
            <a
              href="mailto:support@lancerpay.io"
              className="inline-block px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Contact Support
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <FiPhone className="h-6 w-6 text-cyan-500" />
              <h3 className="text-lg font-bold text-neutral-900">Phone Support</h3>
            </div>
            <p className="text-neutral-600 mb-4">
              Available Monday to Friday, 9am - 5pm EST. Call us for immediate assistance.
            </p>
            <a
              href="tel:+1234567890"
              className="inline-block px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Call Now
            </a>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex gap-3">
            <FiHelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Need more help?</h3>
              <p className="text-blue-800">
                Visit our comprehensive documentation or community forums for more detailed information about using LancerPay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
