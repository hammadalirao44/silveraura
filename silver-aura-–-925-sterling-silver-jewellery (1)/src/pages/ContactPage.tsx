import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.message) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#78716C] font-semibold block">
            Client Concierge
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Connect With Our Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Whether you seek bespoke ring sizing, custom bridal consultation, or order assistance across Pakistan, our jewellery specialists are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* Left: Contact Info & Studio Location */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 bg-white border border-[#E8E0D5] rounded-xs space-y-4">
              <h3 className="font-serif-luxury text-2xl text-[#1C1917] font-medium">
                Direct Channels
              </h3>

              <div className="space-y-4 text-xs text-[#57534E]">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1C1917]">WhatsApp Concierge (Fastest)</strong>
                    <span className="text-[#78716C]">+92 300 8291925</span>
                    <p className="text-[11px] text-[#A8A29E] mt-0.5">Average response time: under 15 minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1C1917]">Email Inquiries</strong>
                    <span className="text-[#78716C]">concierge@silveraura.pk</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1C1917]">Atelier Working Hours</strong>
                    <span className="text-[#78716C]">Monday – Saturday: 10:00 AM – 8:00 PM (PKT)</span>
                    <span className="block text-[#A8A29E]">Sunday: Private Appointments Only</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1C1917]">Karachi Flagship Atelier</strong>
                    <p className="text-[#78716C] leading-relaxed">
                      Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nationwide Delivery Notice */}
            <div className="p-5 bg-[#F4EFEB] border border-[#E8E0D5] text-xs text-[#57534E] space-y-1.5">
              <span className="font-semibold text-[#1C1917] block">Courier Hubs Across Pakistan:</span>
              <p>Karachi · Lahore · Islamabad · Rawalpindi · Faisalabad · Multan · Peshawar · Sialkot</p>
              <p className="text-[11px] text-[#78716C] pt-1">
                Dispatched daily via insured TCS Express with tamper-proof security seals.
              </p>
            </div>

          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-[#E8E0D5] rounded-xs shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif-luxury text-2xl text-[#1C1917] font-medium">
                  Message Dispatched
                </h3>
                <p className="text-xs text-[#57534E] max-w-sm mx-auto">
                  Thank you for reaching out. One of our jewellery concierges will respond via email or WhatsApp within a few hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="py-2.5 px-6 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif-luxury text-2xl text-[#1C1917] font-medium pb-2 border-b border-[#E8E0D5]">
                  Send an Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sana Ahmed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#D6CEC5] px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="03xx-xxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#D6CEC5] px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="sana@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#D6CEC5] px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Inquiry Purpose</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#D6CEC5] px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    >
                      <option value="General Inquiry">General Product Inquiry</option>
                      <option value="Ring Sizing">Custom Ring Sizing Assistance</option>
                      <option value="Bridal Suite">Bridal Suite Consultation</option>
                      <option value="Order Tracking">Existing Order Tracking</option>
                      <option value="Corporate / Gifting">Corporate & Bulk Gifting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#57534E] mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the piece you have in mind or any questions about silver purity, care, or ring sizing..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#D6CEC5] px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-8 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
