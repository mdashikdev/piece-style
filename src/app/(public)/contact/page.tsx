'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+880 1700-000000', href: 'tel:+8801700000000' },
    { icon: Mail, label: 'Email', value: 'info@piecestyle.com', href: 'mailto:info@piecestyle.com' },
    { icon: MapPin, label: 'Address', value: 'Dhaka, Bangladesh' },
    { icon: Clock, label: 'Hours', value: 'Sun-Thu, 9:00 AM - 6:00 PM' },
  ];

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 lg:py-24">
        <div className="container-main">
          <div className="max-w-2xl">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-3">Contact</span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-gray-300 text-lg">Have a question or need help? We&apos;re here for you.</p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-main">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="lg:col-span-2 space-y-5">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4 p-5 rounded-2xl border border-border hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <info.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-body mb-0.5">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="font-medium hover:text-primary transition-colors">{info.value}</a>
                    ) : (
                      <p className="font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3">
              <div className="border border-border rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25"
                  >
                    <Send size={16} />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
