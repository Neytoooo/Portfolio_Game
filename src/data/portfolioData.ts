export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: "saas" | "3d" | "fullstack";
  desc: string;
  features: string[];
  tech: string[];
  github?: string;
  preview?: string;
  statusText: string;
  featured?: boolean;
}

export interface EducationItem {
  school: string;
  title: string;
  period: string;
  desc: string;
  skills: string[];
  current?: boolean;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  desc: string;
  achievements: string[];
  skills: string[];
}

export interface TechWatchItem {
  title: string;
  text: string;
  tag: string;
}

export interface SkillGroup {
  title: string;
  color: string;
  skills: { name: string; highlight?: boolean }[];
}

export const PORTFOLIO_DATA = {
  profile: {
    firstName: "Mattis",
    lastName: "Kohen",
    role: "Développeur Full Stack & Créateur Web",
    education: "Mastère Ingénierie du Web à l'ESGI Paris 12",
    availability: "Recherche Alternance 2026-2027 • Rythme 1 sem / 3 sem",
    bio: "Étudiant en Mastère Ingénierie du Web à l'ESGI. Spécialisé dans l'écosystème JavaScript / TypeScript (Next.js 15, React 19, Node.js), je conçois et déploie des SaaS complets, des interfaces 3D immersives et j'intègre l'IA dans les workflows modernes.",
    email: "mattiskhn@gmail.com",
    phone: "0784189635",
    phoneDisplay: "07 84 18 96 35",
    githubUrl: "https://github.com/Neytoooo",
    githubUser: "Neytoooo",
    location: "Paris / Île-de-France",
    cvPath: "/cv/Mattis_kohen_cv_2026.pdf",
    tags: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Three.js",
      "Supabase",
      "Node.js",
      "Prisma",
    ],
  },

  projects: [
    {
      id: "trame",
      title: "Trame",
      subtitle: "SaaS de Gestion de Chantier BTP",
      category: "saas",
      desc: "Plateforme SaaS tout-en-un pour les entreprises du bâtiment : tableau de bord analytique, CRM client, automatisation des étapes de chantier et facturation professionnelle.",
      features: [
        "Schéma de données relationnel complexe & performant",
        "Workflows automatisés pour le suivi d'étapes de chantier",
        "Facturation, devis et gestion client en temps réel",
      ],
      tech: ["Next.js", "TypeScript", "Supabase", "Prisma", "Vercel"],
      github: "https://github.com/Neytoooo/Trame",
      preview: "https://trame-kohl.vercel.app",
      statusText: "V1 Live • V2 en cours",
      featured: true,
    },
    {
      id: "3d-planet",
      title: "Prototype Jeu Vidéo 3D",
      subtitle: "Système Planétaire Interactif",
      category: "3d",
      desc: "Prototypage 3D temps réel explorant des mécaniques avancées de déplacement, de placement de structures sur une surface sphérique et de contrôles dynamiques de caméra.",
      features: [
        "Placement d'entités sur géométrie sphérique complexe",
        "Scripts de mouvement et physique orbitale temps réel",
        "Rendu carrousel 3D planétaire immersif WebGL",
      ],
      tech: ["Three.js", "React Three Fiber", "Supabase", "Prisma", "WebGL"],
      statusText: "R&D 3D Interactive",
      featured: true,
    },
    {
      id: "sponsio",
      title: "Sponsio",
      subtitle: "Plateforme SaaS Ad-Tech",
      category: "saas",
      desc: "Solution SaaS dédiée aux créateurs de contenu pour monétiser et automatiser la vente d'espaces publicitaires via un widget intelligent autonome.",
      features: [
        "Widget publicitaire intégrable en 1 seule ligne de code",
        "Tunnel de paiement Stripe complet & gestion d'abonnements",
        "Gestion d'assets multimédias optimisée via Cloudinary",
      ],
      tech: ["Next.js 15", "Supabase", "Prisma", "Stripe", "Cloudinary"],
      preview: "https://sloty-app.vercel.app",
      statusText: "V1 en ligne",
      featured: true,
    },
    {
      id: "blanktrack",
      title: "blankTrack",
      subtitle: "Application de Suivi de Transactions",
      category: "fullstack",
      desc: "Application web dédiée à la traçabilité et l'analyse de flux financiers avec architecture full stack réactive et reporting en temps réel.",
      features: [
        "Interface utilisateur réactive (CRUD transactions complet)",
        "Gestion de base de données MongoDB optimisée",
        "Déploiement et intégration continue via Vercel",
      ],
      tech: ["Next.js", "TypeScript", "TailwindCSS", "MongoDB", "Vercel"],
      github: "https://github.com/Neytoooo/transactions-app",
      preview: "https://transactions-app-three.vercel.app",
      statusText: "En production",
    },
    {
      id: "btp-landing",
      title: "BTP Landing",
      subtitle: "Landing Page Vitrine Haut de Gamme",
      category: "fullstack",
      desc: "Vitrine moderne conçue pour les professionnels du bâtiment, alliant haute performance, fluidité visuelle et conversion commerciale.",
      features: [
        "Animations interactives et micro-interactions soignées",
        "Design System sombre et moderne adapté aux pros",
        "Score de performance Lighthouse optimal (SEO, accessibilité)",
      ],
      tech: ["Next.js", "TailwindCSS", "Framer Motion", "Vercel"],
      github: "https://github.com/Neytoooo/btp-landing",
      preview: "https://btp-landing.vercel.app/?v=v6",
      statusText: "En ligne",
    },
  ] as ProjectItem[],

  skillGroups: [
    {
      title: "Frontend & Mobile",
      color: "from-cyan-500 to-blue-500",
      skills: [
        { name: "Next.js 15", highlight: true },
        { name: "React 19", highlight: true },
        { name: "TypeScript", highlight: true },
        { name: "React Native", highlight: false },
        { name: "TailwindCSS", highlight: true },
        { name: "Vue.js", highlight: false },
        { name: "HTML5 / CSS3", highlight: false },
      ],
    },
    {
      title: "Backend & Bases de Données",
      color: "from-emerald-500 to-teal-500",
      skills: [
        { name: "Node.js", highlight: true },
        { name: "Supabase", highlight: true },
        { name: "Prisma ORM", highlight: true },
        { name: "MongoDB", highlight: true },
        { name: "PostgreSQL", highlight: false },
        { name: "MySQL / MariaDB", highlight: false },
        { name: "PHP / Laravel", highlight: false },
        { name: "Symfony", highlight: false },
      ],
    },
    {
      title: "3D & Interfaces Dynamiques",
      color: "from-purple-500 to-pink-500",
      skills: [
        { name: "Three.js", highlight: true },
        { name: "React Three Fiber", highlight: true },
        { name: "Framer Motion", highlight: true },
        { name: "WebGL", highlight: true },
        { name: "Design Systems", highlight: false },
        { name: "Figma", highlight: false },
      ],
    },
    {
      title: "DevOps, Cloud & Outils",
      color: "from-amber-500 to-orange-500",
      skills: [
        { name: "Git / GitHub", highlight: true },
        { name: "Vercel Deployments", highlight: true },
        { name: "Stripe API & Webhooks", highlight: true },
        { name: "Docker", highlight: false },
        { name: "Cloudinary", highlight: false },
        { name: "IA & LLMs Workflows", highlight: true },
      ],
    },
  ] as SkillGroup[],

  education: [
    {
      school: "ESGI Paris 12",
      title: "Mastère Ingénierie du Web",
      period: "Septembre 2025 – Août 2027",
      desc: "Formation d'excellence axée sur l'architecture logicielle, les frameworks modernes, la scalabilité et les architectures cloud.",
      skills: ["Next.js", "Node.js", "MongoDB", "React", "TypeScript"],
      current: true,
    },
    {
      school: "DEF Troyes",
      title: "Bachelor en Ingénierie des SI",
      period: "Septembre 2024 – Août 2025",
      desc: "Conception logicielle avancée, développement web & mobile multiplateforme et gestion de bases de données relationnelles.",
      skills: ["Next.js", "Laravel", "React Native", "MongoDB", "TailwindCSS"],
    },
    {
      school: "ETNA Ivry-sur-Seine",
      title: "Intégrateur & Développeur Web",
      period: "Septembre 2021 – Janvier 2023",
      desc: "Fondamentaux du développement web full stack, architectures MVC, POO et intégration UI responsive.",
      skills: ["Laravel", "Symfony", "React", "Node.js", "MySQL", "PHP"],
    },
  ] as EducationItem[],

  experiences: [
    {
      company: "Atita",
      role: "Développeur Full Stack",
      period: "2023 – 2024 • Paris 16",
      desc: "Refonte et modernisation complète de l'intranet d'entreprise.",
      achievements: [
        "Développement de tableaux de bord et formulaires dynamiques pour faciliter le travail quotidien.",
        "Création de modules de gestion documentaire, notifications internes et filtres avancés.",
        "Autonomie, rigueur et respect des contraintes de production en environnement réel.",
      ],
      skills: ["Next.js", "TypeScript", "Node.js", "SQL", "TailwindCSS"],
    },
    {
      company: "Paris Partners Softwares",
      role: "Développeur Full Stack",
      period: "2021 – 2022 • Courbevoie",
      desc: "Évolution de l'intranet client et participation aux projets applicatifs de l'entreprise.",
      achievements: [
        "Développement de nouveaux modules destinés au suivi client et reporting interne centralisé.",
        "Mise en place d'un prototype moderne en Vue.js préparant l'industrialisation du produit.",
        "Travail en équipe technique garantissant la cohérence du code et les bonnes pratiques.",
      ],
      skills: ["Vue.js", "PHP", "Laravel", "MySQL", "Git"],
    },
  ] as ExperienceItem[],

  techWatch: [
    {
      title: "Frameworks & Rendu Hybride",
      text: "Suivi continu des évolutions de Next.js, React 19 et Nuxt.js (moteur Nitro, streaming SSR, Server Components et optimisation du TTFB).",
      tag: "Performance & Architecture",
    },
    {
      title: "IA & Automatisation du Dev",
      text: "Intégration d'outils génératifs, Copilot et agents de code dans le workflow quotidien pour accélérer les tests et le prototypage d'idées.",
      tag: "Productivité & IA",
    },
    {
      title: "Motion Design & 3D Interactive",
      text: "Création d'expériences riches via Three.js, React Three Fiber, React Native et animations fluides avec un soin méticuleux sur le micro-feedback.",
      tag: "UI/UX & WebGL",
    },
  ] as TechWatchItem[],
};
