export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  framework: 'static' | 'react' | 'html';
  badge: string;
  files: Record<string, string>;
}

export const TEMPLATES: Record<string, TemplateDefinition> = {
  portfolio: {
    id: 'portfolio',
    name: 'Modern Developer Portfolio',
    description: 'Clean responsive portfolio with dark/light mode, animated hero, interactive project modals, and skills radar.',
    framework: 'static',
    badge: 'Popular',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Morgan · Cloud & Full-Stack Engineer</title>
  <link rel="stylesheet" href="style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="dark">
  <div class="ambient-glow"></div>
  <header class="navbar">
    <div class="nav-brand">
      <span class="logo-mark">⚡</span>
      <span class="logo-text">AlexMorgan<span class="accent">.dev</span></span>
    </div>
    <nav class="nav-links">
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#projects">Projects</a>
      <a href="#contact" class="btn-primary-sm">Get in Touch</a>
      <button id="themeToggle" class="theme-btn" title="Toggle Theme">🌓</button>
    </nav>
  </header>

  <main>
    <section class="hero-section" id="about">
      <div class="status-pill">
        <span class="status-dot"></span> Available for Senior SRE & Full-Stack Roles
      </div>
      <h1 class="hero-title">Building <span class="gradient-text">resilient cloud infrastructure</span> & fast web applications.</h1>
      <p class="hero-sub">Specializing in distributed systems, Kubernetes orchestration, zero-downtime deployment pipelines, and modern TypeScript architectures.</p>
      <div class="hero-actions">
        <a href="#projects" class="btn-primary">View Featured Projects &rarr;</a>
        <a href="#contact" class="btn-secondary">Download Resume</a>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">99.99%</span>
          <span class="stat-label">SLA Maintained</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">&lt; 45ms</span>
          <span class="stat-label">Avg P99 Latency</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">1.4M+</span>
          <span class="stat-label">Deployments Processed</span>
        </div>
      </div>
    </section>

    <section class="skills-section" id="skills">
      <h2 class="section-title">Core Competencies</h2>
      <div class="skills-grid">
        <div class="skill-category">
          <h3>Cloud & DevOps</h3>
          <div class="chips">
            <span class="chip">Docker</span>
            <span class="chip">Kubernetes</span>
            <span class="chip">Terraform</span>
            <span class="chip">AWS</span>
            <span class="chip">CI/CD Pipelines</span>
            <span class="chip">Prometheus</span>
          </div>
        </div>
        <div class="skill-category">
          <h3>Backend Systems</h3>
          <div class="chips">
            <span class="chip">Node.js</span>
            <span class="chip">TypeScript</span>
            <span class="chip">Express</span>
            <span class="chip">MongoDB</span>
            <span class="chip">PostgreSQL</span>
            <span class="chip">Redis</span>
          </div>
        </div>
        <div class="skill-category">
          <h3>Frontend Architecture</h3>
          <div class="chips">
            <span class="chip">React 19</span>
            <span class="chip">Next.js</span>
            <span class="chip">Tailwind CSS</span>
            <span class="chip">Redux Toolkit</span>
            <span class="chip">Vite</span>
          </div>
        </div>
      </div>
    </section>

    <section class="projects-section" id="projects">
      <h2 class="section-title">Featured Engineering Work</h2>
      <div class="projects-grid">
        <article class="project-card">
          <div class="project-tag">DevOps · Real-Time</div>
          <h3>DeployFlow Engine</h3>
          <p>High-throughput SaaS automated deployment runner executing containerized builds with live stdout SSE logs streaming.</p>
          <div class="chips">
            <span class="chip">Node.js</span>
            <span class="chip">Express</span>
            <span class="chip">MongoDB</span>
            <span class="chip">Docker</span>
          </div>
          <a href="#" class="project-link" onclick="alert('You are currently viewing a live site served by DeployFlow!'); return false;">Deployed via DeployFlow &rarr;</a>
        </article>

        <article class="project-card">
          <div class="project-tag">Distributed Systems</div>
          <h3>Multi-Region Rate Limiter</h3>
          <p>Sliding-window token bucket algorithm distributed across global Redis clusters preventing abusive burst traffic.</p>
          <div class="chips">
            <span class="chip">Go</span>
            <span class="chip">Redis</span>
            <span class="chip">gRPC</span>
          </div>
          <a href="#" class="project-link" onclick="alert('Project repository is private. Ask during viva evaluation!'); return false;">View Architecture &rarr;</a>
        </article>
      </div>
    </section>

    <section class="contact-section" id="contact">
      <div class="contact-box">
        <h2>Initiate Conversation</h2>
        <p>Looking for a collaborative problem-solver for your engineering team? Send a direct dispatch.</p>
        <form id="contactForm" class="contact-form">
          <input type="text" id="contactName" placeholder="Your Name" required>
          <input type="email" id="contactEmail" placeholder="your.email@company.com" required>
          <textarea id="contactMessage" rows="3" placeholder="Project details or interview invitation..." required></textarea>
          <button type="submit" class="btn-primary">Transmit Message</button>
        </form>
        <div id="contactSuccess" class="success-message" style="display:none;">
          ✅ Thank you! Message acknowledged and dispatched to developer console.
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <p>&copy; 2026 Alex Morgan. Served continuously via <strong>DeployFlow Edge Proxy</strong>.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #090d16;
  --bg-surface: #101726;
  --bg-surface-elevated: #162035;
  --border-color: rgba(255, 255, 255, 0.08);
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #10b981;
  --accent-glow: rgba(16, 185, 129, 0.25);
}

body.light {
  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f1f5f9;
  --border-color: rgba(0, 0, 0, 0.08);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --accent-color: #059669;
  --accent-glow: rgba(5, 150, 105, 0.15);
}

body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative;
  overflow-x: hidden;
}

.ambient-glow {
  position: fixed;
  top: -150px;
  right: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px);
  background: rgba(16, 23, 38, 0.75);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
}

body.light .navbar {
  background: rgba(255, 255, 255, 0.85);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.15rem;
}

.accent {
  color: var(--accent-color);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--text-primary);
}

.theme-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-primary);
}

main {
  max-width: 1050px;
  margin: 0 auto;
  padding: 4rem 2rem;
  position: relative;
  z-index: 10;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--accent-color);
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(135deg, #34d399, #10b981, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-sub {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 680px;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary, .btn-primary-sm {
  background: var(--accent-color);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-primary-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.btn-primary:hover, .btn-primary-sm:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}

.btn-secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: var(--bg-surface-elevated);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 2rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 4rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

.skills-grid, .projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.skill-category, .project-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 1.75rem;
  border-radius: 16px;
  transition: transform 0.2s, border-color 0.2s;
}

.skill-category:hover, .project-card:hover {
  transform: translateY(-3px);
  border-color: rgba(16, 185, 129, 0.4);
}

.skill-category h3, .project-card h3 {
  font-size: 1.15rem;
  margin-bottom: 1rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.chip {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.project-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.project-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.project-link {
  display: inline-block;
  margin-top: 1.25rem;
  color: var(--accent-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
}

.contact-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 3rem 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.contact-box h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.contact-box p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.contact-form input, .contact-form textarea {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9rem;
}

.contact-form input:focus, .contact-form textarea:focus {
  outline: 2px solid var(--accent-color);
}

.success-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  border-radius: 10px;
  font-size: 0.9rem;
}

.footer {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  border-top: 1px solid var(--border-color);
}`,
      'script.js': `// Interactive theme toggle
const themeBtn = document.getElementById('themeToggle');
themeBtn?.addEventListener('click', () => {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
});

// Interactive contact form
const contactForm = document.getElementById('contactForm');
const successBox = document.getElementById('contactSuccess');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  contactForm.style.display = 'none';
  if (successBox) successBox.style.display = 'block';
});`
    }
  },

  'saas-landing': {
    id: 'saas-landing',
    name: 'SaaS Platform Landing Page',
    description: 'High-converting SaaS landing page with pricing calculator, feature tabs, and customer testimonials.',
    framework: 'static',
    badge: 'Marketing',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PulseAI · Automated Infrastructure Telemetry</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <header class="header">
    <div class="container nav-container">
      <div class="brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-name">Pulse<span class="highlight">AI</span></span>
      </div>
      <nav class="nav">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#testimonials">Reviews</a>
        <button class="btn btn-outline" onclick="alert('Demo environment live on DeployFlow!')">Sign In</button>
        <button class="btn btn-primary" onclick="alert('Registration flow triggered!')">Start Free Trial</button>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero container">
      <div class="badge">🔥 Next-Gen SRE Observability</div>
      <h1>Predict infrastructure bottlenecks <span class="gradient-text">before downtime happens</span></h1>
      <p class="subtitle">PulseAI monitors microservice latency, CPU throttling, and database connection pools in real-time with zero-instrumentation eBPF sensors.</p>
      <div class="cta-group">
        <button class="btn btn-primary btn-lg" onclick="triggerSimulator()">Run Telemetry Simulation</button>
        <button class="btn btn-secondary btn-lg" onclick="window.scrollTo({top: 800, behavior:'smooth'})">Explore Features</button>
      </div>

      <div class="preview-window">
        <div class="window-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="window-title">cluster-us-east-1 · real-time telemetry stream</span>
        </div>
        <div class="window-body">
          <div class="metrics-row">
            <div class="metric">
              <span class="label">Ingestion Rate</span>
              <span class="val" id="metricRate">24,580 req/s</span>
            </div>
            <div class="metric">
              <span class="label">P99 Latency</span>
              <span class="val green-text" id="metricLatency">18.2 ms</span>
            </div>
            <div class="metric">
              <span class="label">Cluster Health</span>
              <span class="val green-text">100% NOMINAL</span>
            </div>
          </div>
          <div class="log-stream" id="logConsole">
            <div class="log-line">[00:01] eBPF probes attached to 48 worker pods</div>
            <div class="log-line">[00:02] Anomaly detector model loaded (accuracy 99.4%)</div>
            <div class="log-line">[00:03] Stream initialized. Zero dropped packets.</div>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="pricing container">
      <h2>Simple, predictable subscription plans</h2>
      <p class="subtitle">Scale seamlessly from bootstrap startup to global multi-region enterprise.</p>
      <div class="pricing-grid">
        <div class="price-card">
          <h3>Developer</h3>
          <div class="price">$0<span>/mo</span></div>
          <p>For side-projects and prototype applications.</p>
          <ul>
            <li>✓ 10,000 monthly telemetry events</li>
            <li>✓ 1 Day log retention</li>
            <li>✓ Community Discord support</li>
          </ul>
          <button class="btn btn-outline full-width">Deploy Free</button>
        </div>

        <div class="price-card featured">
          <div class="popular-ribbon">Most Popular</div>
          <h3>Professional</h3>
          <div class="price">$49<span>/mo</span></div>
          <p>For growing SaaS engineering teams.</p>
          <ul>
            <li>✓ 2,500,000 monthly telemetry events</li>
            <li>✓ 30 Days log retention</li>
            <li>✓ Real-time Slack & PagerDuty alerts</li>
            <li>✓ AI root-cause analysis</li>
          </ul>
          <button class="btn btn-primary full-width">Start 14-Day Pro Trial</button>
        </div>

        <div class="price-card">
          <h3>Enterprise</h3>
          <div class="price">$299<span>/mo</span></div>
          <p>For mission-critical production workloads.</p>
          <ul>
            <li>✓ Unlimited telemetry events</li>
            <li>✓ 365 Days log retention</li>
            <li>✓ Dedicated SRE Solutions Architect</li>
            <li>✓ 99.99% Uptime SLA guarantee</li>
          </ul>
          <button class="btn btn-outline full-width">Contact Enterprise</button>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-content">
      <p>&copy; 2026 PulseAI Systems. Hosted on <strong>DeployFlow Multi-Tenant Cloud</strong>.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', system-ui, sans-serif; background: #0b0f19; color: #f3f4f6; line-height: 1.5; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.header { border-bottom: 1px solid rgba(255,255,255,0.08); padding: 1.25rem 0; position: sticky; top: 0; background: rgba(11,15,25,0.85); backdrop-filter: blur(12px); z-index: 50; }
.nav-container { display: flex; justify-content: space-between; align-items: center; }
.brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1.25rem; }
.highlight { color: #3b82f6; }
.nav { display: flex; align-items: center; gap: 1rem; }
.nav a { color: #9ca3af; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
.btn { padding: 0.55rem 1.15rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; }
.btn-secondary { background: #1f2937; color: #fff; }
.btn-lg { padding: 0.85rem 1.75rem; font-size: 1rem; }
.full-width { width: 100%; margin-top: 1.5rem; }
.hero { text-align: center; padding: 5rem 1.5rem 3rem; }
.badge { display: inline-block; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa; padding: 0.35rem 0.85rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1.5rem; }
h1 { font-size: 3.25rem; font-weight: 800; line-height: 1.15; max-width: 900px; margin: 0 auto 1.5rem; }
.gradient-text { background: linear-gradient(135deg, #60a5fa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { font-size: 1.15rem; color: #9ca3af; max-width: 650px; margin: 0 auto 2.5rem; }
.cta-group { display: flex; justify-content: center; gap: 1rem; margin-bottom: 3.5rem; }
.preview-window { background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; text-align: left; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
.window-header { background: #1f2937; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.5rem; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.red { background: #ef4444; } .yellow { background: #f59e0b; } .green { background: #10b981; }
.window-title { margin-left: 0.5rem; font-family: monospace; font-size: 0.75rem; color: #9ca3af; }
.window-body { padding: 1.5rem; }
.metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
.metric .label { display: block; font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; }
.metric .val { font-size: 1.5rem; font-weight: 700; }
.green-text { color: #10b981; }
.log-stream { font-family: monospace; font-size: 0.8rem; color: #9ca3af; height: 90px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.25rem; }
.log-line { color: #cbd5e1; }
.pricing { padding: 5rem 1.5rem; text-align: center; }
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 3rem; text-align: left; }
.price-card { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2rem; position: relative; }
.price-card.featured { border-color: #3b82f6; box-shadow: 0 0 25px rgba(59,130,246,0.15); }
.popular-ribbon { position: absolute; top: -12px; right: 20px; background: #3b82f6; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 999px; }
.price { font-size: 2.5rem; font-weight: 800; margin: 1rem 0; }
.price span { font-size: 1rem; color: #9ca3af; font-weight: 400; }
.price-card ul { list-style: none; margin: 1.5rem 0; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem; color: #d1d5db; }
.footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 2rem 0; text-align: center; color: #9ca3af; font-size: 0.85rem; }`,
      'script.js': `function triggerSimulator() {
  const rateEl = document.getElementById('metricRate');
  const latencyEl = document.getElementById('metricLatency');
  const consoleEl = document.getElementById('logConsole');
  const randRate = Math.floor(Math.random() * 10000 + 25000);
  const randLat = (Math.random() * 8 + 12).toFixed(1);
  if (rateEl) rateEl.textContent = randRate.toLocaleString() + ' req/s';
  if (latencyEl) latencyEl.textContent = randLat + ' ms';
  if (consoleEl) {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = '[' + time + '] Ingested batch: ' + randRate + ' events | Latency: ' + randLat + 'ms';
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}`
    }
  },

  'react-metrics': {
    id: 'react-metrics',
    name: 'Dynamic Cloud Dashboard SPA',
    description: 'Interactive web application with stateful counters, live ping latency measurement, and system telemetry.',
    framework: 'react',
    badge: 'Interactive',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudControl · Live Microservice Monitor</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <nav class="top-nav">
      <div class="logo">🚀 CloudControl SPA</div>
      <div class="node-badge" id="clusterStatus">🟢 NODE US-EAST-1 LIVE</div>
    </nav>

    <div class="dashboard-grid">
      <div class="card">
        <h3>Interactive State Counter</h3>
        <p>Testing client-side state reactivity in DeployFlow sandbox.</p>
        <div class="counter-display" id="countDisplay">0</div>
        <div class="btn-group">
          <button class="btn btn-sub" id="btnDec">- Dec</button>
          <button class="btn btn-reset" id="btnReset">Reset</button>
          <button class="btn btn-add" id="btnAdd">+ Inc</button>
        </div>
      </div>

      <div class="card">
        <h3>Live HTTP Latency Probe</h3>
        <p>Measures roundtrip edge network ping to DeployFlow server.</p>
        <div class="latency-display" id="latencyDisplay">-- ms</div>
        <button class="btn btn-full" id="btnPing">⚡ Ping Edge Proxy</button>
      </div>

      <div class="card wide">
        <h3>Workload Event Log</h3>
        <div class="terminal" id="termOutput">
          <div class="term-line info">[INIT] SPA initialized successfully from DeployFlow storage.</div>
        </div>
      </div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; min-height: 100vh; }
.top-nav { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem; margin-bottom: 2rem; }
.logo { font-size: 1.25rem; font-weight: 700; color: #38bdf8; }
.node-badge { background: #064e3b; color: #34d399; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
.dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 900px; margin: 0 auto; }
.card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; }
.card.wide { grid-column: span 2; }
.card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
.card p { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem; }
.counter-display, .latency-display { font-size: 3rem; font-weight: 800; text-align: center; color: #38bdf8; margin: 1rem 0; font-family: monospace; }
.latency-display { color: #34d399; font-size: 2.25rem; }
.btn-group { display: flex; gap: 0.5rem; justify-content: center; }
.btn { padding: 0.6rem 1.25rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.btn:hover { opacity: 0.9; }
.btn-add { background: #0284c7; color: #fff; }
.btn-sub { background: #475569; color: #fff; }
.btn-reset { background: #e11d48; color: #fff; }
.btn-full { width: 100%; background: #059669; color: #fff; padding: 0.75rem; font-size: 0.95rem; }
.terminal { background: #020617; border-radius: 8px; padding: 1rem; font-family: monospace; font-size: 0.8rem; height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.35rem; }
.term-line.info { color: #38bdf8; }
.term-line.success { color: #34d399; }`,
      'script.js': `let count = 0;
const countEl = document.getElementById('countDisplay');
const term = document.getElementById('termOutput');

function log(msg, cls='info') {
  if (!term) return;
  const line = document.createElement('div');
  line.className = 'term-line ' + cls;
  line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
  term.appendChild(line);
  term.scrollTop = term.scrollHeight;
}

document.getElementById('btnAdd')?.addEventListener('click', () => {
  count++;
  if (countEl) countEl.textContent = count;
  log('Counter incremented to ' + count, 'success');
});

document.getElementById('btnDec')?.addEventListener('click', () => {
  count--;
  if (countEl) countEl.textContent = count;
  log('Counter decremented to ' + count, 'info');
});

document.getElementById('btnReset')?.addEventListener('click', () => {
  count = 0;
  if (countEl) countEl.textContent = count;
  log('Counter reset to zero', 'info');
});

document.getElementById('btnPing')?.addEventListener('click', async () => {
  const start = performance.now();
  const latEl = document.getElementById('latencyDisplay');
  try {
    const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const duration = Math.round(performance.now() - start);
    if (latEl) latEl.textContent = duration + ' ms';
    log('Ping roundtrip: ' + duration + 'ms (HTTP ' + res.status + ')', 'success');
  } catch(e) {
    const duration = Math.round(performance.now() - start);
    if (latEl) latEl.textContent = duration + ' ms';
    log('Ping completed in ' + duration + 'ms', 'info');
  }
});`
    }
  },

  'docs': {
    id: 'docs',
    name: 'Developer API Documentation',
    description: 'Comprehensive documentation website with search, code block copy, and endpoint specifications.',
    framework: 'static',
    badge: 'Reference',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DeployFlow API Documentation v2.4</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="docs-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">📖 API Reference</div>
      <input type="text" id="searchInput" class="search-box" placeholder="Filter endpoints...">
      <ul class="nav-tree" id="navTree">
        <li class="active"><a href="#intro">Introduction</a></li>
        <li><a href="#auth">Authentication</a></li>
        <li><a href="#deployments">Deployments API</a></li>
        <li><a href="#webhooks">Webhooks</a></li>
        <li><a href="#rollbacks">Rollbacks</a></li>
      </ul>
    </aside>

    <main class="docs-content">
      <section id="intro">
        <h1>DeployFlow REST API Reference</h1>
        <p>The DeployFlow API enables programmatic orchestration of container deployments, domain mappings, environment variables, and automated build pipelines.</p>
      </section>

      <section id="deployments" style="margin-top:2.5rem;">
        <h2>Trigger Deployment</h2>
        <div class="endpoint-badge"><span class="post">POST</span> /api/projects/:id/deploy</div>
        <p>Dispatches a build pipeline for the target project from template, git repository, or uploaded archive.</p>

        <div class="code-block">
          <div class="code-header">
            <span>cURL Request Example</span>
            <button onclick="navigator.clipboard.writeText('curl -X POST https://api.deployflow.io/api/projects/proj_98x1/deploy'); alert('cURL copied!');">Copy</button>
          </div>
          <pre><code>curl -X POST https://api.deployflow.io/api/projects/proj_98x1/deploy \\
  -H "Authorization: Bearer sec_tok_live_4491" \\
  -H "Content-Type: application/json" \\
  -d '{"sourceType": "template", "templateId": "portfolio"}'</code></pre>
        </div>
      </section>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; }
.docs-layout { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: #1e293b; border-right: 1px solid #334155; padding: 1.5rem; }
.sidebar-brand { font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: #38bdf8; }
.search-box { width: 100%; background: #0f172a; border: 1px solid #475569; padding: 0.5rem; border-radius: 6px; color: #fff; margin-bottom: 1.5rem; }
.nav-tree { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-tree a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; }
.nav-tree li.active a, .nav-tree a:hover { color: #38bdf8; font-weight: 600; }
.docs-content { flex: 1; padding: 3rem; max-width: 800px; }
h1 { font-size: 2.25rem; margin-bottom: 1rem; }
h2 { font-size: 1.5rem; margin-bottom: 0.75rem; }
p { color: #94a3b8; line-height: 1.6; }
.endpoint-badge { background: #020617; border: 1px solid #334155; padding: 0.5rem 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; margin: 1rem 0; }
.endpoint-badge .post { background: #0284c7; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-right: 0.5rem; }
.code-block { background: #020617; border: 1px solid #334155; border-radius: 8px; overflow: hidden; margin-top: 1rem; }
.code-header { background: #1e293b; padding: 0.5rem 1rem; display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; }
.code-header button { background: transparent; border: 1px solid #475569; color: #fff; padding: 2px 8px; border-radius: 4px; cursor: pointer; }
pre { padding: 1rem; font-family: monospace; font-size: 0.85rem; color: #cbd5e1; overflow-x: auto; }`,
      'script.js': `document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#navTree li').forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(q) ? 'block' : 'none';
  });
});`
    }
  },

  'ecommerce': {
    id: 'ecommerce',
    name: 'Mini E-Commerce Storefront',
    description: 'Storefront with live product cart, reactive total price calculation, coupon application, and simulated checkout.',
    framework: 'static',
    badge: 'Store',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DevGear · Engineering Apparel & Tools</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="navbar">
    <div class="logo">⚡ DevGear Store</div>
    <div class="cart-trigger" id="cartBtn">🛒 Cart (<span id="cartCount">0</span>)</div>
  </header>

  <main class="container">
    <h1>Developer Hardware & Swag</h1>
    <div class="product-grid" id="productGrid"></div>
  </main>

  <div class="modal" id="cartModal" style="display:none;">
    <div class="modal-box">
      <h2>Your Cart</h2>
      <div id="cartItems">Your cart is currently empty.</div>
      <div class="total-row">Total: $<span id="cartTotal">0.00</span></div>
      <div class="modal-actions">
        <button class="btn btn-close" id="closeCart">Close</button>
        <button class="btn btn-checkout" onclick="alert('Checkout completed! Order #4812 confirmed.'); cart = []; updateCart(); document.getElementById('cartModal').style.display='none';">Instant Checkout</button>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: system-ui, sans-serif; background: #090d16; color: #f8fafc; }
.navbar { display: flex; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid #1e293b; background: #101726; }
.logo { font-size: 1.25rem; font-weight: 800; color: #10b981; }
.cart-trigger { background: #1e293b; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.container { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
h1 { margin-bottom: 2rem; font-size: 2rem; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
.product-card { background: #101726; border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; }
.product-card h3 { font-size: 1.1rem; margin: 0.5rem 0; }
.product-price { font-size: 1.25rem; font-weight: 700; color: #10b981; margin-bottom: 1rem; }
.btn { padding: 0.6rem 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-buy { background: #10b981; color: #fff; margin-top: auto; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-box { background: #101726; border: 1px solid #334155; border-radius: 14px; padding: 2rem; width: 400px; max-width: 90%; }
.total-row { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0; }
.modal-actions { display: flex; justify-content: space-between; }
.btn-close { background: #334155; color: #fff; }
.btn-checkout { background: #10b981; color: #fff; }`,
      'script.js': `const products = [
  { id: 1, name: 'SRE Mechanical Keyboard', price: 149 },
  { id: 2, name: 'Kubernetes Cloud Hoodie', price: 59 },
  { id: 3, name: 'Docker Whales Mug', price: 24 },
  { id: 4, name: 'DeployFlow Fast Track Pass', price: 99 }
];

let cart = [];
const grid = document.getElementById('productGrid');

products.forEach(p => {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = '<h3>' + p.name + '</h3><div class="product-price">$' + p.price + '</div><button class="btn btn-buy" onclick="addToCart(' + p.id + ')">Add to Cart</button>';
  grid?.appendChild(card);
});

function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (item) {
    cart.push(item);
    updateCart();
  }
}

function updateCart() {
  const count = document.getElementById('cartCount');
  const total = document.getElementById('cartTotal');
  const items = document.getElementById('cartItems');
  if (count) count.textContent = cart.length;
  const sum = cart.reduce((acc, c) => acc + c.price, 0);
  if (total) total.textContent = sum.toFixed(2);
  if (items) {
    if (cart.length === 0) {
      items.textContent = 'Your cart is currently empty.';
    } else {
      items.innerHTML = cart.map(c => '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>' + c.name + '</span><span>$' + c.price + '</span></div>').join('');
    }
  }
}

document.getElementById('cartBtn')?.addEventListener('click', () => {
  document.getElementById('cartModal').style.display = 'flex';
});

document.getElementById('closeCart')?.addEventListener('click', () => {
  document.getElementById('cartModal').style.display = 'none';
});`
    }
  }
};
