import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Baby,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  FileText,
  Heart,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Pill,
  Settings,
  Shield,
  Stethoscope,
  Syringe,
  TrendingUp,
  User,
  UserCog,
  Users
} from 'lucide-react';

// ========== TYPES ==========

export type UserRole = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT' | 'GUARDIAN';

export interface NavigationItem {
  /** URL path */
  href: string;
  /** Display label */
  label: string;
  /** Icon component */
  icon: LucideIcon;
  /** Optional description for tooltips */
  description?: string;
  /** Match exact path for active state */
  exact?: boolean;
  /** Required user roles (empty = public) */
  roles?: UserRole[];
  /** Nested navigation items */
  children?: NavigationItem[];
  /** Badge to show (count, notification, etc) */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: 'default' | 'destructive' | 'warning' | 'success';
  /** Disabled state */
  disabled?: boolean;
  /** Target for external links */
  target?: '_blank' | '_self';
  /** Rel for external links */
  rel?: string;
}

export interface NavigationGroup {
  /** Group title */
  title: string;
  /** Items in group */
  items: NavigationItem[];
  /** Collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Icon for group */
  icon?: LucideIcon;
  /** Required user roles (empty = public) */
  roles?: UserRole[];
}

// ========== UTILITIES ==========

/**
 * Check if user has required role
 */
export const hasRequiredRole = (userRole: UserRole | undefined, requiredRoles?: UserRole[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

/**
 * Get navigation items for specific role
 */
export const getNavigationByRole = (
  role: UserRole | undefined,
  items: NavigationItem[] = navigationItems
): NavigationItem[] => {
  return items.filter(item => hasRequiredRole(role, item.roles));
};

// ========== ICON MAPPING ==========

// Pre-defined icon mapping for consistent usage
export const Icons = {
  // Main navigation
  dashboard: LayoutDashboard,
  home: Home,
  guide: BookOpen,
  contributors: Users,
  contact: Mail,

  // Clinical
  patients: User,
  appointments: Calendar,
  medicalRecords: FileText,
  prescriptions: Pill,
  growth: TrendingUp,
  immunizations: Syringe,
  vitalSigns: Activity,
  diagnoses: Stethoscope,

  // Admin
  admin: Shield,
  staff: UserCog,
  doctors: Stethoscope,
  services: ClipboardList,
  settings: Settings,
  analytics: BarChart3,

  // Patient specific
  myHealth: Heart,
  myAppointments: Calendar,
  myPrescriptions: Pill,
  myGrowth: Baby,
  myRecords: FileText,

  // Utility
  help: HelpCircle,
  logout: LogOut,
  chevronDown: ChevronDown
} as const;

// ========== PUBLIC NAVIGATION ==========

/**
 * Public navigation (visible to all users)
 */
export const publicNavigation: NavigationItem[] = [
  {
    href: '/',
    icon: Icons.home,
    label: 'Home',
    exact: true,
    description: 'Return to homepage'
  },
  {
    href: '/#guide',
    icon: Icons.guide,
    label: 'Guide',
    description: 'Learn how to use Smart Clinic'
  },
  {
    href: '/#contributors',
    icon: Icons.contributors,
    label: 'Contributors',
    description: 'Meet the team behind Smart Clinic'
  },
  {
    href: '/#contact',
    icon: Icons.contact,
    label: 'Contact',
    description: 'Get in touch with us'
  }
];

// ========== AUTHENTICATED NAVIGATION ==========

/**
 * Dashboard navigation (authenticated users)
 */
export const dashboardNavigation: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        href: '/dashboard',
        icon: Icons.dashboard,
        label: 'Dashboard',
        exact: true,
        description: 'View your clinic overview'
      }
    ]
  },
  {
    title: 'Clinical',
    icon: Heart,
    items: [
      {
        href: '/dashboard/patients',
        icon: Icons.patients,
        label: 'Patients',
        description: 'Manage patient records',
        roles: ['ADMIN', 'DOCTOR', 'STAFF']
      },
      {
        href: '/dashboard/appointments',
        icon: Icons.appointments,
        label: 'Appointments',
        description: 'Schedule and manage appointments',
        roles: ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT']
      },
      {
        href: '/dashboard/medical-records',
        icon: Icons.medicalRecords,
        label: 'Medical Records',
        description: 'View and update medical records',
        roles: ['ADMIN', 'DOCTOR', 'STAFF']
      },
      {
        href: '/dashboard/prescriptions',
        icon: Icons.prescriptions,
        label: 'Prescriptions',
        description: 'Manage prescriptions',
        roles: ['ADMIN', 'DOCTOR']
      }
    ]
  },
  {
    title: 'Growth & Development',
    icon: Baby,
    items: [
      {
        href: '/dashboard/growth-charts',
        icon: Icons.growth,
        label: 'Growth Charts',
        description: 'Track patient growth (WHO standards)',
        roles: ['ADMIN', 'DOCTOR', 'STAFF']
      },
      {
        href: '/dashboard/immunizations',
        icon: Icons.immunizations,
        label: 'Immunizations',
        description: 'Manage vaccination schedules',
        roles: ['ADMIN', 'DOCTOR', 'STAFF']
      },
      {
        href: '/dashboard/vital-signs',
        icon: Icons.vitalSigns,
        label: 'Vital Signs',
        description: 'Track patient vitals',
        roles: ['ADMIN', 'DOCTOR', 'STAFF']
      }
    ]
  },
  {
    title: 'Administration',
    icon: Shield,
    roles: ['ADMIN'],
    items: [
      {
        href: '/dashboard/admin/staff',
        icon: Icons.staff,
        label: 'Staff Management',
        description: 'Manage clinic staff'
      },
      {
        href: '/dashboard/admin/doctors',
        icon: Icons.doctors,
        label: 'Doctors',
        description: 'Manage doctor profiles'
      },
      {
        href: '/dashboard/admin/services',
        icon: Icons.services,
        label: 'Services',
        description: 'Manage clinic services'
      },
      {
        href: '/dashboard/admin/analytics',
        icon: Icons.analytics,
        label: 'Analytics',
        description: 'View clinic analytics'
      },
      {
        href: '/dashboard/settings',
        icon: Icons.settings,
        label: 'Settings',
        description: 'Clinic settings'
      }
    ]
  }
];

// ========== PATIENT PORTAL NAVIGATION ==========

/**
 * Patient portal navigation (for patient role)
 */
export const patientNavigation: NavigationGroup[] = [
  {
    title: 'My Health',
    items: [
      {
        href: '/patient',
        icon: Icons.myHealth,
        label: 'Dashboard',
        exact: true
      },
      {
        href: '/patient/appointments',
        icon: Icons.myAppointments,
        label: 'My Appointments'
      },
      {
        href: '/patient/prescriptions',
        icon: Icons.myPrescriptions,
        label: 'My Prescriptions'
      },
      {
        href: '/patient/growth',
        icon: Icons.myGrowth,
        label: 'Growth Chart'
      },
      {
        href: '/patient/records',
        icon: Icons.myRecords,
        label: 'Medical Records'
      }
    ]
  }
];

// ========== FOOTER NAVIGATION ==========

/**
 * Footer navigation links
 */
export const footerNavigation = {
  product: {
    title: 'Product',
    items: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/demo', label: 'Request Demo' },
      { href: '/changelog', label: 'Changelog' }
    ]
  },
  resources: {
    title: 'Resources',
    items: [
      { href: '/docs', label: 'Documentation' },
      { href: '/api', label: 'API Reference' },
      { href: '/blog', label: 'Blog' },
      { href: '/faq', label: 'FAQ' }
    ]
  },
  company: {
    title: 'Company',
    items: [
      { href: '/about', label: 'About Us' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
      { href: '/legal', label: 'Legal' }
    ]
  },
  social: {
    title: 'Connect',
    items: [
      {
        href: 'https://twitter.com/smartclinic',
        label: 'Twitter',
        external: true
      },
      {
        href: 'https://linkedin.com/company/smartclinic',
        label: 'LinkedIn',
        external: true
      },
      {
        href: 'https://github.com/smartclinic',
        label: 'GitHub',
        external: true
      }
    ]
  }
};

// ========== MOBILE NAVIGATION ==========

/**
 * Mobile bottom navigation (for authenticated users)
 */
export const mobileBottomNav: NavigationItem[] = [
  {
    href: '/dashboard',
    icon: Icons.dashboard,
    label: 'Home',
    exact: true
  },
  {
    href: '/dashboard/patients',
    icon: Icons.patients,
    label: 'Patients'
  },
  {
    href: '/dashboard/appointments',
    icon: Icons.appointments,
    label: 'Appointments'
  },
  {
    href: '/dashboard/notifications',
    icon: Icons.contact,
    label: 'Alerts',
    badge: 3,
    badgeVariant: 'destructive'
  },
  {
    href: '/dashboard/profile',
    icon: Icons.settings,
    label: 'Profile'
  }
];

// ========== USER MENU ITEMS ==========

/**
 * User dropdown menu items
 */
export const userMenuItems: NavigationItem[] = [
  {
    href: '/dashboard/profile',
    icon: User,
    label: 'Profile',
    description: 'Manage your account'
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Settings',
    description: 'App preferences'
  },
  {
    href: '/help',
    icon: HelpCircle,
    label: 'Help & Support',
    description: 'Get help'
  },
  {
    href: '/logout',
    icon: LogOut,
    label: 'Logout',
    description: 'Sign out of your account'
  }
];

// ========== MAIN EXPORT ==========

/**
 * Main navigation configuration
 * Combines all navigation items with role-based access
 */
export const navigationItems: NavigationItem[] = [
  ...publicNavigation,
  // Dashboard items (protected)
  {
    href: '/dashboard',
    icon: Icons.dashboard,
    label: 'Dashboard',
    roles: ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT'],
    children: [
      {
        href: '/dashboard/patients',
        icon: Icons.patients,
        label: 'Patients',
        roles: ['ADMIN', 'DOCTOR', 'STAFF']
      },
      {
        href: '/dashboard/appointments',
        icon: Icons.appointments,
        label: 'Appointments',
        roles: ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT']
      },
      {
        href: '/dashboard/prescriptions',
        icon: Icons.prescriptions,
        label: 'Prescriptions',
        roles: ['ADMIN', 'DOCTOR']
      }
    ]
  }
];

// ========== HELPER FUNCTIONS ==========

/**
 * Find navigation item by href
 */
export const findNavigationItem = (
  href: string,
  items: NavigationItem[] = navigationItems
): NavigationItem | undefined => {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.children) {
      const found = findNavigationItem(href, item.children);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Get breadcrumb items for current path
 */
export const getBreadcrumbs = (
  path: string,
  items: NavigationItem[] = navigationItems,
  breadcrumbs: NavigationItem[] = []
): NavigationItem[] => {
  for (const item of items) {
    if (path.startsWith(item.href)) {
      const newBreadcrumbs = [...breadcrumbs, item];
      if (item.href === path || !item.children) {
        return newBreadcrumbs;
      }
      if (item.children) {
        return getBreadcrumbs(path, item.children, newBreadcrumbs);
      }
    }
  }
  return breadcrumbs;
};

/**
 * Check if navigation item is active
 */
export const isActiveRoute = (item: NavigationItem, currentPath: string): boolean => {
  if (item.exact) {
    return currentPath === item.href;
  }
  return currentPath.startsWith(item.href);
};

// ========== DEFAULT EXPORT ==========

export default navigationItems;
