import Link from "next/link";
import { Sparkles, BrainCircuit, LineChart, BookOpen, Target, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-ocean/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-ocean/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/20 text-ocean text-sm font-medium mb-4">
              <Sparkles size={16} />
              <span>Next-Gen AI Learning Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
              Master Any Topic with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean via-blue-500 to-cyan-400 drop-shadow-sm">
                AI Precision
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/60 max-w-3xl mx-auto leading-relaxed font-medium">
              Experience the future of education. Our Grok-powered AI doesn't just quiz you—it understands your learning gaps and builds a custom road towards mastery.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
              <Link
                href="/register"
                className="group relative px-10 py-5 bg-ocean text-white rounded-2xl font-bold text-xl hover:shadow-[0_0_30px_-5px_rgba(var(--ocean),0.5)] transition-all active:scale-95 w-full sm:w-auto overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-2">
                  Get Started Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
              <Link
                href="/login"
                className="px-10 py-5 glass text-foreground border border-white/40 rounded-2xl font-bold text-xl hover:bg-white/40 transition-all active:scale-95 w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Stats / Trust Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl pt-10 border-t border-white/10 animate-in fade-in duration-1000 delay-500">
             <div className="text-center">
                <div className="text-3xl font-bold text-ocean">10k+</div>
                <div className="text-sm text-foreground/50">Topics Covered</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-bold text-ocean">98%</div>
                <div className="text-sm text-foreground/50">Accuracy Rate</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-bold text-ocean">AI-24/7</div>
                <div className="text-sm text-foreground/50">Instant Feedback</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-bold text-ocean">Zero</div>
                <div className="text-sm text-foreground/50">Memorization</div>
             </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="w-full max-w-7xl mx-auto p-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why choose AI-powered learning?</h2>
            <div className="h-1.5 w-20 bg-ocean mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Question Engine", 
                desc: "Powered by xAI Grok, generate high-fidelity MCQs that test deep understanding, not just surface-level facts.", 
                icon: <BrainCircuit className="text-ocean" size={32} />,
                accent: "blue"
              },
              { 
                title: "Deep Step Explanations", 
                desc: "Get crystal clear reasoning for every right and wrong answer. Learn the 'why' behind every concept instantly.", 
                icon: <BookOpen className="text-ocean" size={32} />,
                accent: "cyan"
              },
              { 
                title: "Performance Analytics", 
                desc: "Track your accuracy trends and see your brain's growth with beautiful, data-driven visualization.", 
                icon: <LineChart className="text-ocean" size={32} />,
                accent: "indigo"
              },
              { 
                title: "Weak Area Detection", 
                desc: "Our AI identifies exactly where you struggle and creates specialized 'Revision Quizzes' just for those gaps.", 
                icon: <Target className="text-ocean" size={32} />,
                accent: "blue"
              },
              { 
                title: "Smart Study Resources", 
                desc: "Not only do we test you, but we also provide curated links and sources to study the topics you missed.", 
                icon: <Sparkles className="text-ocean" size={32} />,
                accent: "cyan"
              },
              { 
                title: "Adaptive Difficulty", 
                desc: "The system gets harder as you get smarter. It constantly challenges your boundaries for maximum growth.", 
                icon: <ArrowRight className="text-ocean" size={32} />,
                accent: "indigo"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 glass rounded-[2rem] text-left border border-white/40 hover:border-ocean/50 transition-all hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-ocean/5 shadow-sm"
              >
                <div className="p-4 bg-white/50 w-fit rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-ocean transition-colors">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full max-w-5xl mx-auto p-6 mb-24">
            <div className="p-12 rounded-[3rem] bg-gradient-to-br from-ocean to-blue-700 text-white text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <h2 className="text-4xl md:text-5xl font-bold">Ready to outsmart your limits?</h2>
                <p className="text-blue-100 text-xl max-w-2xl mx-auto">
                    Join thousands of learners who are using AI to master complex topics in record time.
                </p>
                <div className="pt-4">
                    <Link href="/register" className="px-10 py-5 bg-white text-ocean rounded-2xl font-extrabold text-xl hover:bg-blue-50 transition-all inline-block shadow-xl">
                        Start Your First Quiz
                    </Link>
                </div>
            </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-12 text-center text-foreground/40 text-sm">
        <p>© 2026 AI Quiz Master. All rights reserved.</p>
      </footer>
    </div>
  );
}