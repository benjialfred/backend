
// --- USER TYPES (Aligned with API) ---
export interface User {
  id: string; // Updated to string to match api.ts
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  photo_profil: string;
  role: UserRole;
  ville?: string;
  pays?: string; // Made optional to match existing usages if any
  adresse_livraison?: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  is_active?: boolean; // Kept from old definition just in case
  measurements?: any; // Added for customized client measurements
}

export type UserRole = 'CLIENT' | 'APPRENTI' | 'WORKER' | 'ADMIN' | 'SUPER_ADMIN';

// --- PRODUCT TYPES (Legacy/French - Aligned with mockData and components) ---
export interface ProductComment {
  id: number;
  user_name: string;
  user_photo?: string;
  text: string;
  rating: number;
  created_at: string;
}

export interface Product {
  sku: string;
  id: number;
  nom: string;
  description: string;
  prix: number;
  prix_promotion: number | null;
  stock: number;
  style?: string;
  image_principale: string;
  image?: string;
  images?: any[];
  galerie_images?: any[];
  galerie_images_list?: { id: number; image: string; ordre: number }[];
  images_supplementaires?: string[];
  category_id: number;
  category?: Category | number;
  categorie?: Category | any;
  taille?: string;
  tailles_disponibles?: string[];
  couleur?: string;
  is_featured: boolean;
  is_active: boolean;
  model_id?: number;
  description_detaillee?: string;
  details?: string;
  materiau?: string;
  entretien?: string;
  notes?: string;
  dimensions?: string;
  poids?: string;
  // New fields
  suggestions_utilisation?: string;
  consignes_securite?: string;
  is_favorite?: boolean;
  comments_list?: ProductComment[];
  comments_count?: number;
  average_rating?: number;
}

export interface Category {
  id: number;
  nom: string;
  description: string;
  image_url: string;
  is_active?: boolean;
}

export interface Model {
  id: number;
  nom: string;
  description: string;
  images: string[];
  category_id: number;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_name: string;
  user_photo?: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
}

// --- ORDER TYPES (Legacy) ---
// --- ORDER TYPES ---
export interface OrderItem {
  id: number;
  product_id?: number; // Correspond to 'product' foreign key
  product_name: string;
  product_sku: string;
  product_price: number;
  quantity: number;
  total_price: number;
  custom_measurements?: any;
  custom_notes?: string;
  product_image?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user: number;
  user_email?: string;
  user_full_name?: string;
  status: string;
  production_state?: string;
  production_deadline?: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  subtotal?: number;
  shipping_cost?: number;
  tax?: number;
  total_amount: number;
  shipping_address?: any;
  billing_address?: any;
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  items?: OrderItem[];
  item_count?: number;
  is_paid?: boolean;
  can_be_cancelled?: boolean;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'paid'
  | 'cutting'
  | 'sewing'
  | 'fitting'
  | 'in_production'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface UserMeasurements {
  height?: number;
  bust?: number;
  waist?: number;
  hips?: number;

  shoulder_width?: number;
  arm_length?: number;
  leg_length?: number;
  back_length?: number;
  chest_width?: number;

  notes?: string;
  last_updated?: string;
}

// --- DASHBOARD TYPES ---
export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  orders_today?: number;
  revenue_this_month?: number;
  active_apprentices: number;
  total_withdrawn?: number;
  available_balance?: number;
}

// --- FORMS & OTHER TYPES ---
export interface RegisterFormData {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  ville: string;
  pays: string;
  adresse_livraison: string;
  acceptTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
  otp?: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  count?: number;
  next?: string;
  previous?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh?: string;
  message: string;
}

export interface JWTAuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface ErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'number';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean | string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  created_at: string;
}

export type NotificationType = 'COMMANDE' | 'PAIEMENT' | 'LIVRAISON' | 'SYSTEME' | 'PROMOTION' | 'SECURITE';

// --- WORKER & APPRENTICE TYPES ---
export interface Worker {
  id: string;
  user_id: string;
  fonction: WorkerFunction;
  groupe: GroupType;
  created_at: string;
  updated_at: string;
}

export type WorkerFunction = 'COORDINATEUR' | 'SUPERVISEUR' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'LOGISTIQUE';
export type GroupType = 'PRODUCTION' | 'QUALITE' | 'LIVRAISON' | 'SUPPORT' | 'CREATION';

export interface Apprentice {
  id: string;
  user_id: string;
  grade: ApprenticeGrade;
  completed_training?: boolean;
  created_at: string;
  updated_at: string;
}

export type ApprenticeGrade = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'MAITRE';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_details?: {
    nom: string;
    prenom: string;
  };
  target_role: string;
  is_public: boolean;
  expires_at?: string;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  status: string; // Simplified for flexibility
  owner: string; // ID
  owner_details?: User;
  date_added: string;
}

export interface DailyJournal {
  id: string;
  apprentice: string;
  apprentice_name?: string;
  date: string;
  content: string;
  supervisor_feedback?: string;
  created_at: string;
}

export interface WorkerGroup {
  id: string;
  name: string;
  description?: string;
  leader: string;
  leader_details?: User;
  members: string[]; // IDs
  members_details?: User[];
  created_at: string;
}

export interface WorkerProject {
  id: string;
  worker: string;
  worker_name?: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  tasks?: WorkerTask[];
  created_at: string;
}

export interface WorkerTask {
  id: string;
  project: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigned_to: string | null;
  assigned_to_name?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface GroupInvitation {
  id: string;
  sender: string;
  sender_name?: string;
  recipient_email: string;
  group: string;
  group_name?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  token: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'DEFILE' | 'SOUTENANCE' | 'DON' | 'PARTENARIAT' | 'AUTRE';
  image: string;
  date: string;
  location?: string;
  is_active: boolean;
  created_at: string;
}

export interface Withdrawal {
  id: number;
  user: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  details?: string;
  created_at: string;
  updated_at: string;
}