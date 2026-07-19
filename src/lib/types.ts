export type VegFlag = "veg" | "nonveg" | "egg";

export type PaymentMethod = "upi" | "cash";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  veg: VegFlag;
  popular?: boolean;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  veg: VegFlag;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "cash_on_delivery";
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  discountPercent?: number;
  discountAmount?: number;
  /** Kitchen should notice newly appended items without resetting cook status. */
  needsKitchenAck?: boolean;
  /** Set by automated tests so nightly cleanup can delete safely. */
  isTest?: boolean;
}
