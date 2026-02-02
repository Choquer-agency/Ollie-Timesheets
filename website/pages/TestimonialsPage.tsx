import React from 'react';
import { Quote } from 'lucide-react';

// App subdomain URL - use full URL in production, relative path in dev
const APP_URL = typeof window !== 'undefined' && window.location.hostname === 'olliehours.com' 
  ? 'https://app.olliehours.com' 
  : '/app';

export const TestimonialsPage: React.FC = () => {
  const stories = [
    {
      quote: "I used to spend 4 hours every other Friday chasing timesheets. Ollie automated the entire process. Now I just click 'Approve'.",
      author: "Sarah Jenkins",
      role: "Founder, Creative Co.",
      company: "Design Agency",
      avatar: "SJ"
    },
    {
      quote: "The roadblock feature is genius. My team kept forgetting to clock out on Fridays. Now the app reminds them Monday morning before they can start work.",
      author: "Marcus Chen",
      role: "Operations Director",
      company: "TechFlow",
      avatar: "MC"
    },
    {
      quote: "My bookkeeper loves the direct email feature. I don't have to be the middleman anymore. It just works.",
      author: "Elena Rodriguez",
      role: "CEO",
      company: "Rodriguez Marketing",
      avatar: "ER"
    },
    {
      quote: "We switched from a $200/month enterprise solution. Ollie does everything we need at a fraction of the cost.",
      author: "David Park",
      role: "HR Manager",
      company: "Bright Studios",
      avatar: "DP"
    },
    {
      quote: "The vacation request workflow saved us so much back-and-forth. Employees request, I approve, done. No more email chains.",
      author: "Amanda Foster",
      role: "Office Manager",
      company: "Foster & Associates",
      avatar: "AF"
    },
    {
      quote: "Finally, a time tracking app that doesn't look like it was built in 2005. The interface is beautiful and my team actually enjoys using it.",
      author: "James Liu",
      role: "Creative Director",
      company: "Liu Creative",
      avatar: "JL"
    }
  ];

  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto mb-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
          Loved by modern teams.
        </h1>
        <p className="text-muted-foreground text-xl">See why agencies are switching to Ollie.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story, i) => (
          <div 
            key={i} 
            className="bg-card border border-border p-8 rounded-3xl relative shadow-lg hover:shadow-xl transition-shadow group"
          >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 w-10 h-10 bg-[#A1EB97]/20 rounded-full flex items-center justify-center">
              <Quote className="w-5 h-5 text-[#2CA01C]" />
            </div>
            
            {/* Quote Text */}
            <p className="text-lg text-foreground mb-8 leading-relaxed pr-12">
              "{story.quote}"
            </p>
            
            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2CA01C] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {story.avatar}
              </div>
              <div>
                <div className="font-bold text-[#263926] dark:text-[#a8d5a2]">{story.author}</div>
                <div className="text-sm text-muted-foreground">{story.role}</div>
                <div className="text-xs text-[#2CA01C] font-medium uppercase tracking-wider mt-1">
                  {story.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-24 bg-[#263926] rounded-3xl p-12 text-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-medium mb-4">Trusted by growing teams</h2>
          <p className="text-white/60">Join hundreds of agencies already using Ollie Hours</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[#A1EB97] mb-2">500+</div>
            <div className="text-white/60 text-sm">Active Teams</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#A1EB97] mb-2">15K+</div>
            <div className="text-white/60 text-sm">Employees Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#A1EB97] mb-2">98%</div>
            <div className="text-white/60 text-sm">Customer Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#A1EB97] mb-2">4.9</div>
            <div className="text-white/60 text-sm">Average Rating</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
          Ready to join them?
        </h3>
        <a 
          href={`${APP_URL}?signup=true`}
          className="inline-block px-8 py-4 bg-[#2CA01C] text-white font-bold rounded-full hover:bg-[#238a16] transition-all shadow-lg shadow-[#2CA01C]/20"
        >
          Start Your Free Trial
        </a>
      </div>
    </div>
  );
};
